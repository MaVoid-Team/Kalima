"use client"

import { useState, useEffect } from "react"
import { FiX, FiPaperclip } from "react-icons/fi"
import { createExamConfig, getExamConfigs } from "../routes/examConfigs"
import { getAllLevels } from "../routes/levels"
import { getAllSubjects } from "../routes/courses"

const LectureCreationModal = ({
  isOpen,
  onClose,
  onSubmit,
  containerId,
  userId,
  containerLevel,
  containerSubject,
  containerType,
}) => {
  // Form state
  const [newItemName, setNewItemName] = useState("")
  const [newDescription, setNewDescription] = useState("")
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

  // Levels and subjects state
  const [levels, setLevels] = useState([])
  const [subjects, setSubjects] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [attachmentType, setAttachmentType] = useState("homeworks")

  // Fetch exam configs when modal opens and requires exam is true
  useEffect(() => {
    if (isOpen && requiresExam && containerType?.toLowerCase() === "month") {
      fetchExamConfigs()
    }
  }, [isOpen, requiresExam, containerType])

  // Fetch levels and subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLevels()
      fetchSubjects()

      // Set default values from container if available
      if (containerLevel) {
        setSelectedLevel(containerLevel)
      }
      if (containerSubject) {
        setSelectedSubject(containerSubject)
      }
    }
  }, [isOpen, containerLevel, containerSubject])

  // Update passing threshold when exam config changes
  useEffect(() => {
    if (selectedExamConfigId && !isCreatingNewExamConfig) {
      const selectedConfig = examConfigs.find((c) => c._id === selectedExamConfigId)
      if (selectedConfig) {
        setPassingThreshold(selectedConfig.defaultPassingThreshold)
      }
    }
  }, [selectedExamConfigId, examConfigs, isCreatingNewExamConfig])

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

  // Reset form function
  const resetForm = () => {
    setNewItemName("")
    setNewDescription("")
    setNewPrice(0)
    setNewVideoLink("")
    setNewLectureType("Revision")
    setAttachmentFile(null)
    setNumberOfViews(0)
    setRequiresExam(false)
    setExamConfig("")
    setPassingThreshold(50)
    setSelectedLevel(containerLevel || "")
    setSelectedSubject(containerSubject || "")
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
    setCreationError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreationLoading(true)
    setCreationError("")

    try {
      if (!newItemName) throw new Error("Name is required")
      if (!selectedLevel) throw new Error("Level is required")
      if (!selectedSubject) throw new Error("Subject is required")
      if (!newVideoLink) throw new Error("Video link is required for lectures")

      // Prepare lecture data
      const lectureData = {
        name: newItemName,
        type: "lecture",
        createdBy: userId,
        level: selectedLevel,
        subject: selectedSubject,
        parent: containerId,
        price: Number(newPrice) || 0,
        description: newDescription || `Lecture for ${newItemName}`,
        numberOfViews: Number(numberOfViews) || 0,
        videoLink: newVideoLink,
        teacherAllowed: true,
        lecture_type: newLectureType,
        requiresExam: requiresExam,
      }

      // Handle exam config if required
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

          // Extract the exam config ID from different response formats
          if (createResponse.success === true && createResponse.data) {
            if (createResponse.data._id) {
              examConfigIdToUse = createResponse.data._id
            } else if (
              createResponse.data.data &&
              createResponse.data.data.examConfig &&
              createResponse.data.data.examConfig._id
            ) {
              examConfigIdToUse = createResponse.data.data.examConfig._id
            } else if (createResponse.data.examConfig && createResponse.data.examConfig._id) {
              examConfigIdToUse = createResponse.data.examConfig._id
            } else {
              throw new Error("Failed to extract exam config ID from response")
            }
          } else if (createResponse.status === "success" && createResponse.data && createResponse.data._id) {
            examConfigIdToUse = createResponse.data._id
          } else {
            throw new Error(createResponse.message || "Failed to create exam config")
          }
        } else {
          if (!selectedExamConfigId) {
            throw new Error("Please select an exam configuration")
          }
          examConfigIdToUse = selectedExamConfigId
        }

        // Set the exam config ID in the lecture data
        lectureData.examConfig = examConfigIdToUse
        lectureData.passingThreshold = Number.parseInt(passingThreshold, 10) || 50
      }

      // Call the onSubmit callback with the lecture data and attachment
      await onSubmit(lectureData, attachmentFile, attachmentType)

      // Reset form and close modal on success
      resetForm()
      onClose()
    } catch (err) {
      setCreationError(err.message)
      console.error("Creation error:", err)
    } finally {
      setCreationLoading(false)
    }
  }

  // Exam Config Section Component
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
                onChange={(e) => setPassingThreshold(Number.parseInt(e.target.value, 10) || 0)}
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

  // New Exam Config Form Component
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
    <div className={`modal ${isOpen && "modal-open"}`}>
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Create New Lecture</h3>
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter lecture name"
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
              placeholder="Enter lecture description"
              className="textarea textarea-bordered w-full"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

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
              <option value="Paid">Normal</option>
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

          {/* Exam Config Section */}
          <ExamConfigSection />

          {/* Attachment section with type selection */}
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
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={creationLoading}>
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
  )
}

export default LectureCreationModal
