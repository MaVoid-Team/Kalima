"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getMyContainers, getLectureAttachments } from "../../../routes/lectures"
import { FileText, Download, BookOpen, FileQuestion, Image } from 'lucide-react'

const LecturePage = () => {
  const { lectureId } = useParams()
  const [containers, setContainers] = useState([])
  const [currentLecture, setCurrentLecture] = useState(null)
  const [attachments, setAttachments] = useState({
    booklets: [],
    exams: [],
    homeworks: [],
    pdfsandimages: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all containers
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setLoading(true)
        const result = await getMyContainers()
        
        if (result.status === "success") {
          setContainers(result.data.containers || [])
          
          // If we have a lectureId, find the specific lecture
          if (lectureId) {
            const lecture = (result.data.containers || []).find(container => 
              container._id === lectureId && container.type === "lecture"
            )
            
            if (lecture) {
              setCurrentLecture(lecture)
              
              // Fetch attachments for this lecture
              const attachmentsResult = await getLectureAttachments(lectureId)
              if (attachmentsResult.status === "success") {
                // Ensure all attachment arrays exist with defaults
                const attachmentData = {
                  booklets: attachmentsResult.data?.booklets || [],
                  exams: attachmentsResult.data?.exams || [],
                  homeworks: attachmentsResult.data?.homeworks || [],
                  pdfsandimages: attachmentsResult.data?.pdfsandimages || []
                }
                setAttachments(attachmentData)
              } else {
                console.error("Failed to load attachments:", attachmentsResult.message)
              }
            } else {
              setError("Lecture not found")
            }
          }
        } else {
          setError("Failed to load containers")
        }
      } catch (err) {
        setError("Failed to load containers. Please try again later.")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContainers()
  }, [lectureId])

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url?.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Handle attachment download
  const handleDownload = (filePath, fileName) => {
    if (!filePath) {
      console.error("No file path provided for download")
      return
    }
    
    // Create a temporary anchor element
    const link = document.createElement('a')
    link.href = filePath
    link.target = '_blank'
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="h-5 w-5" />
    
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5" />
    } else if (fileType.includes('image')) {
      return <Image className="h-5 w-5" />
    } else {
      return <FileText className="h-5 w-5" />
    }
  }

  // Safe check for array length
  const safeArrayLength = (arr) => {
    return Array.isArray(arr) ? arr.length : 0
  }

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

  // If we have a specific lecture to display
  if (currentLecture) {
    const videoId = currentLecture.videoLink ? getYouTubeVideoId(currentLecture.videoLink) : null
    
    // Safely check if attachments exist and have length
    const hasBooklets = safeArrayLength(attachments.booklets) > 0
    const hasExams = safeArrayLength(attachments.exams) > 0
    const hasHomeworks = safeArrayLength(attachments.homeworks) > 0
    const hasPdfsAndImages = safeArrayLength(attachments.pdfsandimages) > 0
    
    const hasAttachments = hasBooklets || hasExams || hasHomeworks || hasPdfsAndImages

    return (
      <div className="container mx-auto p-4" dir="rtl">
        <div className="mb-4">
          <Link to="/dashboard/lecturer-dashboard" className="btn btn-sm btn-outline">
            العودة إلى قائمة المحاضرات
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">{currentLecture.name}</h1>

        {/* Subject and Level */}
        <div className="flex flex-wrap gap-2 mb-4">
          {currentLecture.subject?.name && (
            <div className="badge badge-primary">{currentLecture.subject.name}</div>
          )}
          {currentLecture.level?.name && (
            <div className="badge badge-secondary">{currentLecture.level.name}</div>
          )}
          {currentLecture.lecture_type && (
            <div className="badge badge-accent">{currentLecture.lecture_type}</div>
          )}
        </div>

        {videoId && (
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <iframe
              className="w-full h-[500px] rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={currentLecture.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">الوصف</h2>
          <p className="text-gray-700">{currentLecture.description || "لا يوجد وصف متاح"}</p>
        </div>

        {/* Attachments Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            المرفقات
          </h2>

          {!hasAttachments && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>لا توجد مرفقات متاحة لهذه المحاضرة.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Booklets Section */}
            {hasBooklets && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    الكتيبات
                  </h3>
                  <ul className="space-y-2 mt-2">
                    {attachments.booklets.map((booklet) => (
                      <li key={booklet._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(booklet.fileType)}
                          <span className="text-sm font-medium">{booklet.fileName}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(booklet.filePath, booklet.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Homeworks Section */}
            {hasHomeworks && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    الواجبات
                  </h3>
                  <ul className="space-y-2 mt-2">
                    {attachments.homeworks.map((homework) => (
                      <li key={homework._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(homework.fileType)}
                          <span className="text-sm font-medium">{homework.fileName}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(homework.filePath, homework.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Exams Section */}
            {hasExams && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    الامتحانات
                  </h3>
                  <ul className="space-y-2 mt-2">
                    {attachments.exams.map((exam) => (
                      <li key={exam._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(exam.fileType)}
                          <span className="text-sm font-medium">{exam.fileName}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(exam.filePath, exam.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* PDFs and Images Section */}
            {hasPdfsAndImages && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    ملفات PDF وصور
                  </h3>
                  <ul className="space-y-2 mt-2">
                    {attachments.pdfsandimages.map((file) => (
                      <li key={file._id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.fileType)}
                          <span className="text-sm font-medium">{file.fileName}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(file.filePath, file.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If no specific lecture is selected, show a list of available lectures
  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">المحاضرات المتاحة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(containers || [])
          .filter(container => container && container.type === "lecture")
          .map(lecture => (
            <div key={lecture._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{lecture.name}</h2>
                
                <div className="flex flex-wrap gap-2 my-2">
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
                
                <p className="line-clamp-2">{lecture.description || "لا يوجد وصف متاح"}</p>
                
                <div className="card-actions justify-end mt-4">
                  <Link to={`/dashboard/lecture-page/${lecture._id}`} className="btn btn-primary">
                    عرض المحاضرة
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
      
      {(containers || []).filter(container => container && container.type === "lecture").length === 0 && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>لا توجد محاضرات متاحة حالياً.</span>
        </div>
      )}
    </div>
  )
}

export default LecturePage