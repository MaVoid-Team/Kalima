"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { getContainerById, createContainer, createLecture, createLectureAttachment } from "../../../routes/lectures"
import { getUserDashboard } from "../../../routes/auth-services"
import { getExamConfigs, createExamConfig } from "../../../routes/examConfigs"
import { getAllLevels } from "../../../routes/levels"
import { getAllSubjects } from "../../../routes/courses" // Make sure this import path is correct
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
  const [numberOfViews, setNumberOfViews] = useState(0)
  const [requiresExam, setRequiresExam] = useState(false)
  const [examConfig, setExamConfig] = useState("")
  const [passingThreshold, setPassingThreshold] = useState(50)
  const [examConfigs, setExamConfigs] = useState([])
  const [examConfigsLoading, setExamConfigsLoading] = useState(false)
  const [examConfigsError, setExamConfigsError] = useState("")
  const [selectedExamConfigId, setSelectedExamConfigId] = useState("")
  const [isCreatingNewExamConfig, setIsCreatingNewExamConfig] = useState(false)
  const [newExamConfig, setNewExamConfig] = useState({
    name: "",
    description: "",
    googleSheetId: "",
    formUrl: "",
    studentIdentifierColumn: "Email Address",
    scoreColumn: "Score",
    defaultPassingThreshold: 60,
  })

  // New state variables for levels and subjects
  const [levels, setLevels] = useState([])
  const [subjects, setSubjects] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [attachmentType, setAttachmentType] = useState("homeworks")

  useEffect(() => {
    if (showCreateModal && userRole === "Lecturer" && container?.type?.toLowerCase() === "month") {
      fetchExamConfigs()
    }
  }, [showCreateModal, userRole, container?.type])

  // New useEffect to fetch levels and subjects when modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchLevels()
      fetchSubjects()
    }
  }, [showCreateModal])

  // Functions to fetch levels and subjects
  const fetchLevels = async () => {
    try {
      setLevelsLoading(true)
      const response = await getAllLevels()
      if (response.success) {
        setLevels(response.data)
      } else {
        console.error("Failed to fetch levels:", response.error)
      }
    } catch (error) {
      console.error("Error fetching levels:", error)
    } finally {
      setLevelsLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true)
      const response = await getAllSubjects()
      if (response.success) {
        setSubjects(response.data)
      } else {
        console.error("Failed to fetch subjects:", response.error)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setSubjectsLoading(false)
    }
  }

  const fetchExamConfigs = async () => {
    setExamConfigsLoading(true)
    setExamConfigsError("")
    try {
      console.log("Fetching exam configs...")
      const response = await getExamConfigs()
      console.log("Exam Configs Response:", response)

      if (response.success && response.data) {
        // Try to extract exam configs from different possible response structures
        const configs =
          (response.data.data && response.data.data.examConfigs) || // Format: { data: { data: { examConfigs: [...] } } }
          response.data.examConfigs || // Format: { data: { examConfigs: [...] } }
          (Array.isArray(response.data) ? response.data : []) // Format: { data: [...] }

        console.log("Extracted exam configs:", configs)

        if (Array.isArray(configs) && configs.length > 0) {
          setExamConfigs(configs)
        } else {
          console.log("No exam configs found in response")
          setExamConfigsError("No exam configurations found. Please create a new one.")
          setExamConfigs([])
        }
      } else {
        console.error("Failed to fetch exam configs:", response.message)
        setExamConfigsError(response.message || "Failed to fetch exam configs")
        setExamConfigs([])
      }
    } catch (err) {
      console.error("Error fetching exam configs:", err)
      setExamConfigsError(err.message || "Failed to fetch exam configs")
      setExamConfigs([])
    } finally {
      setExamConfigsLoading(false)
    }
  }

  // Add this effect for default passing threshold
  useEffect(() => {
    if (selectedExamConfigId && !isCreatingNewExamConfig) {
      const selectedConfig = examConfigs.find((c) => c._id === selectedExamConfigId)
      if (selectedConfig) {
        setPassingThreshold(selectedConfig.defaultPassingThreshold)
      }
    }
  }, [selectedExamConfigId, examConfigs, isCreatingNewExamConfig])

  // Fetch container data
  const fetchContainer = async () => {
    try {
      const response = await getContainerById(containerId)
      if (response.status === "success") {
        setContainer(response.data)

        // If container has level and subject, pre-select them
        if (response.data.level?._id) {
          setSelectedLevel(response.data.level._id)
        }
        if (response.data.subject?._id) {
          setSelectedSubject(response.data.subject._id)
        }
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
      case "course":
        return "year"
      case "year":
        return "term"
      case "term":
        return "month"
      case "month":
        return "lecture"
      default:
        return null
    }
  }

  // Reset form function
  const resetForm = () => {
    setNewItemName("")
    setNewDescription("")
    setNewGoal("")
    setNewPrice(0)
    setNewVideoLink("")
    setNewLectureType("Revision")
    setAttachmentFile(null)
    setNumberOfViews(0)
    setRequiresExam(false)
    setExamConfig("")
    setPassingThreshold(50)
    setSelectedLevel("")
    setSelectedSubject("")
    setAttachmentType("homeworks")
    setSelectedExamConfigId("")
    setIsCreatingNewExamConfig(false)
    setNewExamConfig({
      name: "",
      description: "",
      googleSheetId: "",
      formUrl: "",
      studentIdentifierColumn: "Email Address",
      scoreColumn: "Score",
      defaultPassingThreshold: 60,
    })
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    setCreationLoading(true)
    setCreationError("")

    try {
      const childType = getAllowedChildType()
      if (!childType) throw new Error("Invalid container type for creation")
      if (!newItemName) throw new Error("Name is required")

      // For lectures, validate level and subject
      if (childType === "lecture") {
        if (!selectedLevel) throw new Error("Level is required")
        if (!selectedSubject) throw new Error("Subject is required")
        if (!newVideoLink) throw new Error("Video link is required for lectures")
      }

      const baseData = {
        name: newItemName,
        parent: containerId,
        createdBy: userId,
        level: selectedLevel || (container.level?._id || ""),
        subject: selectedSubject || (container.subject?._id || ""),
        teacherAllowed: true,
        price: Number(newPrice) || 0,
      }

      let response
      if (childType === "lecture") {
        const lectureData = {
          name: newItemName,
          type: "lecture",
          createdBy: userId,
          level: selectedLevel || (container.level?._id || ""),
          subject: selectedSubject || (container.subject?._id || ""),
          parent: containerId,
          price: Number(newPrice) || 0,
          description: newDescription || `Lecture for ${newItemName}`,
          numberOfViews: Number(numberOfViews) || 0,
          videoLink: newVideoLink,
          teacherAllowed: true,
          lecture_type: newLectureType,
          requiresExam: requiresExam,
        }

        console.log("Creating lecture with data:", lectureData)

        if (requiresExam) {
          let examConfigIdToUse
          if (isCreatingNewExamConfig) {
            // Validate required fields for new exam config
            if (!newExamConfig.name || !newExamConfig.googleSheetId || !newExamConfig.formUrl) {
              throw new Error("Please fill in all required exam configuration fields")
            }

            console.log("Creating new exam config:", newExamConfig)
            const createResponse = await createExamConfig(newExamConfig)
            console.log("Create exam config response:", createResponse)

            // Enhanced logic to extract the exam config ID from different response formats
            if (createResponse.success === true && createResponse.data) {
              // Check all possible locations for the ID
              if (createResponse.data._id) {
                examConfigIdToUse = createResponse.data._id
                console.log("Found exam config ID at createResponse.data._id:", examConfigIdToUse)
              } else if (
                createResponse.data.data &&
                createResponse.data.data.examConfig &&
                createResponse.data.data.examConfig._id
              ) {
                examConfigIdToUse = createResponse.data.data.examConfig._id
                console.log("Found exam config ID at createResponse.data.data.examConfig._id:", examConfigIdToUse)
              } else if (createResponse.data.examConfig && createResponse.data.examConfig._id) {
                examConfigIdToUse = createResponse.data.examConfig._id
                console.log("Found exam config ID at createResponse.data.examConfig._id:", examConfigIdToUse)
              } else {
                console.error("Could not find exam config ID in response:", createResponse)
                throw new Error("Failed to extract exam config ID from response")
              }
            } else if (createResponse.status === "success" && createResponse.data && createResponse.data._id) {
              examConfigIdToUse = createResponse.data._id
              console.log("Found exam config ID at createResponse.data._id:", examConfigIdToUse)
            } else {
              console.error("Invalid response format from createExamConfig:", createResponse)
              throw new Error(createResponse.message || "Failed to create exam config")
            }
          } else {
            if (!selectedExamConfigId) {
              throw new Error("Please select an exam configuration")
            }
            examConfigIdToUse = selectedExamConfigId
            console.log("Using selected exam config ID:", examConfigIdToUse)
          }

          // Set the exam config ID in the lecture data
          lectureData.examConfig = examConfigIdToUse
          console.log("Setting lecture examConfig to:", examConfigIdToUse)
          lectureData.passingThreshold = Number(passingThreshold) || 60
        }

        try {
          response = await createLecture(lectureData)
          console.log("Create lecture response:", response)

          if (response.status !== "success" && response.success !== true) {
            throw new Error(response.message || `Failed to create ${childType}`)
          }

          // Handle attachment after successful lecture creation
          if (attachmentFile) {
            try {
              // Extract the lecture ID correctly from the response
              let lectureId = null

              // Check different possible locations for the lecture ID
              if (response.data && response.data.lecture && response.data.lecture._id) {
                lectureId = response.data.lecture._id
                console.log("Found lecture ID at response.data.lecture._id:", lectureId)
              } else if (response.data && response.data._id) {
                lectureId = response.data._id
                console.log("Found lecture ID at response.data._id:", lectureId)
              } else if (response.data && response.data.lecture && response.data.lecture.id) {
                lectureId = response.data.lecture.id
                console.log("Found lecture ID at response.data.lecture.id:", lectureId)
              } else if (response.data && response.data.id) {
                lectureId = response.data.id
                console.log("Found lecture ID at response.data.id:", lectureId)
              }

              if (!lectureId) {
                console.error("Could not find lecture ID in response:", response)
                throw new Error("Failed to extract lecture ID from response")
              }

              console.log("Uploading attachment for lecture ID:", lectureId)
              const attachmentData = {
                type: attachmentType,
                attachment: attachmentFile,
              }

              const attachmentResponse = await createLectureAttachment(lectureId, attachmentData)
              console.log("Attachment upload response:", attachmentResponse)
            } catch (attachmentError) {
              console.error("Error uploading attachment:", attachmentError)
              setCreationError(`Lecture created but failed to upload attachment: ${attachmentError.message}`)
            }
          }
        } catch (err) {
          console.error("Error creating lecture:", err)
          throw err
        }
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

      if (response.status !== "success" && response.success !== true) {
        throw new Error(response.message || `Failed to create ${childType}`)
      }

      await fetchContainer()

      setShowCreateModal(false)
      resetForm()
    } catch (err) {
      setCreationError(err.message)
      console.error("Creation error details:", {
        error: err,
        containerId,
        childType: getAllowedChildType(),
        newItemName,
        newDescription,
        newGoal,
        newPrice,
        newVideoLink,
        newLectureType,
        requiresExam,
        examConfig,
        passingThreshold,
        selectedLevel,
        selectedSubject,
        attachmentType,
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
            to={userRole === "Lecturer" ? "/dashboard/lecturer-dashboard" : "/dashboard/student-dashboard/promo-codes"}
            className="btn btn-outline px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const childType = getAllowedChildType()
  const creationLabel =
    childType === "lecture" ? "Lecture" : `${childType?.charAt(0).toUpperCase() + childType?.slice(1)}`

  // Exam Config Section Component (integrated directly)
  const ExamConfigSection = () => {
    if (!requiresExam) return null

    const hasExistingConfigs = Array.isArray(examConfigs) && examConfigs.length > 0

    return (
      <>
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Exam Configuration</span>
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered flex-grow"
                value={isCreatingNewExamConfig ? "new" : selectedExamConfigId}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "new") {
                    setIsCreatingNewExamConfig(true)
                    setSelectedExamConfigId("")
                  } else {
                    setIsCreatingNewExamConfig(false)
                    setSelectedExamConfigId(value)
                  }
                }}
                disabled={examConfigsLoading}
              >
                <option value="">Select Exam Config</option>
                {hasExistingConfigs ? (
                  examConfigs.map((config) => (
                    <option key={config._id} value={config._id}>
                      {config.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No existing configs
                  </option>
                )}
                <option value="new">Create New Exam Config</option>
              </select>
              {examConfigsLoading && <span className="loading loading-spinner"></span>}
            </div>
            {examConfigsError && <div className="text-error text-sm">{examConfigsError}</div>}
            {!hasExistingConfigs && !examConfigsError && !examConfigsLoading && (
              <div className="text-info text-sm">No existing exam configurations found. You can create a new one.</div>
            )}
          </div>
        </div>

        {isCreatingNewExamConfig ? (
          <NewExamConfigForm />
        ) : (
          selectedExamConfigId && (
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Passing Threshold</span>
              </label>
              <input
                type="number"
                placeholder="Enter passing threshold"
                className="input input-bordered w-full"
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>
          )
        )}
      </>
    )
  }

  // New Exam Config Form Component (integrated directly)
  const NewExamConfigForm = () => {
    return (
      <div className="space-y-4 mb-4 p-4 border border-base-300 rounded-lg">
        <h4 className="font-medium">New Exam Configuration</h4>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter exam config name"
            className="input input-bordered w-full"
            value={newExamConfig.name}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            placeholder="Enter description"
            className="textarea textarea-bordered w-full"
            value={newExamConfig.description}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Google Sheet ID</span>
          </label>
          <input
            type="text"
            placeholder="Eg : 1Iaosq_KHl7w6__oJB9nFnFr9QYiTDmSSKrWADszUcsM"
            className="input input-bordered w-full"
            value={newExamConfig.googleSheetId}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, googleSheetId: e.target.value }))}
            required
          />
          <label className="label">
            <span className="label-text-alt">The ID from your Google Sheet URL</span>
          </label>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Form URL</span>
          </label>
          <input
            type="url"
            placeholder="Enter Google Form URL"
            className="input input-bordered w-full"
            value={newExamConfig.formUrl}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, formUrl: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Student Identifier Column</span>
            </label>
            <input
              type="text"
              placeholder="Column name"
              className="input input-bordered w-full"
              value={newExamConfig.studentIdentifierColumn}
              onChange={(e) => setNewExamConfig((prev) => ({ ...prev, studentIdentifierColumn: e.target.value }))}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Score Column</span>
            </label>
            <input
              type="text"
              placeholder="Column name"
              className="input input-bordered w-full"
              value={newExamConfig.scoreColumn}
              onChange={(e) => setNewExamConfig((prev) => ({ ...prev, scoreColumn: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Default Passing Threshold (%)</span>
          </label>
          <input
            type="number"
            placeholder="Enter threshold"
            className="input input-bordered w-full"
            value={newExamConfig.defaultPassingThreshold}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, defaultPassingThreshold: Number(e.target.value) }))}
            min="0"
            max="100"
            required
          />
        </div>
      </div>
    )
  }

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
            {container.children?.map((child) => (
              <div key={child._id} className="group relative rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {childType === "lecture" ? (
                        <FiBook className="text-primary text-xl" />
                      ) : (
                        <FiFolder className="text-primary text-xl" />
                      )}
                    </div>
                    <h3 className="font-medium">{child.name}</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{childType || container.type}</span>
                    <Link
                      to={
                        userRole === "Lecturer"
                          ? `/dashboard/lecturer-dashboard/${childType === "lecture" ? "lecture-display" : "container-details"}/${child._id}`
                          : `/dashboard/student-dashboard/${childType === "lecture" ? "lecture-display" : "container-details"}/${child._id}`
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
        {userRole === "Lecturer" && childType && (
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
      <div className={`modal ${showCreateModal && "modal-open"}`}>
        <div className="modal-box max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Create New {creationLabel}</h3>
            <button onClick={() => {
              setShowCreateModal(false)
              resetForm()
            }} className="btn btn-sm btn-circle btn-ghost">
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

            {/* Level dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Level</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                required
              >
                <option value="">Select a level</option>
                {levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
              {levelsLoading && <span className="loading loading-spinner mt-2"></span>}
            </div>

            {/* Subject dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Subject</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {subjectsLoading && <span className="loading loading-spinner mt-2"></span>}
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
                required={childType !== "lecture"}
              />
            </div>

            {childType !== "lecture" && (
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

            {childType === "lecture" && (
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
                    <span className="label-text">Number of Views</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter number of views"
                    className="input input-bordered w-full"
                    value={numberOfViews}
                    onChange={(e) => setNumberOfViews(e.target.value)}
                    min="0"
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
                    <span className="label-text">Requires Exam</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={requiresExam}
                    onChange={(e) => setRequiresExam(e.target.value === "true")}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>

                {/* Integrated Exam Config Section */}
                <ExamConfigSection />

                {/* Updated attachment section with type selection */}
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Attachment (Optional)</span>
                  </label>
                  <div className="space-y-3">
                    <select
                      className="select select-bordered w-full"
                      value={attachmentType}
                      onChange={(e) => setAttachmentType(e.target.value)}
                    >
                      <option value="pdfsandimages">PDFs and Images</option>
                      <option value="booklets">Booklets</option>
                      <option value="homeworks">Homeworks</option>
                      <option value="exams">Exams</option>
                    </select>

                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setAttachmentFile(e.target.files[0])}
                        className="input input-bordered w-full"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <FiPaperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
                    </div>
                    {attachmentFile && (
                      <p className="mt-2 text-sm text-base-content/70">Selected file: {attachmentFile.name}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {creationError && (
              <div className="alert alert-error mb-4">
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
                <span>{creationError}</span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                disabled={creationLoading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={creationLoading}>
                {creationLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default ContainerDetailsPage