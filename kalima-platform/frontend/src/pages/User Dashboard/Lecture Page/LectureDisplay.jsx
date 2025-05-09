"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById, getLectureAttachments, downloadAttachmentById, createLectureAttachment } from "../../../routes/lectures"
import { getUserDashboard } from "../../../routes/auth-services"
import axios from "axios"
import { getToken } from "../../../routes/auth-services"
import { FiUpload, FiFile, FiX, FiCheck } from "react-icons/fi"

// Vidstack imports
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

// Helper function to extract YouTube Video ID
const getYouTubeId = (url) => {
  if (!url) return null;
  let videoId = null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "youtu.be") { // Handles youtu.be short links
      videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes("youtube.com")) { // Handles youtube.com links
      videoId = parsedUrl.searchParams.get("v");
    } else if (parsedUrl.pathname.includes("/embed/")) { // Handles youtube.com/embed links
      videoId = parsedUrl.pathname.split('/').pop();
    }
  } catch (e) {
    console.warn("Could not parse YouTube URL with standard new URL(), trying regex:", e);
  }

  if (!videoId) { // Fallback regex for various URL formats
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
  }
  return videoId;
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
  const [showFiftyPercentWarning, setShowFiftyPercentWarning] = useState(false)
  const [remainingViews, setRemainingViews] = useState(null)
  const [studentLectureAccessId, setStudentLectureAccessId] = useState(null)
  const [videoBlocked, setVideoBlocked] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  
  // Attachment tabs and uploads
  const [activeTab, setActiveTab] = useState("pdfsandimages")
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

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
          // Set the entire data object with all attachment types
          setAttachments(result.data)
        } else {
          console.error("Failed to fetch attachments:", result.message)
        }
      } catch (err) {
        console.error("Error fetching attachments:", err)
      }
    }

    if (lectureId) {
      fetchLecture()
      fetchAttachments()
    }
  }, [lectureId, userId])

  // Fetch student access data - only for students
  useEffect(() => {
    const fetchAccessData = async () => {
      if (userRole === "Lecturer" || userRole === "Admin" || userRole === "SubAdmin" || userRole === "Moderator" || userRole === "Assistant") return

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/student-lecture-access`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        })
        const lectureAccess = response.data.data.find((access) => access.lecture?._id === lectureId)

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

  // Vidstack Player Logic
  const youtubeVideoId = lecture ? getYouTubeId(lecture.videoLink) : null;

  const handleOnCanPlay = () => {
    const player = playerRef.current;
    if (!player) return;

    const savedTime = localStorage.getItem(`lecture_${lectureId}_vidstack_time`);
    if (savedTime) {
      try {
        const parsedTime = Number.parseFloat(savedTime);
        if (!isNaN(parsedTime) && parsedTime > 0 && parsedTime < player.duration) {
          player.currentTime = parsedTime;
        } else if (parsedTime >= player.duration) {
          localStorage.removeItem(`lecture_${lectureId}_vidstack_time`);
        }
      } catch (e) {
        console.error("Error parsing saved time:", e);
        localStorage.removeItem(`lecture_${lectureId}_vidstack_time`);
      }
    }
  };

  const handleOnPlay = async () => {
    if (userRole !== "Student" || hasViewedRef.current || (remainingViews !== null && remainingViews <= 0)) return;

    try {
      hasViewedRef.current = true;

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/student-lecture-access/${studentLectureAccessId}`,
        { remainingViews: remainingViews - 1 },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setRemainingViews(response.data.data.remainingViews);
        if (response.data.data.remainingViews <= 0) {
          setVideoBlocked(true);
          playerRef.current?.pause();
          alert("انتهت عدد مشاهداتك لهذه المحاضرة!");
          redirectTimeoutRef.current = setTimeout(() => navigate(-1), 180000);
        }
      } else {
        hasViewedRef.current = false;
      }
    } catch (error) {
      console.error("View update error:", error);
      hasViewedRef.current = false;
      if (error.message.includes("CORS")) {
        setError("حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.");
      } else {
        setError("حدث خطأ أثناء تحديث عدد المشاهدات.");
      }
    }
  };

  const handleOnTimeUpdate = (event) => {
    const player = playerRef.current;
    if (!player || !event.detail) return;

    const { currentTime, duration } = event.detail;
    const now = Date.now();

    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      if (progress > 50 && !showFiftyPercentWarning) {
        setShowFiftyPercentWarning(true);
      }
    }

    if (now - lastUpdateTimeRef.current >= 5000) {
      localStorage.setItem(`lecture_${lectureId}_vidstack_time`, currentTime.toString());
      lastUpdateTimeRef.current = now;
    }
  };

  const handleOnPause = () => {
    const player = playerRef.current;
    if (player && player.currentTime > 0 && !player.ended) {
      localStorage.setItem(`lecture_${lectureId}_vidstack_time`, player.currentTime.toString());
    }
  };

  const handleOnEnded = () => {
    localStorage.removeItem(`lecture_${lectureId}_vidstack_time`);
    if (!showFiftyPercentWarning) {
      setShowFiftyPercentWarning(true);
    }
  };

  const handleOnError = (event) => {
    console.error("Vidstack Player Error:", event.detail);
    let errorMessage = "حدث خطأ في تشغيل الفيديو.";
    const errorObj = event.detail;
    if (errorObj && errorObj.message) {
      if (errorObj.data && (errorObj.data.code === 101 || errorObj.data.code === 150)) {
        errorMessage = "الفيديو غير متاح أو تم تقييده من قبل المالك.";
      } else if (errorObj.message.toLowerCase().includes('network')) {
        errorMessage = "مشكلة في الشبكة، يرجى التحقق من اتصالك بالإنترنت.";
      }
    }
    setError(errorMessage);
  };

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadingFiles(files)
      setUploadError(null)
    }
  }

  const handleRemoveFile = (index) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
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
          attachment: file
        }
        
        await createLectureAttachment(lectureId, attachmentData)
      }
      
      // Refresh attachments after successful upload
      const result = await getLectureAttachments(lectureId)
      if (result.status === "success") {
        setAttachments(result.data)
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>لا توجد محاضرة متاحة.</span>
        </div>
      </div>
    )
  }

  const renderAttachments = (attachmentsList) => {
    if (!attachmentsList || attachmentsList.length === 0) {
      return <p className="text-gray-500 mt-4">لا توجد مرفقات متاحة في هذه الفئة.</p>
    }

    const handleDownload = async (attachmentId) => {
      try {
        await downloadAttachmentById(attachmentId)
      } catch (err) {
        setError(`Failed to download attachment: ${err.message}`)
      }
    }

    return (
      <ul className="mt-4 space-y-2">
        {attachmentsList.map((attachment) => (
          <li key={attachment._id} className="p-3 bg-base-200 rounded-lg">
            <div className="flex gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFile className="text-primary" />
                <span className="text-gray-700">{attachment.fileName}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={attachment.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline btn-info">
                  عرض
                </a>
                <button onClick={() => handleDownload(attachment._id)} className="btn btn-sm btn-outline btn-success">
                  تحميل
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  // Translate attachment types to Arabic
  const getAttachmentTypeLabel = (type) => {
    switch(type) {
      case "pdfsandimages": return "ملفات PDF وصور";
      case "homeworks": return "الواجبات";
      case "exams": return "الامتحانات";
      case "booklets": return "الكتيبات";
      default: return type;
    }
  };

  const isVideoEffectivelyBlocked = userRole === "Student" && (videoBlocked || (remainingViews !== null && remainingViews <= 0));

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-primary mb-4">
        رجوع
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center md:text-right">{lecture.name}</h1>

      {userRole && userRole !== "Student" && (
        <div className="alert alert-info mb-6 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>أنت تشاهد هذه المحاضرة بصفتك {userRole}</span>
          </div>
        </div>
      )}

      {showFiftyPercentWarning && !isVideoEffectivelyBlocked && (
        <div className="alert alert-warning my-4 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>تنبيه: لقد شاهدت أكثر من نصف مدة المحاضرة.</span>
          </div>
        </div>
      )}

      {isVideoEffectivelyBlocked ? (
        <div className="alert alert-error mb-6 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>لقد استنفذت جميع مشاهداتك المسموحة! سيتم إعادة توجيهك خلال 3 دقائق</span>
          </div>
        </div>
      ) : youtubeVideoId ? (
        <div className="mb-6 shadow-xl rounded-lg overflow-hidden">
          <MediaPlayer
            ref={(node) => (playerRef.current = node)}
            title={lecture.name}
            src={`youtube/${youtubeVideoId}`}
            poster={lecture.thumbnailLink || ''}
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
              {lecture.thumbnailLink && <Poster className="vds-poster" src={lecture.thumbnailLink} alt={`ملصق محاضرة ${lecture.name}`}/>}
            </MediaProvider>
            <DefaultVideoLayout 
              icons={defaultLayoutIcons} 
              thumbnails={lecture.videoThumbnailsVTT || null}
            />
          </MediaPlayer>
          <div className="p-4 bg-base-200 rounded-b-lg">
            {userRole === "Student" && <p className="mt-2 text-sm text-gray-600">المشاهدات المتبقية: {remainingViews === null ? 'جار التحميل...' : remainingViews}</p>}
          </div>
        </div>
      ) : lecture.videoLink ? (
        <div className="alert alert-warning mb-6 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>رابط الفيديو غير صالح أو لا يمكن عرضه حاليًا.</span>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-6 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>لا يوجد رابط فيديو متاح لهذه المحاضرة.</span>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">تفاصيل المحاضرة</h2>
          <p><strong>الوصف:</strong> {lecture.description || "لا يوجد وصف متوفر."}</p>
          <p><strong>السعر:</strong> {lecture.price !== undefined ? `${lecture.price} نقاط` : "غير محدد"}</p>
          <p><strong>النوع:</strong> {lecture.lecture_type || "غير محدد"}</p>
          <p><strong>عدد المشاهدات الكلية المسموحة للطالب:</strong> {lecture.numberOfViews !== undefined ? lecture.numberOfViews : "غير محدد"}</p>
          <p><strong>أنشأها:</strong> {lecture.createdBy?.name || "غير محدد"}</p>
          {lecture.requiresExam && <p><strong>يتطلب امتحان لاجتياز الدورة:</strong> نعم</p>}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">المرفقات</h2>
          
          {/* Tabs for attachment types */}
          <div className="tabs tabs-boxed mb-6">
            {["pdfsandimages", "homeworks", "exams", "booklets"].map(type => (
              <a 
                key={type}
                className={`tab ${activeTab === type ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                {getAttachmentTypeLabel(type)}
              </a>
            ))}
          </div>
          
          {/* Content for the active tab */}
          <div className="tab-content">
            {renderAttachments(attachments[activeTab] || [])}
            
            {/* File uploader for authorized users */}
            {hasUploadPermission() && (
              <div className="mt-6 p-4 border border-dashed border-primary rounded-lg">
                <h3 className="text-lg font-semibold mb-2">إضافة مرفقات جديدة ({getAttachmentTypeLabel(activeTab)})</h3>
                
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
                          <span className="text-sm">{file.name}</span>
                          <button 
                            onClick={() => handleRemoveFile(index)}
                            className="btn btn-circle btn-xs btn-ghost"
                          >
                            <FiX />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {uploadError && (
                  <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LectureDisplay