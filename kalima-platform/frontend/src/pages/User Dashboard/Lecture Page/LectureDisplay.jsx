"use client"

import {
  checkLectureAccess,
  verifyExamSubmission,
} from "../../../routes/examsAndHomeworks"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getLectureById,
  getLectureAttachments,
  downloadAttachmentById,
  createLectureAttachment,
} from "../../../routes/lectures"
import {
  checkLectureAccess,
  verifyExamSubmission,
} from "../../../routes/examsAndHomeworks"
import {
  uploadHomework,
  getLectureHomeworks,} from "../../../routes/homeworks"
import { getUserDashboard } from "../../../routes/auth-services"
import { getStudentLectureAccessByLectureId, updateStudentLectureAccess } from "../../../routes/student-lecture-access"
import { FiUpload, FiFile, FiX, FiCheck, FiEye, FiLink, FiAlertTriangle, FiExternalLink, FiAward } from "react-icons/fi"

// Vidstack imports
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react"
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default"
import "@vidstack/react/player/styles/default/theme.css"
import "@vidstack/react/player/styles/default/layouts/video.css"

// Helper function to extract YouTube Video ID
const getYouTubeId = (url) => {
  if (!url) return null
  let videoId = null
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === "youtu.be") {
      // Handles youtu.be short links
      videoId = parsedUrl.pathname.slice(1)
    } else if (parsedUrl.hostname.includes("youtube.com")) {
      // Handles youtube.com links
      videoId = parsedUrl.searchParams.get("v")
    } else if (parsedUrl.pathname.includes("/embed/")) {
      // Handles youtube.com/embed links
      videoId = parsedUrl.pathname.split("/").pop()
    }
  } catch (e) {
    console.warn("Could not parse YouTube URL with standard new URL(), trying regex:", e)
  }

  if (!videoId) {
    // Fallback regex for various URL formats
    const patterns = [
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        videoId = match[1]
        break
      }
    }
  }
  return videoId
}

