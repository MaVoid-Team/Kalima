"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserDashboard } from "../../../routes/auth-services"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { createLecture, createLectureAttachment } from "../../../routes/lectures"
import { getAllLectures } from "../../../routes/lectures"
import LectureCreationModal from "../../../components/LectureCreationModal"

const MyLecturesPage = () => {
  const [lectures, setLectures] = useState([])
  const [allLectures, setAllLectures] = useState([]) // Store all lectures before pagination
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [renderError, setRenderError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creationLoading, setCreationLoading] = useState(false)

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("")
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch subjects and levels first (needed for all roles for the modal/filters)
        const subjectsRes = await getAllSubjects()
        const levelsRes = await getAllLevels()

        // Handle subjects fetch result
        if (subjectsRes.success) {
          setSubjects(subjectsRes.data || [])
        } else {
          console.error("Failed to fetch subjects:", subjectsRes.error)
          setSubjects([])
          setError("فشل في تحميل المواد، لكن يمكنك المتابعة.")
        }

        // Handle levels fetch result
        if (levelsRes.success) {
          setLevels(levelsRes.data || [])
        } else {
          console.error("Failed to fetch levels:", levelsRes.error)
          setLevels([])
          setError((prev) => (prev ? `${prev}` : "فشل في تحميل المستويات، لكن يمكنك المتابعة."))
        }

        // Fetch dashboard data to get user role
        const result = await getUserDashboard({
          params: { fields: "userInfo,containers,purchaseHistory", limit: 200 },
        })

        if (result.success) {
          const { userInfo } = result.data.data
          setUserRole(userInfo.role)
          setUserId(userInfo.id)

          // Different data fetching based on user role
          if (["Admin", "Subadmin", "Moderator"].includes(userInfo.role)) {
            // For admin roles, fetch all lectures
            const allLecturesResult = await getAllLectures({
              limit: 200,
            })

            if (allLecturesResult.status === "success") {
              const lecturesData = allLecturesResult.data.containers.map((lecture) => ({
                id: lecture._id,
                name: lecture.name,
                subject: lecture.subject,
                level: lecture.level,
                price: lecture.price,
                videoLink: lecture.videoLink,
                lecture_type: lecture.lecture_type,
                requiresExam: lecture.requiresExam,
                examConfig: lecture.examConfig,
                lecturer: lecture.createdBy,
              }))

              setAllLectures(lecturesData)
            } else {
              console.error("Failed to fetch all lectures:", allLecturesResult)
              setError("فشل في تحميل جميع المحاضرات")
            }
          } else if (userInfo.role === "Lecturer") {
            // For lecturers, use the containers from dashboard
            const lecturesData =
              result.data.data.containers
                ?.filter((c) => c.type === "lecture")
                .map((lecture) => ({
                  id: lecture._id,
                  name: lecture.name,
                  subject: lecture.subject,
                  level: lecture.level,
                  price: lecture.price,
                  videoLink: lecture.videoLink,
                  lecture_type: lecture.lecture_type,
                  requiresExam: lecture.requiresExam,
                  examConfig: lecture.examConfig,
                  lecturer: userInfo,
                })) || []

            setAllLectures(lecturesData)
          } else if (userInfo.role === "Student") {
            // For students, use the purchase history
            const lecturesData =
              result.data.data.purchaseHistory
                ?.filter((p) => p.container?.type === "lecture")
                .map((p) => ({
                  id: p.container?._id || p._id,
                  name: p.container?.name || p.description.replace("Purchased container ", "").split(" for ")[0],
                  price: p.points,
                  videoLink: p.container?.videoLink,
                  lecture_type: p.container?.lecture_type,
                  purchasedAt: new Date(p.purchasedAt).toLocaleString("en-gb", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  lecturer: p.lecturer,
                  subject: p.container?.subject,
                  level: p.container?.level,
                })) || []

            setAllLectures(lecturesData)
          }
        } else {
          setError("فشل في تحميل بيانات المستخدم، لكن يمكنك المتابعة.")
        }
      } catch (err) {
        console.error("Error in fetchInitialData:", err)
        setError("فشل في تحميل البيانات، لكن يمكنك المتابعة.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Apply filters and pagination whenever filters, page, or allLectures changes
  useEffect(() => {
    if (allLectures.length > 0) {
      // Apply filters - but only for non-admin roles
      let filteredLectures = [...allLectures]

      // Skip filtering for admin roles to avoid duplicates
      if (!["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        if (selectedSubjectFilter) {
          filteredLectures = filteredLectures.filter((l) => l.subject?._id === selectedSubjectFilter)
        }

        if (selectedLevelFilter) {
          filteredLectures = filteredLectures.filter((l) => l.level?._id === selectedLevelFilter)
        }
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedLectures = filteredLectures.slice(startIndex, startIndex + itemsPerPage)

      setLectures(paginatedLectures)
      setTotalPages(Math.ceil(filteredLectures.length / itemsPerPage))
    }
  }, [allLectures, selectedSubjectFilter, selectedLevelFilter, currentPage, itemsPerPage, userRole])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleCreateLecture = async (lectureData, attachmentFile, attachmentType) => {
    setCreationLoading(true)
    setError(null)

    try {
      console.log("Creating lecture with data:", lectureData)
      const response = await createLecture(lectureData)
      console.log("Create lecture response:", response)

      if (response.status !== "success" && response.success !== true) {
        throw new Error(response.message || "فشل في إنشاء المحاضرة")
      }

      // Extract the lecture ID from the response
      let lectureId = null
      if (response.data && response.data.lecture && response.data.lecture._id) {
        lectureId = response.data.lecture._id
      } else if (response.data && response.data._id) {
        lectureId = response.data._id
      } else if (response.data && response.data.lecture && response.data.lecture.id) {
        lectureId = response.data.lecture.id
      } else if (response.data && response.data.id) {
        lectureId = response.data.id
      }

      // Handle attachment after successful lecture creation
      if (attachmentFile && lectureId) {
        try {
          console.log("Uploading attachment for lecture ID:", lectureId)
          const attachmentData = {
            type: attachmentType,
            attachment: attachmentFile,
          }

          const attachmentResponse = await createLectureAttachment(lectureId, attachmentData)
          console.log("Attachment upload response:", attachmentResponse)
        } catch (attachmentError) {
          console.error("Error uploading attachment:", attachmentError)
          setError(`تم إنشاء المحاضرة ولكن فشل تحميل المرفق: ${attachmentError.message}`)
        }
      }

      // Refresh lectures after creating a new one
      if (["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        const allLecturesResult = await getAllLectures()
        if (allLecturesResult.status === "success") {
          const lecturesData = allLecturesResult.data.containers.map((lecture) => ({
            id: lecture._id,
            name: lecture.name,
            subject: lecture.subject,
            level: lecture.level,
            price: lecture.price,
            videoLink: lecture.videoLink,
            lecture_type: lecture.lecture_type,
            requiresExam: lecture.requiresExam,
            examConfig: lecture.examConfig,
            lecturer: lecture.createdBy,
          }))

          setAllLectures(lecturesData)
        }
      } else if (userRole === "Lecturer") {
        const result = await getUserDashboard({
          params: { fields: "userInfo,containers,purchaseHistory", limit: 100 },
        })

        if (result.success) {
          const lecturesData =
            result.data.data.containers
              ?.filter((c) => c.type === "lecture")
              .map((lecture) => ({
                id: lecture._id,
                name: lecture.name,
                subject: lecture.subject,
                level: lecture.level,
                price: lecture.price,
                videoLink: lecture.videoLink,
                lecture_type: lecture.lecture_type,
                requiresExam: lecture.requiresExam,
                examConfig: lecture.examConfig,
                lecturer: result.data.data.userInfo,
              })) || []

          setAllLectures(lecturesData)
        }
      }

      return true
    } catch (err) {
      setError("فشل إنشاء المحاضرة: " + err.message)
      return false
    } finally {
      setCreationLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )

  // Basic error boundary for rendering
  try {
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <h1 className="text-2xl font-bold mb-2">
          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole) ? "إدارة المحاضرات" : "المحاضرات المشتراة"}
        </h1>
        <p className="text-sm opacity-80 mt-2 mb-5">تفاصيل كل محاضراتي</p>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              إغلاق
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <select
              className="select select-bordered w-full md:w-64"
              value={selectedSubjectFilter}
              onChange={(e) => {
                setSelectedSubjectFilter(e.target.value)
                setCurrentPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="">كل المواد</option>
              {subjects &&
                subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
            </select>

            <select
              className="select select-bordered w-full md:w-64"
              value={selectedLevelFilter}
              onChange={(e) => {
                setSelectedLevelFilter(e.target.value)
                setCurrentPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="">كل المستويات</option>
              {levels &&
                levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
            </select>
          </div>

          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole) && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              إنشاء محاضرة جديدة
            </button>
          )}

          <select
            className="select select-bordered w-full md:w-48"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10 لكل صفحة</option>
            <option value={20}>20 لكل صفحة</option>
            <option value={50}>50 لكل صفحة</option>
          </select>
        </div>

        {/* Lecture Creation Modal */}
        <LectureCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateLecture}
          containerId={null}
          userId={userId}
          containerLevel={null}
          containerSubject={null}
          containerType="month" // Set to "month" to enable lecture creation
        />

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>الاسم</th>
                {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && <th>المحاضر</th>}
                <th>المادة</th>
                <th>المستوى</th>
                <th>النوع</th>
                <th>السعر</th>
                {userRole === "Student" && <th>تاريخ الشراء</th>}
                {userRole !== "Student" && <th>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {lectures &&
                lectures.map((lecture) => (
                  <tr key={lecture.id}>
                    <td>{lecture.name}</td>
                    {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && (
                      <td>{lecture.lecturer?.name || "غير معروف"}</td>
                    )}
                    <td>{lecture.subject?.name || "غير محدد"}</td>
                    <td>{lecture.level?.name || "غير محدد"}</td>
                    <td>{lecture.lecture_type === "Paid" ? "مدفوعة" : "مراجعة"}</td>
                    <td>{lecture.price || 0} نقطة</td>
                    {userRole === "Student" && <td>{lecture.purchasedAt}</td>}
                    <td>
                      {userRole === "Student" ? (
                        <Link to={`/dashboard/student-dashboard/lecture-display/${lecture.id}`}>
                          <button className="btn btn-ghost">التفاصيل</button>
                        </Link>
                      ) : (
                        <Link to={`/dashboard/lecturer-dashboard/detailed-lecture-view/${lecture.id}`}>
                          <button className="btn btn-ghost">التفاصيل</button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {lectures.length === 0 && (
          <div className="alert alert-info mt-4">
            <span>
              {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole)
                ? "لا توجد محاضرات متاحة"
                : "لم تقم بشراء أي محاضرات بعد"}
            </span>
          </div>
        )}

        {totalPages > 1 && (
          <div className="join flex justify-center mt-4">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              السابق
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show at most 5 page buttons
              let pageNum
              if (totalPages <= 5) {
                // If 5 or fewer pages, show all
                pageNum = i + 1
              } else if (currentPage <= 3) {
                // If near the start, show first 5 pages
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5 pages
                pageNum = totalPages - 4 + i
              } else {
                // Otherwise show 2 before and 2 after current page
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={i}
                  className={`join-item btn ${currentPage === pageNum ? "btn-active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    )
  } catch (err) {
    console.error("Render error in MyLecturesPage:", err)
    setRenderError("حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.")
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <div className="alert alert-error">
          <span>{renderError}</span>
        </div>
      </div>
    )
  }
}

export default MyLecturesPage
