"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getContainerById, getLecturesByContainerId } from "../../../routes/lectures"

const ContainerDetailsPage = () => {
  const { containerId } = useParams()
  const [container, setContainer] = useState(null)
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log("Container ID from params:", containerId)
  
    const fetchContainerAndLectures = async () => {
      try {
        setLoading(true)
  
        const containerResult = await getContainerById(containerId)
        console.log("Container data:", containerResult.data)
        const containerData = containerResult.data.container || containerResult.data
        setContainer(containerData)
  
        const lecturesResult = await getLecturesByContainerId(containerId)
        console.log("Lectures data:", lecturesResult.data)
        setLectures(lecturesResult.data.lectures)
  
        setLoading(false)
      } catch (err) {
        setError("Failed to load container details. Please try again later.")
        setLoading(false)
        console.error("Error:", err)
      }
    }
  
    if (containerId) {
      fetchContainerAndLectures()
    }
  }, [containerId])
  

  const handleLectureClick = (lectureId) => {
    navigate(`/container-details/${containerId}/lecture-page/${lectureId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error || !container) {
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
          <span>{error || "Container not found"}</span>
        </div>
      </div>
    )
  }

  // Handle the case where subject and level might be objects or just IDs
  const subjectName = container.subject?.name || "Unknown Subject"
  const levelName = container.level?.name || "Unknown Level"

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{container.name}</h1>
        <div className="flex gap-2 mb-4">
          <div className="badge badge-primary">{subjectName}</div>
          <div className="badge badge-secondary">{levelName}</div>
          <div className="badge badge-outline">{container.type}</div>
        </div>

        {container.description && <p className="text-gray-700 mb-4">{container.description}</p>}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>{container.createdBy?.name?.charAt(0) || "?"}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">{container.createdBy?.name || "Unknown"}</p>
              <p className="text-sm text-gray-500">{container.createdBy?.role || "Unknown"}</p>
            </div>
          </div>
          <div className="text-lg">
            <span className="font-bold">{container.price}</span> جنيه
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">المحاضرات ({lectures.length})</h2>

      {lectures.length === 0 ? (
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
            />
          </svg>
          <span>لا توجد محاضرات متاحة في هذا الكورس حاليا.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => handleLectureClick(lecture._id)}
            >
              <div className="card-body">
                <h3 className="card-title">{lecture.name}</h3>
                {lecture.description && <p className="mt-2">{lecture.description}</p>}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">
                    <span className="font-bold">{lecture.price || "Free"}</span> {lecture.price ? "جنيه" : ""}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {lecture.numberOfViews || 0}
                  </div>
                </div>

                {lecture.kind && (
                  <div className="mt-2 text-xs">
                    <span className="badge badge-sm">{lecture.kind}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContainerDetailsPage
