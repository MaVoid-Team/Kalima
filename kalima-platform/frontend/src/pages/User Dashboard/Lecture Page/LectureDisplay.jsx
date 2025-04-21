"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById } from "../../../routes/lectures"

const LectureDisplay = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true)
        const result = await getLectureById(lectureId)

        if (result.success) {
          setLecture(result.data.container)
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

    fetchLecture()
  }, [lectureId])

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

  if (!lecture) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
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
          <span>لا توجد محاضرة متاحة.</span>
        </div>
      </div>
    )
  }

  // Extract YouTube embed ID from video link
  const getYouTubeEmbedId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeEmbedId = getYouTubeEmbedId(lecture.videoLink)

  // Render attachments with view and download links
  const renderAttachments = (attachmentType, attachments) => {
    if (!attachments || attachments.length === 0) return null

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{attachmentType}</h3>
        <ul className="list-disc pl-5">
          {attachments.map((attachment, index) => (
            <li key={index} className="mt-2">
              <div className="flex gap-4">
                <a
                  href={`/api/v1/attachments/${attachment}`} // Replace with actual attachment URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  عرض المرفق {index + 1}
                </a>
                <a
                  href={`/api/v1/attachments/${attachment}`} // Replace with actual attachment URL
                  download
                  className="text-green-600 hover:underline"
                >
                  تحميل
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline mb-4"
      >
        رجوع
      </button>
      <h1 className="text-3xl font-bold mb-6">{lecture.name}</h1>

      {/* Video Embed */}
      {youtubeEmbedId ? (
        <div className="mb-6">
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
            title={lecture.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      ) : (
        <div className="alert alert-warning mb-6">
          <span>لا يوجد رابط فيديو صالح متاح.</span>
        </div>
      )}

      {/* Lecture Details */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">تفاصيل المحاضرة</h2>
          <p><strong>الوصف:</strong> {lecture.description || "لا يوجد وصف"}</p>
          <p><strong>السعر:</strong> {lecture.price} نقاط</p>
          <p><strong>النوع:</strong> {lecture.lecture_type}</p>
          <p><strong>عدد المشاهدات:</strong> {lecture.numberOfViews}</p>
          <p><strong>أنشأها:</strong> {lecture.createdBy?.name || "غير محدد"}</p>
        </div>
      </div>

      {/* Attachments */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">المرفقات</h2>
          {renderAttachments("الامتحانات", lecture.attachments.exams)}
          {renderAttachments("الكتيبات", lecture.attachments.booklets)}
          {renderAttachments("الواجبات", lecture.attachments.homeworks)}
          {renderAttachments("ملفات PDF وصور", lecture.attachments.pdfsandimages)}
          {(lecture.attachments.exams.length === 0 &&
            lecture.attachments.booklets.length === 0 &&
            lecture.attachments.homeworks.length === 0 &&
            lecture.attachments.pdfsandimages.length === 0) && (
            <p>لا توجد مرفقات متاحة.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LectureDisplay