const LectureDisplay = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attachments, setAttachments] = useState({
    exams: [],
    booklets: [],
    homeworks: [],
    pdfsandimages: [],
  })
  const [allAttachments, setAllAttachments] = useState([])
  const [showFiftyPercentWarning, setShowFiftyPercentWarning] = useState(false)
  const [remainingViews, setRemainingViews] = useState(null)
  const [studentLectureAccessId, setStudentLectureAccessId] = useState(null)
  const [videoBlocked, setVideoBlocked] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)

  // Exam verification states
  const [examVerified, setExamVerified] = useState(false)
  const [examVerificationLoading, setExamVerificationLoading] = useState(false)
  const [examRequired, setExamRequired] = useState(false)
  const [examData, setExamData] = useState(null)
  const [examSubmission, setExamSubmission] = useState(null)

  // Attachment tabs and uploads
  const [activeTab, setActiveTab] = useState("pdfsandimages")
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Homework state
  const [homeworkFiles, setHomeworkFiles] = useState([])
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false)
  const [homeworkSuccess, setHomeworkSuccess] = useState(false)
  const [homeworkSubmitType, setHomeworkSubmitType] = useState("file") // "file" or "form"
  const [homeworkError, setHomeworkError] = useState(null)
  const [homeworks, setHomeworks] = useState([])
  const homeworkFileInputRef = useRef(null)

  const playerRef = useRef(null)
  const lastUpdateTimeRef = useRef(0)
  const hasViewedRef = useRef(false)
  const redirectTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  // Check if user has permission to upload files
  const hasUploadPermission = () => {
    const allowedRoles = ["Lecturer", "Admin", "SubAdmin", "Moderator", "Assistant"]
    return userRole && allowedRoles.includes(userRole)
  }

  // Fetch user data first
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const dashboardResult = await getUserDashboard()
        if (dashboardResult.success) {
          const { userInfo } = dashboardResult.data.data
          setUserRole(userInfo.role)
          setUserId(userInfo.id)
        } else {
          console.error("Failed to fetch user data:", dashboardResult.error)
          setError("Failed to authenticate user")
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to authenticate user")
      }
    }
    fetchUserData()
  }, [])

  // Fetch lecture data and attachments
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getLectureById(lectureId)
        if (result.success) {
          const lectureData = result.data.container
          setLecture(lectureData)
        } else {
          setError(result.error || "Failed to load lecture")
        }
      } catch (err) {
        setError("Failed to load lecture. Please try again later.")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    const fetchAttachments = async () => {
      try {
        const result = await getLectureAttachments(lectureId)
        if (result.status === "success") {
          console.log("FULL API RESPONSE:", result)

          // Set the entire data object with all attachment types
          setAttachments(result.data)

          // Create a flat array of all attachments for simple display
          const allAttachmentsArray = [
            ...(result.data.pdfsandimages || []),
            ...(result.data.homeworks || []),
            ...(result.data.exams || []),
            ...(result.data.booklets || []),
          ]

          console.log("ALL ATTACHMENTS ARRAY:", allAttachmentsArray)
          setAllAttachments(allAttachmentsArray)
        } else {
          console.error("Failed to fetch attachments:", result.message)
        }
      } catch (err) {
        console.error("Error fetching attachments:", err)
      }
    }

    // Fetch homeworks if user has permission
    const fetchHomeworks = async () => {
      if (!hasUploadPermission()) return

      try {
        const result = await getLectureHomeworks(lectureId)
        if (result.success) {
          setHomeworks(result.data.attachments || [])
        } else {
          console.error("Failed to fetch homeworks:", result.error)
        }
      } catch (err) {
        console.error("Error fetching homeworks:", err)
      }
    }

    if (lectureId) {
      fetchLecture()
      fetchAttachments()
      fetchHomeworks()
    }
  }, [lectureId, userId, userRole])

  // Verify exam submission and check lecture access for students
  useEffect(() => {
    const verifyExamAndCheckAccess = async () => {
      if (userRole !== "Student" || !lectureId) return

      try {
        setExamVerificationLoading(true)

        // First check if the lecture requires an exam
        const accessResult = await checkLectureAccess(lectureId)

        if (accessResult.status === "restricted" && accessResult.data?.requiresExam) {
          // Lecture requires an exam
          setExamRequired(true)
          setExamData(accessResult.data)

          // Now verify if the student has passed the exam
          const verificationResult = await verifyExamSubmission(lectureId)

          if (verificationResult.success && verificationResult.status === "success") {
            // Student has passed the exam
            setExamVerified(true)
            setExamSubmission(verificationResult.data.submission)
          } else {
            // Student has not passed the exam
            setExamVerified(false)
          }
        } else {
          // No exam required or already passed
          setExamRequired(false)
          setExamVerified(true)
        }
      } catch (err) {
        console.error("Error verifying exam submission:", err)
      } finally {
        setExamVerificationLoading(false)
      }
    }

    verifyExamAndCheckAccess()
  }, [lectureId, userRole])

  // Fetch student access data - only for students
  useEffect(() => {
    const fetchAccessData = async () => {
      if (
        userRole === "Lecturer" ||
        userRole === "Admin" ||
        userRole === "SubAdmin" ||
        userRole === "Moderator" ||
        userRole === "Assistant"
      )
        return

      try {
        // Use the new function to fetch student lecture access by lecture ID
        const result = await getStudentLectureAccessByLectureId(lectureId)

        if (result.success && result.data.accessRecords && result.data.accessRecords.length > 0) {
          // Get the first access record (assuming there's only one per student)
          const accessRecord = result.data.accessRecords[0]

          setRemainingViews(accessRecord.remainingViews)
          setStudentLectureAccessId(accessRecord._id)

          if (accessRecord.remainingViews <= 0) {
            setVideoBlocked(true)
            redirectTimeoutRef.current = setTimeout(() => navigate(-1), 180000)
          }
        } else {
          setError("لا تملك صلاحية الوصول إلى هذه المحاضرة")
        }
      } catch (error) {
        console.error("Error fetching access data:", error)
        setError("فشل تحميل بيانات الوصول")
      }
    }

    if (lectureId && userRole === "Student") {
      fetchAccessData()
    }
  }, [lectureId, navigate, userRole])

  // Reset upload states when changing tabs
  useEffect(() => {
    setUploadingFiles([])
    setUploadError(null)
    setUploadSuccess(false)
  }, [activeTab])

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer
    if (uploadSuccess) {
      timer = setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [uploadSuccess])

  // Clear homework success message after 3 seconds
  useEffect(() => {
    let timer
    if (homeworkSuccess) {
      timer = setTimeout(() => {
        setHomeworkSuccess(false)
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [homeworkSuccess])

  // Vidstack Player Logic
  const youtubeVideoId = lecture ? getYouTubeId(lecture.videoLink) : null

  const handleOnCanPlay = () => {
    const player = playerRef.current
    if (!player) return

    const savedTime = localStorage.getItem(`lecture_${lectureId}_vidstack_time`)
    if (savedTime) {
      try {
        const parsedTime = Number.parseFloat(savedTime)
        if (!isNaN(parsedTime) && parsedTime > 0 && parsedTime < player.duration) {
          player.currentTime = parsedTime
        } else if (parsedTime >= player.duration) {
          localStorage.removeItem(`lecture_${lectureId}_vidstack_time`)
        }
      } catch (e) {
        console.error("Error parsing saved time:", e)
        localStorage.removeItem(`lecture_${lectureId}_vidstack_time`)
      }
    }
  }

  const handleOnPlay = async () => {
    if (userRole !== "Student" || hasViewedRef.current || (remainingViews !== null && remainingViews <= 0)) return

    try {
      hasViewedRef.current = true

      // Use the updateStudentLectureAccess function
      const response = await updateStudentLectureAccess(studentLectureAccessId, {
        remainingViews: remainingViews - 1,
      })

      if (response.success) {
        setRemainingViews(response.data.remainingViews)
        if (response.data.remainingViews <= 0) {
          setVideoBlocked(true)
          playerRef.current?.pause()
          alert("انتهت عدد مشاهداتك لهذه المحاضرة!")
          redirectTimeoutRef.current = setTimeout(() => navigate(-1), 180000)
        }
      } else {
        hasViewedRef.current = false
      }
    } catch (error) {
      console.error("View update error:", error)
      hasViewedRef.current = false
      if (error.message && error.message.includes("CORS")) {
        setError("حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.")
      } else {
        setError("حدث خطأ أثناء تحديث عدد المشاهدات.")
      }
    }
  }

  const handleOnTimeUpdate = (event) => {
    const player = playerRef.current
    if (!player || !event.detail) return

    const { currentTime, duration } = event.detail
    const now = Date.now()

    if (duration > 0) {
      const progress = (currentTime / duration) * 100
      if (progress > 50 && !showFiftyPercentWarning) {
        setShowFiftyPercentWarning(true)
      }
    }

    if (now - lastUpdateTimeRef.current >= 5000) {
      localStorage.setItem(`lecture_${lectureId}_vidstack_time`, currentTime.toString())
      lastUpdateTimeRef.current = now
    }
  }

  const handleOnPause = () => {
    const player = playerRef.current
    if (player && player.currentTime > 0 && !player.ended) {
      localStorage.setItem(`lecture_${lectureId}_vidstack_time`, player.currentTime.toString())
    }
  }

  const handleOnEnded = () => {
    localStorage.removeItem(`lecture_${lectureId}_vidstack_time`)
    if (!showFiftyPercentWarning) {
      setShowFiftyPercentWarning(true)
    }
  }

  const handleOnError = (event) => {
    console.error("Vidstack Player Error:", event.detail)
    let errorMessage = "حدث خطأ في تشغيل الفيديو."
    const errorObj = event.detail
    if (errorObj && errorObj.message) {
      if (errorObj.data && (errorObj.data.code === 101 || errorObj.data.code === 150)) {
        errorMessage = "الفيديو غير متاح أو تم تقييده من قبل المالك."
      } else if (errorObj.message.toLowerCase().includes("network")) {
        errorMessage = "مشكلة في الشبكة، يرجى التحقق من اتصالك بالإنترنت."
      }
    }
    setError(errorMessage)
  }

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadingFiles(files)
      setUploadError(null)
    }
  }

  const handleRemoveFile = (index) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadFiles = async () => {
    if (uploadingFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      // Upload each file sequentially
      for (const file of uploadingFiles) {
        const attachmentData = {
          type: activeTab,
          attachment: file,
        }

        await createLectureAttachment(lectureId, attachmentData)
      }

      // Refresh attachments after successful upload
      const result = await getLectureAttachments(lectureId)
      if (result.status === "success") {
        setAttachments(result.data)

        // Update the flat array of all attachments
        const allAttachmentsArray = [
          ...(result.data.pdfsandimages || []),
          ...(result.data.homeworks || []),
          ...(result.data.exams || []),
          ...(result.data.booklets || []),
        ]
        setAllAttachments(allAttachmentsArray)
      }

      setUploadingFiles([])
      setUploadSuccess(true)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Error uploading files:", err)
      setUploadError(`فشل رفع الملفات: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Homework handlers
  const handleHomeworkFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setHomeworkFiles(files)
      setHomeworkError(null)
    }
  }

  const handleRemoveHomeworkFile = (index) => {
    setHomeworkFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitHomework = async () => {
    if (homeworkSubmitType === "file" && homeworkFiles.length === 0) {
      setHomeworkError("يرجى اختيار ملف واحد على الأقل")
      return
    }

    if (homeworkSubmitType === "form" && !lecture?.homeworkFormLink) {
      setHomeworkError("لا يوجد رابط نموذج متاح")
      return
    }

    if (homeworkSubmitType === "form") {
      // Open the Google Form in a new tab
      window.open(lecture.homeworkFormLink, "_blank")
      return
    }

    setIsSubmittingHomework(true)
    setHomeworkError(null)

    try {
      // Upload each file sequentially using the new homework API
      for (const file of homeworkFiles) {
        const homeworkData = {
          type: "homeworks",
          attachment: file,
        }

        const result = await uploadHomework(lectureId, homeworkData)

        if (!result.success) {
          throw new Error(result.error || "Failed to upload homework")
        }
      }

      // Refresh attachments after successful upload
      const result = await getLectureAttachments(lectureId)
      if (result.status === "success") {
        setAttachments(result.data)

        // Update the flat array of all attachments
        const allAttachmentsArray = [
          ...(result.data.pdfsandimages || []),
          ...(result.data.homeworks || []),
          ...(result.data.exams || []),
          ...(result.data.booklets || []),
        ]
        setAllAttachments(allAttachmentsArray)
      }

      setHomeworkFiles([])
      setHomeworkSuccess(true)
      if (homeworkFileInputRef.current) {
        homeworkFileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Error uploading homework:", err)
      setHomeworkError(`فشل رفع الواجب: ${err.message}`)
    } finally {
      setIsSubmittingHomework(false)
    }
  }

  // Handle taking the exam
  const handleTakeExam = () => {
    if (examData && examData.examUrl) {
      window.open(examData.examUrl, "_blank")
    }
  }

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "غير متاح"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "تاريخ غير صالح"
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Enhanced download function to handle different file types
  const handleDownload = async (attachment) => {
    if (!attachment || !attachment._id) {
      setError("معرف المرفق غير صالح")
      return
    }

    setIsDownloading(true)
    try {
      // First try to use the downloadAttachmentById function
      await downloadAttachmentById(attachment._id)
    } catch (err) {
      console.error("Error with primary download method:", err)

      // If the primary method fails, try a direct download approach
      try {
        if (attachment.filePath) {
          // Create a temporary anchor element
          const link = document.createElement("a")
          link.href = attachment.filePath

          // Set the download attribute with the filename
          link.download = attachment.fileName || `download-${Date.now()}`

          // Append to the document
          document.body.appendChild(link)

          // Trigger the download
          link.click()

          // Clean up
          document.body.removeChild(link)
        } else {
          throw new Error("No file path available")
        }
      } catch (fallbackErr) {
        console.error("Fallback download failed:", fallbackErr)
        setError(`فشل تحميل المرفق: ${err.message}`)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const isVideoEffectivelyBlocked =
    userRole === "Student" && (videoBlocked || (remainingViews !== null && remainingViews <= 0))

  // Check if content should be blocked due to exam requirements
  const isContentBlocked = userRole === "Student" && examRequired && !examVerified

  if (loading || examVerificationLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // Render exam requirement message if needed
  if (isContentBlocked) {
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-primary mb-4">
          رجوع
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center md:text-right">
          {lecture?.name || "جاري تحميل المحاضرة..."}
        </h1>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <FiAlertTriangle className="text-warning" />
              قيود الوصول للمحاضرة
            </h2>

            <div className="alert alert-warning my-4">
              <FiAlertTriangle className="h-6 w-6" />
              <span>{examData?.message || "يجب عليك اجتياز الامتحان قبل الوصول إلى هذه المحاضرة"}</span>
            </div>

            {examData && (
              <div className="bg-base-200 p-4 rounded-lg my-4">
                <h3 className="font-semibold mb-2">معلومات الامتحان:</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">درجة النجاح المطلوبة:</span> {examData.passingThreshold}
                  </li>
                </ul>

                <div className="mt-6">
                  <a
                    href={examData.examUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    <FiExternalLink className="mr-2" />
                    بدء الامتحان
                  </a>
                </div>
              </div>
            )}

            <div className="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>بعد اجتياز الامتحان بنجاح، قم بتحديث الصفحة للوصول إلى محتوى المحاضرة.</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Function to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="text-primary text-xl" />

    const type = fileType.toLowerCase()
    if (type.includes("pdf")) {
      return <FiFile className="text-red-500 text-xl" />
    } else if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) {
      return <FiFile className="text-green-500 text-xl" />
    } else if (type.includes("video")) {
      return <FiFile className="text-blue-500 text-xl" />
    } else if (type.includes("audio")) {
      return <FiFile className="text-purple-500 text-xl" />
    } else {
      return <FiFile className="text-primary text-xl" />
    }
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-primary mb-4">
        رجوع
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center md:text-right">{lecture?.name || "جاري تحميل المحاضرة..."}</h1>

      {userRole && userRole !== "Student" && (
        <div className="alert alert-info mb-6 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>أنت تشاهد هذه المحاضرة بصفتك {userRole}</span>
          </div>
        </div>
      )}

      {userRole === "Student" && examRequired && examVerified && examSubmission && (
        <div className="alert alert-success mb-6 shadow-lg">
          <div className="flex items-center gap-2">
            <FiAward className="stroke-current shrink-0 w-6 h-6" />
            <div>
              <span className="font-bold">تم اجتياز الامتحان بنجاح!</span>
              <div className="text-sm mt-1">
                <span>
                  الدرجة: {examSubmission.score}/{examSubmission.maxScore}
                </span>
                <span className="mx-2">|</span>
                <span>تاريخ الاجتياز: {formatDate(examSubmission.verifiedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFiftyPercentWarning && !isVideoEffectivelyBlocked && (
        <div className="alert alert-warning my-4 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>تنبيه: لقد شاهدت أكثر من نصف مدة المحاضرة.</span>
          </div>
        </div>
      )}

      {isVideoEffectivelyBlocked ? (
        <div className="alert alert-error mb-6 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>لقد استنفدت جميع مشاهداتك المسموحة! سيتم إعادة توجيهك خلال 3 دقائق</span>
          </div>
        </div>
      ) : youtubeVideoId ? (
        <div className="mb-6 shadow-xl rounded-lg overflow-hidden">
          <MediaPlayer
            ref={(node) => (playerRef.current = node)}
            title={lecture.name}
            src={`youtube/${youtubeVideoId}`}
            poster={lecture.thumbnailLink || ""}
            playsInline
            autoPlay={false}
            onCanPlay={handleOnCanPlay}
            onPlay={handleOnPlay}
            onTimeUpdate={handleOnTimeUpdate}
            onPause={handleOnPause}
            onEnded={handleOnEnded}
            onError={handleOnError}
            aspectRatio="16/9"
          >
            <MediaProvider>
              {lecture.thumbnailLink && (
                <Poster className="vds-poster" src={lecture.thumbnailLink} alt={`ملصق محاضرة ${lecture.name}`} />
              )}
            </MediaProvider>
            <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={lecture.videoThumbnailsVTT || null} />
          </MediaPlayer>
          <div className="p-4 bg-base-200 rounded-b-lg">
            {userRole === "Student" && (
              <p className="mt-2 text-sm text-gray-600">
                المشاهدات المتبقية: {remainingViews === null ? "جار التحميل..." : remainingViews}
              </p>
            )}
          </div>
        </div>
      ) : lecture.videoLink ? (
        <div className="alert alert-warning mb-6 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>رابط الفيديو غير صالح أو لا يمكن عرضه حاليًا.</span>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-6 shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>لا يوجد رابط فيديو متاح لهذه المحاضرة.</span>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">تفاصيل المحاضرة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2">
                <strong>الوصف:</strong> {lecture?.description || "لا يوجد وصف متوفر."}
              </p>
              <p className="mb-2">
                <strong>السعر:</strong> {lecture?.price !== undefined ? `${lecture?.price} نقاط` : "غير محدد"}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>النوع:</strong> {lecture?.lecture_type || "غير محدد"}
              </p>
              <p className="mb-2">
                <strong>أنشأها:</strong> {lecture?.createdBy?.name || "غير محدد"}
              </p>
              {lecture?.requiresExam && (
                <p className="mb-2">
                  <strong>يتطلب امتحان لاجتياز الدورة:</strong> نعم
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMPROVED RESPONSIVE ATTACHMENTS DISPLAY */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">المرفقات</h2>

          {allAttachments.length === 0 ? (
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>لا توجد مرفقات متاحة لهذه المحاضرة.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allAttachments.map((attachment, index) => (
                <div
                  key={index}
                  className="card bg-base-100 border border-base-300 hover:border-primary transition-all duration-300"
                >
                  <div className="card-body p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getFileIcon(attachment.fileType)}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 break-words">
                            {attachment.fileName || "ملف بدون اسم"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-4">
                            <p className="mb-1">
                              الحجم:{" "}
                              {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} كيلوبايت` : "غير محدد"}
                            </p>
                            <p className="mb-1">
                              تاريخ الرفع:{" "}
                              {attachment.uploadedOn
                                ? new Date(attachment.uploadedOn).toLocaleDateString()
                                : "غير محدد"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 justify-end">
                        {attachment.filePath && (
                          <a
                            href={attachment.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            <FiEye className="mr-1" /> عرض
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Homework upload section for students */}
      {userRole === "Student" && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">تسليم الواجب</h2>

            <div className="tabs tabs-boxed mb-4">
              <a
                className={`tab ${homeworkSubmitType === "file" ? "tab-active" : ""}`}
                onClick={() => setHomeworkSubmitType("file")}
              >
                رفع ملف
              </a>
              <a
                className={`tab ${homeworkSubmitType === "form" ? "tab-active" : ""}`}
                onClick={() => setHomeworkSubmitType("form")}
              >
                نموذج Google
              </a>
            </div>

            <div className="p-4 border border-dashed border-primary rounded-lg">
              {homeworkSubmitType === "file" ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">رفع ملف الواجب</h3>

                  <div className="mb-4">
                    <input
                      type="file"
                      ref={homeworkFileInputRef}
                      onChange={handleHomeworkFileSelect}
                      multiple
                      className="file-input file-input-bordered file-input-primary w-full"
                    />
                  </div>

                  {homeworkFiles.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">الملفات المحددة:</h4>
                      <ul className="space-y-2">
                        {homeworkFiles.map((file, index) => (
                          <li key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                            <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                            <button
                              onClick={() => handleRemoveHomeworkFile(index)}
                              className="btn btn-circle btn-xs btn-ghost"
                            >
                              <FiX />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {homeworkError && (
                    <div className="alert alert-error mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{homeworkError}</span>
                    </div>
                  )}

                  {homeworkSuccess && (
                    <div className="alert alert-success mb-4">
                      <FiCheck className="stroke-current shrink-0 h-6 w-6" />
                      <span>تم رفع الواجب بنجاح!</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitHomework}
                    disabled={homeworkFiles.length === 0 || isSubmittingHomework}
                    className="btn btn-primary w-full"
                  >
                    {isSubmittingHomework ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        جاري إرسال الواجب...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        إرسال الواجب
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">إكمال نموذج Google</h3>

                  {lecture?.homeworkFormLink ? (
                    <div className="mb-4">
                      <p className="mb-4">قم بإكمال نموذج Google التالي وإرساله للتصحيح:</p>
                      <button onClick={handleSubmitHomework} className="btn btn-primary w-full">
                        <FiLink className="mr-2" />
                        فتح نموذج Google
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>لم يتم توفير رابط نموذج Google لهذا الواجب.</span>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p>ملاحظات:</p>
                <ul className="list-disc list-inside">
                  <li>يمكنك رفع ملفات بصيغة PDF أو Word أو صور</li>
                  <li>الحد الأقصى لحجم الملف: 5 ميجابايت</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homeworks list for authorized users */}
      {hasUploadPermission() && homeworks.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">واجبات الطلاب المقدمة</h2>
            <div className="grid grid-cols-1 gap-4">
              {homeworks.map((homework, index) => (
                <div
                  key={index}
                  className="card bg-base-100 border border-base-300 hover:border-primary transition-all duration-300"
                >
                  <div className="card-body p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getFileIcon(homework.fileType)}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 break-words">{homework.fileName || "ملف بدون اسم"}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-4">
                            <p className="mb-1">
                              الحجم:{" "}
                              {homework.fileSize ? `${Math.round(homework.fileSize / 1024)} كيلوبايت` : "غير محدد"}
                            </p>
                            <p className="mb-1">
                              تاريخ التقديم:{" "}
                              {homework.uploadedOn ? new Date(homework.uploadedOn).toLocaleDateString() : "غير محدد"}
                            </p>
                            <p className="mb-1">الطالب: {homework.studentId.name || "غير محدد"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 justify-end">
                        {homework.filePath && (
                          <a
                            href={homework.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            <FiEye className="mr-1" /> عرض
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File uploader for authorized users */}
      {hasUploadPermission() && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">رفع مرفقات جديدة</h2>

            <div className="tabs tabs-boxed mb-4 flex flex-wrap">
              {["pdfsandimages", "homeworks", "exams", "booklets"].map((type) => (
                <a
                  key={type}
                  className={`tab flex-grow sm:flex-grow-0 ${activeTab === type ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(type)}
                >
                  {type === "pdfsandimages"
                    ? "ملفات PDF وصور"
                    : type === "homeworks"
                      ? "الواجبات"
                      : type === "exams"
                        ? "الامتحانات"
                        : "الكتيبات"}
                </a>
              ))}
            </div>

            <div className="p-4 border border-dashed border-primary rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                إضافة مرفقات جديدة (
                {activeTab === "pdfsandimages"
                  ? "ملفات PDF وصور"
                  : activeTab === "homeworks"
                    ? "الواجبات"
                    : activeTab === "exams"
                      ? "الامتحانات"
                      : "الكتيبات"}
                )
              </h3>

              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="file-input file-input-bordered file-input-primary w-full"
                />
              </div>

              {uploadingFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">الملفات المحددة:</h4>
                  <ul className="space-y-2">
                    {uploadingFiles.map((file, index) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                        <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                        <button onClick={() => handleRemoveFile(index)} className="btn btn-circle btn-xs btn-ghost">
                          <FiX />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {uploadError && (
                <div className="alert alert-error mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="alert alert-success mb-4">
                  <FiCheck className="stroke-current shrink-0 h-6 w-6" />
                  <span>تم رفع الملفات بنجاح!</span>
                </div>
              )}

              <button
                onClick={handleUploadFiles}
                disabled={uploadingFiles.length === 0 || isUploading}
                className="btn btn-primary w-full"
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    رفع الملفات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LectureDisplay
