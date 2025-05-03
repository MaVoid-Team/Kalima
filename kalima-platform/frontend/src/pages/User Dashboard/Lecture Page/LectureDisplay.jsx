"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById, getLectureAttachments, downloadAttachmentById } from "../../../routes/lectures"
// Import Video.js styles
import "video.js/dist/video-js.css"

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
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const lastUpdateTimeRef = useRef(0)

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

    const fetchAttachments = async () => {
      try {
        const result = await getLectureAttachments(lectureId)
        if (result.status === "success") {
          setAttachments(result.data)
        } else {
          console.error("Failed to fetch attachments:", result.message)
        }
      } catch (err) {
        console.error("Error fetching attachments:", err)
      }
    }

    fetchLecture()
    fetchAttachments()
  }, [lectureId])

  // Extract YouTube embed ID to validate YouTube URL
  const getYouTubeEmbedId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Initialize Video.js player with YouTube support and resume functionality
  useEffect(() => {
    if (!videoRef.current || !lecture?.videoLink) return

    // Dynamically import Video.js and videojs-youtube
    Promise.all([
      import("video.js"),
      import("videojs-youtube")
    ]).then(([videojs]) => {
      const VideoJs = videojs.default

      playerRef.current = VideoJs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        techOrder: ["youtube", "html5"],
        sources: [
          {
            src: lecture.videoLink,
            type: getYouTubeEmbedId(lecture.videoLink) ? "video/youtube" : "video/mp4",
          },
        ],
        youtube: { ytControls: 0 }, // Disable native YouTube controls
      })

      // Load saved playback position after metadata is loaded
      const savedTime = localStorage.getItem(`lecture_${lectureId}_playback_time`)
      if (savedTime && !isNaN(savedTime)) {
        playerRef.current.on("loadedmetadata", () => {
          playerRef.current.currentTime(parseFloat(savedTime))
        })
      }

      // Track playback progress and save position
      playerRef.current.on("timeupdate", () => {
        const currentTime = playerRef.current.currentTime()
        const duration = playerRef.current.duration()
        const now = Date.now()

        // Update progress for display
        if (duration > 0) {
          const progress = (currentTime / duration) * 100
          setPlaybackProgress(progress)
        }

        // Save playback position every 5 seconds to avoid excessive writes
        if (now - lastUpdateTimeRef.current >= 5000) {
          localStorage.setItem(`lecture_${lectureId}_playback_time`, currentTime.toString())
          lastUpdateTimeRef.current = now
        }
      })

      // Save position on pause or end
      playerRef.current.on("pause", () => {
        const currentTime = playerRef.current.currentTime()
        localStorage.setItem(`lecture_${lectureId}_playback_time`, currentTime.toString())
      })

      playerRef.current.on("ended", () => {
        // Clear saved time when video ends
        localStorage.removeItem(`lecture_${lectureId}_playback_time`)
        setPlaybackProgress(100)
      })

      // Handle player errors
      playerRef.current.on("error", () => {
        setError("Failed to load video. Please check the video link.")
      })
    }).catch((err) => {
      console.error("Failed to load Video.js or YouTube plugin:", err)
      setError("Failed to initialize video player.")
    })

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        // Save final position before cleanup
        const currentTime = playerRef.current.currentTime()
        if (currentTime > 0) {
          localStorage.setItem(`lecture_${lectureId}_playback_time`, currentTime.toString())
        }
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [lecture?.videoLink, lectureId])

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

  // Render attachments with view and download links
  const renderAttachments = (attachmentType, attachments) => {
    if (!attachments || attachments.length === 0) return null

    const handleDownload = async (attachmentId) => {
      try {
        await downloadAttachmentById(attachmentId)
      } catch (err) {
        setError(`Failed to download attachment: ${err.message}`)
      }
    }

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{attachmentType}</h3>
        <ul className="list-disc pl-5">
          {attachments.map((attachment, index) => (
            <li key={attachment._id} className="mt-2">
              <div className="flex gap-4 items-center">
                <span className="text-gray-600">{attachment.fileName}</span>
                <div className="flex gap-2">
                  <a
                    href={attachment.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض
                  </a>
                  <button
                    onClick={() => handleDownload(attachment._id)}
                    className="text-green-600 hover:underline"
                  >
                    تحميل
                  </button>
                </div>
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

      {/* Video.js Player */}
      {lecture.videoLink ? (
        <div className="mb-6">
          <video
            ref={videoRef}
            className="video-js vjs-default-skin vjs-big-play-centered rounded-lg"
            style={{ width: "100%", height: "400px" }}
          ></video>
          <div className="mt-2">
            <p>Playback Progress: {playbackProgress.toFixed(2)}%</p>
            <progress
              className="progress progress-primary w-full"
              value={playbackProgress}
              max="100"
            ></progress>
          </div>
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
          {renderAttachments("الامتحانات", attachments.exams)}
          {renderAttachments("الكتيبات", attachments.booklets)}
          {renderAttachments("الواجبات", attachments.homeworks)}
          {renderAttachments("ملفات PDF وصور", attachments.pdfsandimages)}
          {(attachments.exams.length === 0 &&
            attachments.booklets.length === 0 &&
            attachments.homeworks.length === 0 &&
            attachments.pdfsandimages.length === 0) && (
            <p>لا توجد مرفقات متاحة.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LectureDisplay