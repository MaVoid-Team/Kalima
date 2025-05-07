"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById, getLectureAttachments, deleteLecture } from "../../../routes/lectures"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { getUserDashboard } from "../../../routes/auth-services"
import {
  FiArrowLeft,
  FiDownload,
  FiEye,
  FiFileText,
  FiDollarSign,
  FiUser,
  FiBook,
  FiLayers,
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi"

const DetailedLectureView = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const [lecture, setLecture] = useState(null)
  const [attachments, setAttachments] = useState({
    booklets: [],
    pdfsandimages: [],
    homeworks: [],
    exams: [],
  })
  const [subjects, setSubjects] = useState([]) // Initialize as empty array
  const [levels, setLevels] = useState([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // Fetch user role first
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const result = await getUserDashboard()
        if (result.success) {
          setUserRole(result.data.data.userInfo.role)
        } else {
          console.error("Failed to fetch user role:", result)
        }
      } catch (err) {
        console.error("Error fetching user role:", err)
      }
    }

    fetchUserRole()
  }, [])

  // Fetch lecture data, attachments, subjects, and levels
  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch subjects
        const subjectsResult = await getAllSubjects()
        if (subjectsResult.success) {
          setSubjects(subjectsResult.data || [])
        } else {
          console.error("Failed to fetch subjects:", subjectsResult.error)
          setError((prev) =>
            prev ? `${prev}. فشل في تحميل المواد، لكن يمكنك المتابعة.` : "فشل في تحميل المواد، لكن يمكنك المتابعة.",
          )
        }

        // Fetch levels
        const levelsResult = await getAllLevels()
        if (levelsResult.success) {
          setLevels(levelsResult.data || [])
        } else {
          console.error("Failed to fetch levels:", levelsResult.error)
          setError((prev) =>
            prev
              ? `${prev}. فشل في تحميل المستويات، لكن يمكنك المتابعة.`
              : "فشل في تحميل المستويات، لكن يمكنك المتابعة.",
          )
        }

        // Fetch lecture details
        const lectureResult = await getLectureById(lectureId)

        if (typeof lectureResult === "string") {
          setError(lectureResult)
          return
        }

        if (lectureResult.success) {
          setLecture(lectureResult.data.container)

          // Fetch lecture attachments
          const attachmentsResult = await getLectureAttachments(lectureId)

          if (typeof attachmentsResult === "string") {
            console.error("Attachment error:", attachmentsResult)
            setError((prev) => (prev ? `${prev}. ${attachmentsResult}` : attachmentsResult))
          } else if (attachmentsResult.status === "success") {
            setAttachments(attachmentsResult.data)
          } else {
            console.error("Failed to fetch attachments:", attachmentsResult)
          }
        } else {
          setError("Failed to fetch lecture details")
        }
      } catch (err) {
        console.error("Error in fetchLectureData:", err)
        setError(`Failed to load lecture data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (lectureId) {
      fetchLectureData()
    }
  }, [lectureId])

  // Helper function to get subject name
  const getSubjectName = () => {
    if (!lecture || !lecture.subject) return "غير محدد"

    // If subject is an object with name property
    if (lecture.subject.name) return lecture.subject.name

    // If subject is an ID, find it in the subjects array
    const subjectId = typeof lecture.subject === "object" ? lecture.subject._id : lecture.subject
    const foundSubject = subjects.find((s) => s._id === subjectId)

    return foundSubject ? foundSubject.name : "غير محدد"
  }

  // Helper function to get level name
  const getLevelName = () => {
    if (!lecture || !lecture.level) return "غير محدد"

    // If level is an object with name property
    if (lecture.level.name) return lecture.level.name

    // If level is an ID, find it in the levels array
    const levelId = typeof lecture.level === "object" ? lecture.level._id : lecture.level
    const foundLevel = levels.find((l) => l._id === levelId)

    return foundLevel ? foundLevel.name : "غير محدد"
  }

  // Handle attachment download
  const handleDownloadAttachment = (attachment) => {
    const link = document.createElement("a")
    link.href = attachment.filePath
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle lecture deletion
  const handleDeleteLecture = async () => {
    try {
      setDeleteLoading(true)
      setDeleteError(null)

      const result = await deleteLecture(lectureId)
      console.log(result)
      if (result.success) {
        // Navigate back to the lectures list page after successful deletion
        navigate("/dashboard/lecturer-dashboard")
      } else {
        setDeleteError(result.message || "Failed to delete lecture")
        setShowDeleteModal(false)
      }
    } catch (err) {
      console.error("Error deleting lecture:", err)
      setDeleteError("An unexpected error occurred while deleting the lecture")
      setShowDeleteModal(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Render attachment list
  const renderAttachments = (attachmentList, title, icon) => {
    if (!attachmentList || attachmentList.length === 0) {
      return null
    }

    const Icon = icon

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon className="text-primary" />
          {title}
        </h3>
        <div className="bg-base-200 rounded-lg p-4">
          <ul className="divide-y divide-base-300">
            {attachmentList.map((attachment) => (
              <li key={attachment._id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span className="text-base-content/80">{attachment.fileName}</span>
                  <span className="text-xs bg-base-300 px-2 py-1 rounded">
                    {(attachment.fileSize / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={attachment.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    <FiEye className="mr-1" /> عرض
                  </a>
                  <button onClick={() => handleDownloadAttachment(attachment)} className="btn btn-sm btn-primary">
                    <FiDownload className="mr-1" /> تحميل
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <div className="alert alert-error">
          <FiX className="w-6 h-6" />
          <span>{error}</span>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-outline mt-4">
          <FiArrowLeft className="ml-2" /> العودة
        </button>
      </div>
    )
  }

  // No lecture found
  if (!lecture) {
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <div className="alert alert-warning">
          <span>لم يتم العثور على المحاضرة المطلوبة</span>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-outline mt-4">
          <FiArrowLeft className="ml-2" /> العودة
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{lecture.name}</h1>
          <span className={`badge ${lecture.lecture_type === "Paid" ? "badge-primary" : "badge-secondary"}`}>
            {lecture.lecture_type === "Paid" ? "مدفوعة" : "مراجعة"}
          </span>
        </div>

        {/* Admin/Lecturer Actions */}
        {["Admin", "Lecturer", "Subadmin", "Moderator"].includes(userRole) && (
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm">تعديل المحاضرة</button>
            <button className="btn btn-error btn-sm" onClick={() => setShowDeleteModal(true)}>
              حذف المحاضرة
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FiAlertTriangle className="text-error" />
              تأكيد حذف المحاضرة
            </h3>
            <p className="py-4">
              هل أنت متأكد من رغبتك في حذف محاضرة "{lecture.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            {deleteError && (
              <div className="alert alert-error mt-2">
                <FiX className="w-5 h-5" />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                إلغاء
              </button>
              <button className="btn btn-error" onClick={handleDeleteLecture} disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    جاري الحذف...
                  </>
                ) : (
                  "تأكيد الحذف"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <FiFileText className="text-primary" />
              وصف المحاضرة
            </h2>
            <div className="bg-base-200 rounded-lg p-4">
              <p className="whitespace-pre-line">{lecture.description || "لا يوجد وصف متاح"}</p>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">المرفقات</h2>
            {renderAttachments(attachments.booklets, "الكتيبات", FiBook)}
            {renderAttachments(attachments.pdfsandimages, "الملفات والصور", FiFileText)}
            {renderAttachments(attachments.homeworks, "الواجبات", FiBook)}
            {renderAttachments(attachments.exams, "الامتحانات", FiFileText)}

            {!attachments.booklets?.length &&
              !attachments.pdfsandimages?.length &&
              !attachments.homeworks?.length &&
              !attachments.exams?.length && (
                <div className="alert alert-info">
                  <span>لا توجد مرفقات لهذه المحاضرة</span>
                </div>
              )}

            {/* Add Attachment Button (for admin/lecturer) */}
            {["Admin", "Lecturer", "Subadmin", "Moderator"].includes(userRole) && (
              <button className="btn btn-outline btn-sm mt-4">إضافة مرفق جديد</button>
            )}
          </div>
        </div>

        {/* Sidebar - Lecture Details */}
        <div className="lg:col-span-1">
          <div className="bg-base-200 rounded-lg p-4 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">تفاصيل المحاضرة</h2>

            <ul className="space-y-4">
              {/* Price */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  <FiDollarSign className="text-primary" />
                </div>
                <div>
                  <span className="text-sm text-base-content/70">السعر</span>
                  <p className="font-medium">{lecture.price} نقطة</p>
                </div>
              </li>

              {/* Created By */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  <FiUser className="text-primary" />
                </div>
                <div>
                  <span className="text-sm text-base-content/70">المحاضر</span>
                  <p className="font-medium">{lecture.createdBy?.name || "غير معروف"}</p>
                </div>
              </li>

              {/* Subject */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  <FiBook className="text-primary" />
                </div>
                <div>
                  <span className="text-sm text-base-content/70">المادة</span>
                  <p className="font-medium">{getSubjectName()}</p>
                </div>
              </li>

              {/* Level */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  <FiLayers className="text-primary" />
                </div>
                <div>
                  <span className="text-sm text-base-content/70">المستوى</span>
                  <p className="font-medium">{getLevelName()}</p>
                </div>
              </li>

              {/* Views */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  <FiEye className="text-primary" />
                </div>
                <div>
                  <span className="text-sm text-base-content/70">عدد المشاهدات</span>
                  <p className="font-medium">{lecture.numberOfViews || 0}</p>
                </div>
              </li>

              {/* Teacher Allowed */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  {lecture.teacherAllowed ? <FiCheck className="text-success" /> : <FiEyeOff className="text-error" />}
                </div>
                <div>
                  <span className="text-sm text-base-content/70">مسموح للمعلمين</span>
                  <p className="font-medium">{lecture.teacherAllowed ? "نعم" : "لا"}</p>
                </div>
              </li>

              {/* Requires Exam */}
              <li className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-lg">
                  {lecture.requiresExam ? <FiCheck className="text-success" /> : <FiX className="text-error" />}
                </div>
                <div>
                  <span className="text-sm text-base-content/70">يتطلب امتحان</span>
                  <p className="font-medium">{lecture.requiresExam ? "نعم" : "لا"}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedLectureView
