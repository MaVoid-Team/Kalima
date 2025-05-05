"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { getContainerById, createContainer, createLecture, createLectureAttachment } from "../../../routes/lectures"
import { getUserDashboard } from "../../../routes/auth-services"
import { FiBook, FiFolder, FiArrowLeft, FiPlus, FiX, FiPaperclip } from "react-icons/fi"

const ContainerDetailsPage = () => {
  const { containerId } = useParams()
  const navigate = useNavigate()
  const [container, setContainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  
  // Creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newGoal, setNewGoal] = useState("")
  const [newPrice, setNewPrice] = useState(0)
  const [newVideoLink, setNewVideoLink] = useState("")
  const [newLectureType, setNewLectureType] = useState("Revision")
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [creationLoading, setCreationLoading] = useState(false)
  const [creationError, setCreationError] = useState("")

  // Fetch container data
  const fetchContainer = async () => {
    try {
      const response = await getContainerById(containerId)
      if (response.status === 'success') {
        setContainer(response.data)
      } else {
        setError("Failed to load container details")
      }
    } catch (err) {
      setError(err.message || "Failed to load data. Please try again later.")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const dashRes = await getUserDashboard()
        if (!dashRes.success) {
          setError("Failed to load user info")
          return
        }

        const { userInfo } = dashRes.data.data
        setUserRole(userInfo.role)
        setUserId(userInfo._id)
        await fetchContainer()
      } catch (err) {
        setError(err.message || "Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [containerId])

  const getAllowedChildType = () => {
    if (!container) return null
    switch (container.type.toLowerCase()) {
      case 'course': return 'year'
      case 'year': return 'term'
      case 'term': return 'month'
      case 'month': return 'lecture'
      default: return null
    }
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    setCreationLoading(true)
    setCreationError("")

    try {
      const childType = getAllowedChildType()
      if (!childType) throw new Error("Invalid container type for creation")
      if (!newItemName) throw new Error("Name is required")

      // Common fields for both containers and lectures
      const baseData = {
        name: newItemName,
        parent: containerId,
        createdBy: userId,
        level: container.level?._id,
        subject: container.subject?._id,
        teacherAllowed: true,
        price: Number(newPrice) || 0,
      }

      let response
      if (childType === 'lecture') {
        if (!newVideoLink) throw new Error("Video link is required for lectures")
        const lectureData = {
          ...baseData,
          type: 'lecture',
          description: newDescription || `Lecture for ${newItemName}`,
          numberOfViews: 0,
          videoLink: newVideoLink,
          lecture_type: newLectureType,
        }
        response = await createLecture(lectureData)
      } else {
        if (!newDescription) throw new Error("Description is required for containers")
        if (!newGoal) throw new Error("Goal is required for containers")
        const containerData = {
          ...baseData,
          type: childType,
          description: newDescription,
          goal: newGoal,
        }
        response = await createContainer(containerData)
      }

      if (response.status !== 'success') {
        throw new Error(response.message || `Failed to create ${childType}`)
      }

      // If it's a lecture and there's an attachment, upload it
      if (childType === 'lecture' && attachmentFile) {
        const attachmentData = {
          type: "homework",
          attachment: attachmentFile,
        }
        await createLectureAttachment(response.data._id, attachmentData)
      }

      // Refetch container to update UI
      await fetchContainer()

      setShowCreateModal(false)
      setNewItemName("")
      setNewDescription("")
      setNewGoal("")
      setNewPrice(0)
      setNewVideoLink("")
      setNewLectureType("Revision")
      setAttachmentFile(null)
    } catch (err) {
      setCreationError(err.message)
      console.error('Creation error details:', {
        error: err,
        containerId,
        childType,
        newItemName,
        newDescription,
        newGoal,
        newPrice,
        newVideoLink,
        newLectureType,
      })
    } finally {
      setCreationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-8">
        <div className="h-8 bg-base-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-base-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-base-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-base-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to={userRole === 'Lecturer' ? "/dashboard/lecturer-dashboard" : "/dashboard/student-dashboard/promo-codes"}
            className="btn btn-outline px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const childType = getAllowedChildType()
  const creationLabel = childType === 'lecture' ? 'Lecture' : `${childType?.charAt(0).toUpperCase() + childType?.slice(1)}`

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            {container.points > 0 && (
              <div className="bg-primary/30 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-lg">🏅</span>
                <span className="font-medium">{container.points} Points</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl shadow-sm p-8 mb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{container.name}</h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <FiFolder className="text-lg" />
                {container.type}
              </span>
              <span className="flex items-center gap-2">
                <FiBook className="text-lg" />
                {container.subject?.name}
              </span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {container.children?.map(child => (
              <div 
                key={child._id}
                className="group relative rounded-xl"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {childType === 'lecture' ? (
                        <FiBook className="text-primary text-xl" />
                      ) : (
                        <FiFolder className="text-primary text-xl" />
                      )}
                    </div>
                    <h3 className="font-medium">{child.name}</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {childType || container.type}
                    </span>
                    <Link
                      to={
                        userRole === 'Lecturer'
                          ? `/dashboard/lecturer-dashboard/${childType === 'lecture' ? 'lecture-display' : 'container-details'}/${child._id}`
                          : `/dashboard/student-dashboard/${childType === 'lecture' ? 'lecture-display' : 'container-details'}/${child._id}`
                      }
                      className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 rounded-full"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {container.children?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="">No content available in this container</p>
            </div>
          )}
        </div>

        {/* Lecturer Actions */}
        {userRole === 'Lecturer' && childType && (
          <div className="flex gap-4 justify-end">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary px-6 py-3 rounded-full flex items-center gap-2"
            >
              <FiPlus className="text-lg" />
              Add {creationLabel}
            </button>
          </div>
        )}
      </div>

      {/* DaisyUI Modal */}
      <div className={`modal ${showCreateModal && 'modal-open'}`}>
        <div className="modal-box max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Create New {creationLabel}</h3>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateItem}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder={`Enter ${creationLabel} name`}
                className="input input-bordered w-full"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                placeholder={`Enter ${creationLabel} description`}
                className="textarea textarea-bordered w-full"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required={childType !== 'lecture'}
              />
            </div>

            {childType !== 'lecture' && (
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Goal</span>
                </label>
                <textarea
                  placeholder={`Enter ${creationLabel} goal`}
                  className="textarea textarea-bordered w-full"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                type="number"
                placeholder="Enter price"
                className="input input-bordered w-full"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0"
                required
              />
            </div>

            {childType === 'lecture' && (
              <>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Video URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="Enter video link"
                    className="input input-bordered w-full"
                    value={newVideoLink}
                    onChange={(e) => setNewVideoLink(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Lecture Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={newLectureType}
                    onChange={(e) => setNewLectureType(e.target.value)}
                  >
                    <option value="Revision">Revision</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Attach Homework (Optional, .pdf only)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setAttachmentFile(e.target.files[0])}
                      className="input input-bordered w-full"
                      accept=".pdf"
                    />
                    <FiPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
                  </div>
                  {attachmentFile && (
                    <p className="mt-2 text-sm text-base-content/70">Selected file: {attachmentFile.name}</p>
                  )}
                </div>
              </>
            )}

            {creationError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{creationError}</span>
              </div>
            )}

            <div className="modal-action">
              <button 
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowCreateModal(false)}
                disabled={creationLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={creationLoading}
              >
                {creationLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContainerDetailsPage