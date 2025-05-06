"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById, getLectureAttachments, downloadAttachmentById } from "../../../routes/lectures"
// Import Video.js styles
import axios from "axios"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import "videojs-youtube"
import { getToken } from "../../../routes/auth-services"
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
  const [remainingViews, setRemainingViews] = useState(null)
  const [studentLectureAccessId, setStudentLectureAccessId] = useState(null)
  const [videoBlocked, setVideoBlocked] = useState(false)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const lastUpdateTimeRef = useRef(0)
  const hasViewedRef = useRef(false)
  const redirectTimeoutRef = useRef(null)

  // Fetch lecture data
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

  // Fetch student access data
  useEffect(() => {
    const fetchAccessData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student-lecture-access`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            }
          }
        )
        const lectureAccess = response.data.data.find(
          access => access.lecture?._id === lectureId
        )

        if (!lectureAccess) {
          setError("لا تملك صلاحية الوصول إلى هذه المحاضرة")
          return
        }

        setRemainingViews(lectureAccess.remainingViews)
        setStudentLectureAccessId(lectureAccess._id)

        if (lectureAccess.remainingViews <= 0) {
          setVideoBlocked(true)
          redirectTimeoutRef.current = setTimeout(() => navigate(-1), 180000)
        }
      } catch (error) {
        console.error("Error fetching access data:", error)
        setError("فشل تحميل بيانات الوصول")
      }
    }

    if (lectureId) fetchAccessData()
  }, [lectureId, navigate])

  // Initialize Video.js player with YouTube support
  useEffect(() => {
    let player;
    const initializePlayer = () => {
      try {
        if (
          !videoRef.current ||
          !lecture?.videoLink ||
          videoBlocked ||
          remainingViews <= 0
        ) return;
  
        // Create player instance
        player = videojs(videoRef.current, {
          controls: true,
          fluid: true,
          techOrder: ["youtube"],
          sources: [{
            src: lecture.videoLink,
            type: "video/youtube"
          }],
          youtube: {
            ytControls: 0,
            enablePrivacyEnhancedMode: true
          }
        });
  
        // Store player reference
        playerRef.current = player;
  
        // Add error handler
        player.on("error", () => {
          setError("حدث خطأ في تشغيل الفيديو");
        });
  
        // View deduction logic
        const handleFirstPlay = async () => {
          if (!hasViewedRef.current && remainingViews > 0) {
            try {

              hasViewedRef.current = true;
              
              const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/student-lecture-access/${studentLectureAccessId}`,
                { remainingViews: remainingViews - 1 },
                {
                  headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                  }
                }
              );
        
              // Handle response
              if (response.data.success) {
                setRemainingViews(response.data.data.remainingViews);
                
                if (response.data.data.remainingViews <= 0) {
                  setVideoBlocked(true);
                  player.pause();
                  alert("انتهت عدد مشاهداتك لهذه المحاضرة!");
                  redirectTimeoutRef.current = setTimeout(() => navigate(-1), 180000);
                }
              }
            } catch (error) {
              console.error("View update error:", error);
              hasViewedRef.current = false;
              
              // Handle CORS error specifically
              if (error.message.includes("CORS")) {
                setError("حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.");
              }
            }
          }
        };

        // Playback progress handling
        const handleTimeUpdate = () => {
          const currentTime = player.currentTime();
          const duration = player.duration();
          const now = Date.now();
  
          if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            setPlaybackProgress(progress);
          }
  
          if (now - lastUpdateTimeRef.current >= 5000) {
            localStorage.setItem(`lecture_${lectureId}_playback_time`, currentTime.toString());
            lastUpdateTimeRef.current = now;
          }
        };
  
        // Event listeners
        player.on("play", handleFirstPlay);
        player.on("timeupdate", handleTimeUpdate);
        player.on("pause", () => {
          localStorage.setItem(`lecture_${lectureId}_playback_time`, player.currentTime().toString());
        });
        player.on("ended", () => {
          localStorage.removeItem(`lecture_${lectureId}_playback_time`);
          setPlaybackProgress(100);
        });
  
        // Load saved position
        const savedTime = localStorage.getItem(`lecture_${lectureId}_playback_time`);
        if (savedTime) {
          player.ready(() => {
            player.currentTime(parseFloat(savedTime));
          });
        }
  
      } catch (err) {
        console.error("Player initialization error:", err);
        setError("Failed to initialize video player");
      }
    };
  
    initializePlayer();
  
    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [lecture?.videoLink, videoBlocked, remainingViews, studentLectureAccessId, lectureId, navigate]);
  // Render attachments function
  

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

  // No lecture found
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
      <button onClick={() => navigate(-1)} className="btn btn-outline mb-4">
        رجوع
      </button>
      <h1 className="text-3xl font-bold mb-6">{lecture.name}</h1>

      {videoBlocked ? (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>لقد استنفذت جميع مشاهداتك المسموحة! سيتم إعادة توجيهك خلال 3 دقائق</span>
        </div>
      ) : lecture.videoLink ? (
        <div className="mb-6">
          <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered rounded-lg"
          style={{ width: "100%", height: "400px" }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.classList.add('vjs-initialized');
            }
          }}
        ></video>
          <div className="mt-2">
            {/* <p>تقدم التشغيل: {playbackProgress.toFixed(2)}%</p>
            <progress
              className="progress progress-primary w-full"
              value={playbackProgress}
              max="100"
            ></progress> */}
            <p className="mt-2">المشاهدات المتبقية: {remainingViews}</p>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-6">
          <span>لا يوجد رابط فيديو صالح متاح.</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">تفاصيل المحاضرة</h2>
          <p><strong>الوصف:</strong> {lecture.description || "لا يوجد وصف"}</p>
          <p><strong>السعر:</strong> {lecture.price} نقاط</p>
          <p><strong>النوع:</strong> {lecture.lecture_type}</p>
          <p><strong>عدد المشاهدات الكلية:</strong> {lecture.numberOfViews}</p>
          <p><strong>أنشأها:</strong> {lecture.createdBy?.name || "غير محدد"}</p>
        </div>
      </div>

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