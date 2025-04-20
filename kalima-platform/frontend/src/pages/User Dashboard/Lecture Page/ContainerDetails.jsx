"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getContainerById } from "../../../routes/lectures"
import { BookOpen, FileText, Video } from 'lucide-react'

const ContainerDetailsPage = () => {
  const { containerId } = useParams()
  const [container, setContainer] = useState(null)
  const [childContainers, setChildContainers] = useState([])
  const [subjectName, setSubjectName] = useState("Unknown Subject")
  const [levelName, setLevelName] = useState("Unknown Level")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchContainerAndChildren = async () => {
      try {
        setLoading(true)

        // Fetch container details
        const containerResult = await getContainerById(containerId)
        console.log("Container data:", containerResult.data)

        if (containerResult.status !== "success") {
          throw new Error("Failed to fetch container details")
        }

        const containerData = containerResult.data
        setContainer(containerData)

        // Fetch subject and level details if they're just IDs
        if (
          typeof containerData.subject === "string" ||
          (typeof containerData.subject === "object" && !containerData.subject?.name)
        ) {
          try {
            // This would be a separate API call to get subject details
            // For now, we'll use a placeholder
            setSubjectName("Unknown Subject")
          } catch (err) {
            console.error("Error fetching subject:", err)
          }
        } else if (containerData.subject?.name) {
          setSubjectName(containerData.subject.name)
        }

        if (
          typeof containerData.level === "string" ||
          (typeof containerData.level === "object" && !containerData.level?.name)
        ) {
          try {
            // This would be a separate API call to get level details
            // For now, we'll use a placeholder
            setLevelName("Unknown Level")
          } catch (err) {
            console.error("Error fetching level:", err)
          }
        } else if (containerData.level?.name) {
          setLevelName(containerData.level.name)
        }

        // Fetch child containers if available
        if (containerData.children && containerData.children.length > 0) {
          const childIds = containerData.children.map((child) =>
            typeof child === "string" ? child : child._id || child.id,
          )

          if (childIds.length > 0) {
            try {
              // This would be a batch fetch of child containers
              // For now, we'll use the children data directly
              setChildContainers(containerData.children)
            } catch (err) {
              console.error("Error fetching child containers:", err)
            }
          }
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to load container details. Please try again later.")
        setLoading(false)
        console.error("Error:", err)
      }
    }

    if (containerId) {
      fetchContainerAndChildren()
    }
  }, [containerId])

  useEffect(() => {
    if (container && container.type === "lecture") {
      navigate(`/dashboard/lecture-page/${container._id || container.id}`)
    }
  }, [container, navigate])

  const handleChildClick = (child) => {
    // If the child is a lecture, navigate to the lecture page
    if (child.type === "lecture") {
      navigate(`/dashboard/lecture-page/${child._id || child.id}`)
    } else {
      // Otherwise, navigate to the container details page
      navigate(`/dashboard/lecturer-dashboard/container-details/${child._id || child.id}`)
    }
  }

  // Get container type in Arabic
  const getContainerTypeArabic = (type) => {
    switch (type) {
      case "course":
        return "كورس"
      case "year":
        return "سنة دراسية"
      case "term":
        return "فصل دراسي"
      case "month":
        return "شهر"
      case "lecture":
        return "محاضرة"
      default:
        return type
    }
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

  // If the current container is a lecture, redirect to the lecture page

  return (
    <div className="container mx-auto p-4" dir="rtl">
      {/* Container Header */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{container.name}</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="badge badge-primary">{subjectName}</div>
          <div className="badge badge-secondary">{levelName}</div>
          <div className="badge badge-outline">{getContainerTypeArabic(container.type)}</div>
          {container.teacherAllowed && <div className="badge badge-success">مسموح للمعلمين</div>}
        </div>

        {container.description && (
          <div className="bg-base-200 p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">الوصف:</h3>
            <p className="text-base-content">{container.description}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-lg">{container.createdBy?.name?.charAt(0) || "?"}</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-lg">{container.createdBy?.name || "Unknown"}</p>
              <p className="text-sm text-base-content/70">{container.createdBy?.role || "Unknown"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {container.price > 0 ? (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
                <span className="font-bold text-lg">{container.price}</span> جنيه
              </div>
            ) : (
              <div className="bg-success/10 text-success px-4 py-2 rounded-full">
                <span className="font-bold text-lg">مجاني</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container Children/Content */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          المحتويات ({childContainers.length})
        </h2>

        {childContainers.length === 0 ? (
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
            <span>لا يوجد محتوى متاح في هذا الكورس حاليا.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childContainers.map((child) => (
              <div
                key={child._id || child.id}
                className="card bg-base-200 hover:bg-base-300 transition-colors shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => handleChildClick(child)}
              >
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    {child.type === "lecture" && (
                      <Video className="h-5 w-5 text-primary" />
                    )}
                    {child.name}
                  </h3>

                  {child.type && (
                    <div className="mt-2">
                      <span className="badge badge-sm">{getContainerTypeArabic(child.type)}</span>
                      {child.type === "lecture" && child.videoLink && (
                        <span className="badge badge-sm badge-primary ml-2">فيديو</span>
                      )}
                      {child.type === "lecture" && child.lecture_type === "Free" && (
                        <span className="badge badge-sm badge-success ml-2">مجاني</span>
                      )}
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm">
                      {child.type === "lecture" ? "مشاهدة المحاضرة" : "عرض المحتوى"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parent Container Info (if available) */}
      {container.parent && (
        <div className="mt-8 bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">جزء من:</h2>
          <div
            className="flex items-center gap-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
            onClick={() => {
              const parentId = typeof container.parent === "string" 
                ? container.parent 
                : container.parent._id || container.parent.id;
              navigate(`/dashboard/lecturer-dashboard/container-details/${parentId}`);
            }}
          >
            <div className="bg-primary/10 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {typeof container.parent === "string" ? "الكورس الأساسي" : container.parent.name || "الكورس الأساسي"}
              </p>
              <p className="text-sm text-base-content/70">
                {typeof container.parent === "string" ? "" : getContainerTypeArabic(container.parent.type) || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContainerDetailsPage