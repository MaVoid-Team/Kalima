"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserDashboard } from "../../../routes/auth-services"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { createLecture } from "../../../routes/lectures"
import { getAllLectures } from "../../../routes/lectures" // Import the getAllLectures function

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
  const [formData, setFormData] = useState({
    name: "",
    type: "lecture",
    createdBy: "",
    level: "",
    subject: "",
    price: 0,
    description: "",
    numberOfViews: 3,
    videoLink: "",
    teacherAllowed: true,
    lecture_type: "Paid",
    requiresExam: false,
    examConfig: "",
    passingThreshold: 50,
  })
  const [formError, setFormError] = useState(null)
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
        console.log(levelsRes)

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
          console.log(levels)
        } else {
          console.error("Failed to fetch levels:", levelsRes.error)
          setLevels([])
          setError((prev) => (prev ? `${prev}` : "فشل في تحميل المستويات، لكن يمكنك المتابعة."))
        }

        // Fetch dashboard data to get user role
        const result = await getUserDashboard({
          params: { fields: "userInfo,containers,purchaseHistory", limit: 100 },
        })

        if (result.success) {
          const { userInfo } = result.data.data
          setUserRole(userInfo.role)
          setUserId(userInfo.id)
          setFormData((prev) => ({ ...prev, createdBy: userInfo.id }))

          // Different data fetching based on user role
          if (["Admin", "Subadmin", "Moderator"].includes(userInfo.role)) {
            // For admin roles, fetch all lectures
            const allLecturesResult = await getAllLectures()
            console.log("All lectures response:", allLecturesResult)

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCreateLecture = async () => {
    if (!formData.name || !formData.level || !formData.subject || !formData.videoLink) {
      setFormError("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    if (formData.requiresExam && !formData.examConfig) {
      setFormError("يرجى إدخال رابط ملف الامتحان")
      return
    }

    setFormError(null)

    try {
      const lectureData = {
        name: formData.name,
        type: formData.type,
        createdBy: formData.createdBy,
        level: formData.level,
        subject: formData.subject,
        price: Number(formData.price),
        description: formData.description,
        numberOfViews: Number(formData.numberOfViews),
        videoLink: formData.videoLink,
        teacherAllowed: formData.teacherAllowed,
        lecture_type: formData.lecture_type,
        requiresExam: formData.requiresExam,
      }

      if (formData.requiresExam) {
        lectureData.examConfig = formData.examConfig
        lectureData.passingThreshold = Number(formData.passingThreshold)
      }

      const response = await createLecture(lectureData)
      console.log("Create Lecture Response:", response)

      if (response.status === "success") {
        setShowCreateModal(false)
        setFormData({
          name: "",
          type: "lecture",
          createdBy: formData.createdBy,
          level: "",
          subject: "",
          price: 0,
          description: "",
          numberOfViews: 3,
          videoLink: "",
          teacherAllowed: true,
          lecture_type: "Paid",
          requiresExam: false,
          examConfig: "",
          passingThreshold: 50,
        })

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
      } else {
        setFormError("فشل إنشاء المحاضرة")
      }
    } catch (err) {
      setFormError("فشل إنشاء المحاضرة: " + err.message)
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
        <h1 className="text-2xl font-bold mb-6">
          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole) ? "إدارة المحاضرات" : "المحاضرات المشتراة"}
        </h1>

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

        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg">إنشاء محاضرة جديدة</h3>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">اسم المحاضرة</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">نوع المحاضرة</span>
                    </label>
                    <select
                      name="lecture_type"
                      value={formData.lecture_type}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="Paid">مدفوعة</option>
                      <option value="Revision">مراجعة</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">المستوى</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">اختر المستوى</option>
                      {levels &&
                        levels.map((level) => (
                          <option key={level._id} value={level._id}>
                            {level.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">المادة</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">اختر المادة</option>
                      {subjects &&
                        subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">السعر</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                      disabled={formData.lecture_type === "Revision"}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">رابط الفيديو</span>
                    </label>
                    <input
                      type="url"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="https://example.com/video"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">الوصف</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">تحتاج إلى امتحان؟</span>
                      <input
                        type="checkbox"
                        name="requiresExam"
                        checked={formData.requiresExam}
                        onChange={handleInputChange}
                        className="checkbox"
                      />
                    </label>
                  </div>

                  {formData.requiresExam && (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">رابط ملف الامتحان</span>
                        </label>
                        <input
                          type="url"
                          name="examConfig"
                          value={formData.examConfig}
                          onChange={handleInputChange}
                          className="input input-bordered"
                          placeholder="https://example.com/exam-config"
                          required={formData.requiresExam}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">عتبة النجاح (%)</span>
                        </label>
                        <input
                          type="number"
                          name="passingThreshold"
                          value={formData.passingThreshold}
                          onChange={handleInputChange}
                          className="input input-bordered"
                          min="0"
                          max="100"
                          required={formData.requiresExam}
                        />
                      </div>
                    </>
                  )}
                </div>

                {formError && <div className="alert alert-error mt-2">{formError}</div>}
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowCreateModal(false)}>
                  إلغاء
                </button>
                <button className="btn btn-primary" onClick={handleCreateLecture}>
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        )}

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
                    {userRole === "Student" ? "" : 
                      (
                        <Link to={`/dashboard/lecturer-dashboard/detailed-lecture-view/${lecture.id}`}>
                            <button className="btn btn-ghost">التفاصيل</button>
                        </Link>
                      )
                      }
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
