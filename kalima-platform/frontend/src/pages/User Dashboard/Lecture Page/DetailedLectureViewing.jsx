"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById, getLectureAttachments, deleteLecture } from "../../../routes/lectures"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { getUserDashboard } from "../../../routes/auth-services"
import { getStudentSubmissionsByLectureId } from "../../../routes/examsAndHomeworks"
import { getAllStudentLectureAccess, updateStudentLectureAccess } from "../../../routes/student-lecture-access"
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
  FiUpload,
  FiUsers,
  FiFile,
  FiInfo,
  FiEdit,
  FiClock,
  FiSave,
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
  const [userId, setUserId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState(null)
  const [viewingSubmission, setViewingSubmission] = useState(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const fileViewerRef = useRef(null)

  // Student lecture access states
  const [studentLectureAccesses, setStudentLectureAccesses] = useState([])
  const [accessesLoading, setAccessesLoading] = useState(false)
  const [accessesError, setAccessesError] = useState(null)
  const [editingAccessId, setEditingAccessId] = useState(null)
  const [remainingViews, setRemainingViews] = useState(0)
  const [updateAccessLoading, setUpdateAccessLoading] = useState(false)
  const [updateAccessError, setUpdateAccessError] = useState(null)
  const [updateAccessSuccess, setUpdateAccessSuccess] = useState(false)

  // Check if user has admin-like privileges
  const hasAdminPrivileges = ["Lecturer", "Assistant", "Admin", "SubAdmin", "Moderator"].includes(userRole)

  // Fetch user role and ID first
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getUserDashboard()
        if (result.success) {
          setUserRole(result.data.data.userInfo.role)
          setUserId(result.data.data.userInfo.id)
        } else {
          console.error("Failed to fetch user data:", result)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    fetchUserData()
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

  // Fetch student submissions
  useEffect(() => {
    const fetchStudentSubmissions = async () => {
      if (!lectureId || !userRole || !userId) {
        return
      }

      try {
        setSubmissionsLoading(true)
        setSubmissionsError(null)

        const result = await getStudentSubmissionsByLectureId(lectureId)

        if (result.success) {
          // Store all submissions if user has admin privileges
          // Otherwise, filter to only show the current user's submissions
          if (hasAdminPrivileges) {
            setStudentSubmissions(result.data.students || [])
          } else {
            // Filter submissions to only show the current user's
            const userSubmissions = (result.data.students || []).filter(
              (studentData) => studentData.student._id === userId,
            )
            setStudentSubmissions(userSubmissions)
          }
        } else {
          setSubmissionsError(result.error || "Failed to fetch student submissions")
        }
      } catch (err) {
        console.error("Error fetching student submissions:", err)
        setSubmissionsError("An unexpected error occurred while fetching student submissions")
      } finally {
        setSubmissionsLoading(false)
      }
    }

    fetchStudentSubmissions()
  }, [lectureId, userRole, userId, hasAdminPrivileges])

  // Fetch student lecture accesses
  useEffect(() => {
    const fetchStudentLectureAccesses = async () => {
      if (!lectureId || !userRole || !hasAdminPrivileges) {
        return
      }

      try {
        setAccessesLoading(true)
        setAccessesError(null)

        const result = await getAllStudentLectureAccess(lectureId)

        if (result.success) {
          setStudentLectureAccesses(result.data || [])
        } else {
          setAccessesError(result.error || "Failed to fetch student lecture accesses")
        }
      } catch (err) {
        console.error("Error fetching student lecture accesses:", err)
        setAccessesError("An unexpected error occurred while fetching student lecture accesses")
      } finally {
        setAccessesLoading(false)
      }
    }

    fetchStudentLectureAccesses()
  }, [lectureId, userRole, hasAdminPrivileges])

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

  // Handle viewing a submission
  const handleViewSubmission = (submission) => {
    setViewingSubmission(submission)
    setShowSubmissionModal(true)
  }

  // Handle editing student lecture access
  const handleEditAccess = (access) => {
    setEditingAccessId(access._id)
    setRemainingViews(access.remainingViews)
    setUpdateAccessError(null)
    setUpdateAccessSuccess(false)
  }

  // Handle saving updated student lecture access
  const handleSaveAccess = async () => {
    try {
      setUpdateAccessLoading(true)
      setUpdateAccessError(null)
      setUpdateAccessSuccess(false)

      const result = await updateStudentLectureAccess(editingAccessId, {
        remainingViews: remainingViews,
      })

      if (result.success) {
        // Update the local state with the new data
        setStudentLectureAccesses((prevAccesses) =>
          prevAccesses.map((access) =>
            access._id === editingAccessId ? { ...access, remainingViews: remainingViews } : access,
          ),
        )
        setUpdateAccessSuccess(true)

        // Reset editing state after a short delay
        setTimeout(() => {
          setEditingAccessId(null)
          setUpdateAccessSuccess(false)
        }, 2000)
      } else {
        setUpdateAccessError(result.error)
      }
    } catch (err) {
      console.error("Error updating student lecture access:", err)
      setUpdateAccessError("An unexpected error occurred while updating student lecture access")
    } finally {
      setUpdateAccessLoading(false)
    }
  }

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingAccessId(null)
    setUpdateAccessError(null)
    setUpdateAccessSuccess(false)
  }

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) {
      return "pdf"
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "doc"
    } else if (fileType.includes("sheet") || fileType.includes("excel")) {
      return "xls"
    } else if (fileType.includes("presentation") || fileType.includes("powerpoint")) {
      return "ppt"
    } else if (fileType.includes("image")) {
      return "img"
    } else {
      return "file"
    }
  }

  // Handle lecture deletion
  const handleDeleteLecture = async () => {
    try {
      setDeleteLoading(true)
      setDeleteError(null)

      const result = await deleteLecture(lectureId)
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

  // Format date to local string
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("ar-EG", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "تاريخ غير صالح"
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
        {hasAdminPrivileges && (
          <div className="flex gap-2">
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

      {/* Submission Viewer Modal */}
      {showSubmissionModal && viewingSubmission && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl w-11/12 h-5/6 max-h-screen">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <FiFile className="text-primary" />
              {viewingSubmission.fileName}
            </h3>

            <div className="bg-base-200 rounded-lg p-2 mb-4 text-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>
                  النوع: <span className="font-medium">{viewingSubmission.fileType}</span>
                </span>
                <span>
                  الحجم: <span className="font-medium">{(viewingSubmission.fileSize / 1024).toFixed(2)} KB</span>
                </span>
                <span>
                  تاريخ الرفع:{" "}
                  <span className="font-medium">
                    {new Date(viewingSubmission.uploadedOn).toLocaleDateString("ar-EG")}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-base-300 rounded-lg overflow-hidden h-[calc(100%-8rem)] flex items-center justify-center">
              {/* File preview based on file type */}
              {viewingSubmission.fileType.includes("image") ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={`data:${viewingSubmission.fileType};base64,${viewingSubmission.fileData}`}
                    alt={viewingSubmission.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : viewingSubmission.fileType.includes("pdf") ? (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full bg-white rounded shadow-inner flex items-center justify-center">
                    <div className="text-center p-8">
                      <FiFileText className="w-16 h-16 mx-auto text-primary mb-4" />
                      <p className="font-medium mb-2">ملف PDF</p>
                      <p className="text-sm opacity-70 mb-4">
                        لا يمكن عرض محتوى ملف PDF مباشرة. يرجى تنزيل الملف لعرضه.
                      </p>
                    </div>
                  </div>
                </div>
              ) : viewingSubmission.fileType.includes("word") || viewingSubmission.fileType.includes("document") ? (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full bg-white rounded shadow-inner flex items-center justify-center">
                    <div className="text-center p-8">
                      <FiFileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                      <p className="font-medium mb-2">مستند Word</p>
                      <p className="text-sm opacity-70 mb-4">
                        لا يمكن عرض محتوى مستند Word مباشرة. يرجى تنزيل الملف لعرضه.
                      </p>
                    </div>
                  </div>
                </div>
              ) : viewingSubmission.fileType.includes("sheet") || viewingSubmission.fileType.includes("excel") ? (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full bg-white rounded shadow-inner flex items-center justify-center">
                    <div className="text-center p-8">
                      <FiFileText className="w-16 h-16 mx-auto text-green-600 mb-4" />
                      <p className="font-medium mb-2">جدول بيانات Excel</p>
                      <p className="text-sm opacity-70 mb-4">
                        لا يمكن عرض محتوى جدول البيانات مباشرة. يرجى تنزيل الملف لعرضه.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full bg-white rounded shadow-inner flex items-center justify-center">
                    <div className="text-center p-8">
                      <FiFile className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                      <p className="font-medium mb-2">ملف غير مدعوم للعرض</p>
                      <p className="text-sm opacity-70 mb-4">
                        لا يمكن عرض محتوى هذا النوع من الملفات مباشرة. يرجى تنزيل الملف لعرضه.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setShowSubmissionModal(false)}>
                إغلاق
              </button>
              <a
                href={`data:${viewingSubmission.fileType};base64,${viewingSubmission.fileData}`}
                download={viewingSubmission.fileName}
                className="btn btn-primary"
              >
                <FiDownload className="ml-2" />
                تنزيل الملف
              </a>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSubmissionModal(false)}>close</button>
          </form>
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

          {/* Student Lecture Access - Only visible to admin users */}
          {hasAdminPrivileges && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FiUsers className="text-primary" />
                وصول الطلاب للمحاضرة
              </h2>

              {accessesLoading ? (
                <div className="flex justify-center py-8 bg-base-200 rounded-lg">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : accessesError ? (
                <div className="alert alert-error">
                  <FiX className="w-5 h-5" />
                  <span>{accessesError}</span>
                </div>
              ) : studentLectureAccesses.length > 0 ? (
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>الطالب</th>
                          <th>المشاهدات المتبقية</th>
                          <th>آخر وصول</th>
                          <th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentLectureAccesses.map((access) => (
                          <tr key={access._id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="avatar avatar-placeholder">
                                  <div className="bg-primary text-primary-content rounded-full w-8">
                                    <span>{access.student.name.charAt(0)}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{access.student.name}</div>
                                  <div className="text-xs opacity-70">{access.student.role}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {editingAccessId === access._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    className="input input-bordered input-sm w-20"
                                    value={remainingViews}
                                    onChange={(e) => setRemainingViews(Number.parseInt(e.target.value) || 0)}
                                    min="0"
                                  />
                                  {updateAccessError && <span className="text-xs text-error">{updateAccessError}</span>}
                                  {updateAccessSuccess && (
                                    <span className="text-xs text-success">تم التحديث بنجاح</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{access.remainingViews}</span>
                                  <span className="text-xs opacity-70">مشاهدة</span>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <FiClock className="text-primary w-4 h-4" />
                                <span>{formatDate(access.lastAccessed)}</span>
                              </div>
                            </td>
                            <td>
                              {editingAccessId === access._id ? (
                                <div className="flex gap-2">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={handleSaveAccess}
                                    disabled={updateAccessLoading}
                                  >
                                    {updateAccessLoading ? (
                                      <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                      <FiSave className="w-4 h-4" />
                                    )}
                                    حفظ
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={handleCancelEdit}
                                    disabled={updateAccessLoading}
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-outline" onClick={() => handleEditAccess(access)}>
                                  <FiEdit className="w-4 h-4 ml-1" />
                                  تعديل
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  <FiInfo className="w-5 h-5" />
                  <span>لا يوجد طلاب لديهم حق الوصول لهذه المحاضرة</span>
                </div>
              )}
            </div>
          )}

          {/* Student Submissions */}
          {(hasAdminPrivileges || userRole === "Student") && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FiUpload className="text-primary" />
                {hasAdminPrivileges ? "واجبات الطلاب" : "واجباتي المرفوعة"}
              </h2>

              {submissionsLoading ? (
                <div className="flex justify-center py-8 bg-base-200 rounded-lg">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : submissionsError ? (
                <div className="alert alert-error">
                  <FiX className="w-5 h-5" />
                  <span>{submissionsError}</span>
                </div>
              ) : studentSubmissions.length > 0 ? (
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>الطالب</th>
                          <th>الملفات المرفوعة</th>
                          <th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentSubmissions.map((studentData) => (
                          <tr key={studentData.student._id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="avatar avatar-placeholder">
                                  <div className="bg-primary text-primary-content rounded-full w-8">
                                    <span>{studentData.student.name.charAt(0)}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{studentData.student.name}</div>
                                  <div className="text-sm opacity-70">{studentData.student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {studentData.submissions.length > 0 ? (
                                <div className="space-y-2">
                                  {studentData.submissions.map((submission) => (
                                    <div key={submission._id} className="flex items-center gap-2">
                                      <div className="bg-base-300 p-1 rounded">
                                        <FiFile className="text-primary" />
                                      </div>
                                      <span className="text-sm">{submission.fileName}</span>
                                      <span className="text-xs bg-base-300 px-2 py-1 rounded">
                                        {(submission.fileSize / 1024).toFixed(2)} KB
                                      </span>
                                      <span className="text-xs opacity-70">
                                        {new Date(submission.uploadedOn).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm opacity-70">لم يتم رفع أي ملفات</span>
                              )}
                            </td>
                            <td>
                              {studentData.submissions.length > 0 ? (
                                <div className="flex gap-2">
                                  {studentData.submissions.map((submission) => (
                                    <button
                                      key={submission._id}
                                      onClick={() =>
                                        handleViewSubmission({
                                          ...submission,
                                          // This is a placeholder for file data that would come from an API
                                          // In a real implementation, you would fetch this from the backend
                                          fileData: null,
                                        })
                                      }
                                      className="btn btn-sm btn-primary"
                                    >
                                      <FiEye className="mr-1" />
                                      عرض
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-disabled">لا توجد ملفات</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : userRole === "Student" ? (
                <div className="alert alert-info">
                  <FiInfo className="w-5 h-5" />
                  <span>لم تقم برفع أي واجبات لهذه المحاضرة بعد</span>
                </div>
              ) : (
                <div className="alert alert-info">
                  <FiUsers className="w-5 h-5" />
                  <span>لم يقم أي طالب برفع واجبات لهذه المحاضرة بعد</span>
                </div>
              )}

              {/* Upload Homework Button (for students) */}
              {userRole === "Student" && (
                <div className="mt-4">
                  <button className="btn btn-outline btn-primary">
                    <FiUpload className="ml-2" />
                    رفع واجب جديد
                  </button>
                </div>
              )}
            </div>
          )}

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
