"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getContainerById } from "../../../routes/lectures"

const ContainerDetailsPage = () => {
  const { containerId } = useParams()
  const [container, setContainer] = useState(null)
  const [childContainers, setChildContainers] = useState([])
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch container data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get container details
        const containerResult = await getContainerById(containerId)
        if (containerResult.status !== "success") {
          throw new Error("Failed to load container details")
        }
        
        const containerData = containerResult.data
        setContainer(containerData)

        // Separate children into containers and lectures
        const children = containerData.children || []
        const childContainers = children.filter(child => !child.kind || child.kind !== "Lecture")
        const childLectures = children.filter(child => child.kind === "Lecture")

        setChildContainers(childContainers)
        setLectures(childLectures)

      } catch (err) {
        setError(err.message || "Failed to load container data")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [containerId])

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

  if (!container) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>الحاوية غير موجودة</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20" dir="rtl">
      {/* Back Button */}
      <div className="mb-4">
        <Link to="/dashboard" className="btn btn-sm btn-outline">
          العودة
        </Link>
      </div>

      {/* Container Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{container.name}</h1>
        <div className="flex flex-wrap gap-2">
          {container.subject?.name && (
            <div className="badge badge-primary">{container.subject.name}</div>
          )}
          {container.level?.name && (
            <div className="badge badge-secondary">{container.level.name}</div>
          )}
          <div className="badge badge-accent">{container.type}</div>
          {container.price > 0 && (
            <div className="badge badge-info">{container.price} points</div>
          )}
        </div>
      </div>

      {/* Child Containers Section */}
      {childContainers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">الحاويات الفرعية</h2>
          <div className="grid grid-cols-1 gap-3">
            {childContainers.map(child => (
              <div key={child._id} className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-lg">{child.name}</h3>
                    <Link 
                      to={`/dashboard/container-details/${child._id}`} 
                      className="btn btn-sm btn-primary"
                    >
                      عرض
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lectures Section */}
      {lectures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">المحاضرات</h2>
          <div className="grid grid-cols-1 gap-3">
            {lectures.map(lecture => (
              <div key={lecture._id} className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-lg">{lecture.name}</h3>
                    <Link
                      to={`/dashboard/student-dashboard/lecture-page/${lecture._id}`} 
                      className="btn btn-sm btn-primary"
                    >
                      عرض
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {childContainers.length === 0 && lectures.length === 0 && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>لا توجد محتويات متاحة في هذه الحاوية</span>
        </div>
      )}
    </div>
  )
}

export default ContainerDetailsPage