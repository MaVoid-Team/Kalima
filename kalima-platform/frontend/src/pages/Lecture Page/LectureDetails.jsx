"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLectureById } from "../../routes/lectures"
import { isMobile } from "../../utils/isMobile"

// Tab data
const tabData = [
  { id: "lectures", label: "محاضرات", active: true },
  { id: "attachments", label: "مرفقات", active: false },
  { id: "assignments", label: "واجبات", active: false },
  { id: "tests", label: "اختبارات", active: false },
]

const LectureDetail = () => {
  const { id } = useParams()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("lectures")
  const [expandedSection, setExpandedSection] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not on mobile
    // if (!isMobile()) {
    //   navigate("/mobile-only")
    //   return
    // }

    const fetchLecture = async () => {
      try {
        setLoading(true)
        const result = await getLectureById(id)
        setLecture(result.data.container)
        setLoading(false)
      } catch (err) {
        setError("Failed to load lecture. Please try again later.")
        setLoading(false)
      }
    }

    fetchLecture()
  }, [id, navigate])

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null)
    } else {
      setExpandedSection(sectionId)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const renderVideoPlayer = () => {
    if (!lecture || !lecture.videoLink) return null

    return (
      <div className="bg-base-200 rounded-lg aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="btn btn-circle btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="btn btn-xs btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="btn btn-xs btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-base-content">00:00 / 10:30</div>
        </div>
      </div>
    )
  }

  const renderLectureCard = () => {
    if (!lecture) return null

    return (
      <div className="card bg-base-100 shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handleBack} className="btn btn-circle btn-sm btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-primary">{lecture.name}</h2>
          </div>

          <div className="mt-4">
            {renderVideoPlayer()}
            <div className="mt-4">
              <p className="text-sm">{lecture.description}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-right flex-1">
                <div className="flex items-center gap-1 text-sm text-base-content/70">
                  <span>{lecture.createdBy?.name}</span>
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-5 h-5">
                      <span className="text-xs">{lecture.createdBy?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex border-b">
            {tabData.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 py-2 text-sm font-medium ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-base-content/70"}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
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

  return (
    <div className="p-4 max-w-md mx-auto" dir="rtl">
      <div className="grid grid-cols-1 gap-4">{renderLectureCard()}</div>
    </div>
  )
}

export default LectureDetail;

