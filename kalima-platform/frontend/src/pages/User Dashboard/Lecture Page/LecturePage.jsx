"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getLectureById } from "../../../routes/lectures"

const LecturePage = () => {
  const { containerId, lectureId } = useParams()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("Lecture ID from params:", lectureId)

    const fetchLecture = async () => {
      try {
        setLoading(true)
        const result = await getLectureById(lectureId)
        console.log("Lecture data:", result.data)
        setLecture(result.data.lecture || result.data.data?.lecture)
        setLoading(false)
      } catch (err) {
        setError("Failed to load lecture. Please try again later.")
        setLoading(false)
        console.error("Error:", err)
      }
    }

    if (lectureId) {
      fetchLecture()
    }
  }, [lectureId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error || !lecture) {
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
          <span>{error || "Lecture not found"}</span>
        </div>
      </div>
    )
  }

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = lecture.videoLink ? getYouTubeVideoId(lecture.videoLink) : null

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">{lecture.name}</h1>

      {videoId && (
        <div className="aspect-w-16 aspect-h-9 mb-6">
          <iframe
            className="w-full h-[500px] rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={lecture.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">الوصف</h2>
        <p className="text-gray-700">{lecture.description || "لا يوجد وصف متاح"}</p>
      </div>

      {lecture.attachments && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Booklets Section */}
          {lecture.attachments.booklets?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">الكتيبات</h3>
                <ul className="list-disc list-inside">
                  {lecture.attachments.booklets.map((bookletId, index) => (
                    <li key={bookletId} className="mb-1">
                      كتيب {index + 1} <button className="btn btn-xs btn-primary">تحميل</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Homeworks Section */}
          {lecture.attachments.homeworks?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">الواجبات</h3>
                <ul className="list-disc list-inside">
                  {lecture.attachments.homeworks.map((homeworkId, index) => (
                    <li key={homeworkId} className="mb-1">
                      واجب {index + 1} <button className="btn btn-xs btn-primary">تحميل</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Exams Section */}
          {lecture.attachments.exams?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">الامتحانات</h3>
                <ul className="list-disc list-inside">
                  {lecture.attachments.exams.map((examId, index) => (
                    <li key={examId} className="mb-1">
                      امتحان {index + 1} <button className="btn btn-xs btn-primary">تحميل</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* PDFs and Images Section */}
          {lecture.attachments.pdfsandimages?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">ملفات PDF وصور</h3>
                <ul className="list-disc list-inside">
                  {lecture.attachments.pdfsandimages.map((fileId, index) => (
                    <li key={fileId} className="mb-1">
                      ملف {index + 1} <button className="btn btn-xs btn-primary">تحميل</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LecturePage
