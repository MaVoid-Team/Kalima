"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getLectureAttachments} from "../../../routes/lectures"
import { getUserDashboard } from "../../../routes/auth-services"
import { FileText, Download, Image, File } from 'lucide-react'

const WatchLecture = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const [lecture, setLecture] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url?.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Handle file download
  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.target = '_blank'
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="h-5 w-5" />
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />
    if (fileType.includes('image')) return <Image className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  // Fetch lecture data and verify access
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // First get user info and verify access
        const userResult = await getUserDashboard()
        if (!userResult.success) {
          throw new Error("Failed to verify user access")
        }

        const { userInfo, purchaseHistory = [] } = userResult.data.data
        setUserRole(userInfo.role)

        // Get lecture attachments
        const attachmentsResult = await getLectureAttachments(lectureId)
        if (!attachmentsResult.success) {
          throw new Error("Failed to load lecture data")
        }
        
        const lectureData = attachmentsResult.data.lecture
        setLecture(lectureData)

        // Combine all attachments into one array
        const allAttachments = [
          ...(attachmentsResult.data.booklets || []),
          ...(attachmentsResult.data.exams || []),
          ...(attachmentsResult.data.homeworks || []),
          ...(attachmentsResult.data.pdfsandimages || [])
        ]
        setAttachments(allAttachments)

        // Verify access
        if (userInfo.role === 'Lecturer') {
          // Lecturers can access their own lectures
          const isOwner = lectureData.createdBy?._id === userInfo.id
          if (!isOwner) {
            throw new Error("You don't have access to this lecture")
          }
          setHasAccess(true)
        } else {
          // Students can access purchased lectures
          const hasPurchased = purchaseHistory.some(
            p => (p.type === 'containerPurchase' || p.type === 'lecturePurchase') && 
                 (p.container?._id === lectureId || p.lecture?._id === lectureId)
          )
          if (!hasPurchased) {
            throw new Error("You don't have access to this lecture")
          }
          setHasAccess(true)
        }

      } catch (err) {
        setError(err.message || "Failed to load lecture data")
        console.error("Error:", err)
        navigate(userRole === 'Lecturer' 
          ? "/dashboard/lecturer-dashboard" 
          : "/dashboard/student-dashboard/promo-codes")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lectureId, navigate])

  if (loading) {
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

  if (!lecture || !hasAccess) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>لا تملك صلاحية الوصول إلى هذه المحاضرة</span>
        </div>
      </div>
    )
  }

  const videoId = lecture.videoLink ? getYouTubeVideoId(lecture.videoLink) : null

  return (
    <div className="container mx-auto p-4 pb-20" dir="rtl">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to={userRole === 'Lecturer'
            ? "/dashboard/lecturer-dashboard"
            : "/dashboard/student-dashboard/promo-codes"}
          className="btn btn-sm btn-outline"
        >
          العودة
        </Link>
      </div>

      {/* Lecture Title */}
      <h1 className="text-2xl font-bold mb-4">{lecture.name}</h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {lecture.subject?.name && (
          <div className="badge badge-primary">{lecture.subject.name}</div>
        )}
        {lecture.level?.name && (
          <div className="badge badge-secondary">{lecture.level.name}</div>
        )}
        {lecture.lecture_type && (
          <div className="badge badge-accent">{lecture.lecture_type}</div>
        )}
      </div>

      {/* Video Embed */}
      {videoId && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-48 md:h-64 lg:h-80"
              src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
              title={lecture.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Description */}
      {lecture.description && (
        <div className="mb-6 bg-base-200 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">الوصف</h2>
          <p className="text-gray-700">{lecture.description}</p>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">المرفقات</h2>
          <div className="space-y-3">
            {attachments.map((file, index) => (
              <div key={index} className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.fileType)}
                      <span className="text-sm font-medium line-clamp-1">
                        {file.fileName || `ملف ${index + 1}`}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleDownload(file.filePath, file.fileName)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="mr-1">فتح</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>لا توجد مرفقات متاحة لهذه المحاضرة</span>
        </div>
      )}
    </div>
  )
}

export default WatchLecture