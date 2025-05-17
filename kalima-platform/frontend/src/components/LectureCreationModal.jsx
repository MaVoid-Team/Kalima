"use client"

import { useState, useEffect } from "react"
import { FiX, FiPaperclip } from "react-icons/fi"
import { getAllLevels } from "../routes/levels"
import { getAllSubjects } from "../routes/courses"
import ExamConfigSection from "./ExamConfigSection"

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

  // Exam related state
  const [requiresExam, setRequiresExam] = useState(false)
  const [passingThreshold, setPassingThreshold] = useState(50)
  const [selectedExamConfigId, setSelectedExamConfigId] = useState("")

  // Homework related state
  const [requiresHomework, setRequiresHomework] = useState(false)
  const [homeworkPassingThreshold, setHomeworkPassingThreshold] = useState(50)
  const [selectedHomeworkConfigId, setSelectedHomeworkConfigId] = useState("")

  // Levels and subjects state
  const [levels, setLevels] = useState([])
  const [subjects, setSubjects] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [attachmentType, setAttachmentType] = useState("homeworks")

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

  // Reset form function
  const resetForm = () => {
    setNewItemName("")
    setNewDescription("")
    setNewPrice(0)
    setNewVideoLink("")
    setNewLectureType("Revision")
    setAttachmentFile(null)
    setNumberOfViews(0)

    // Reset exam fields
    setRequiresExam(false)
    setPassingThreshold(50)
    setSelectedExamConfigId("")

    // Reset homework fields
    setRequiresHomework(false)
    setHomeworkPassingThreshold(50)
    setSelectedHomeworkConfigId("")

    setSelectedLevel(containerLevel || "")
    setSelectedSubject(containerSubject || "")
    setAttachmentType("homeworks")
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
        if (!selectedExamConfigId) {
          throw new Error("Please select an exam configuration")
        }

        // Set the exam config ID in the lecture data
        lectureData.examConfig = selectedExamConfigId
        // Passing threshold is now defined in the exam config
      }

      // Handle homework config if required
      if (requiresHomework) {
        if (!selectedHomeworkConfigId) {
          throw new Error("Please select a homework configuration")
        }

        // Set the homework config ID in the lecture data
        lectureData.requiresHomework = true
        lectureData.homeworkConfig = selectedHomeworkConfigId
        // Passing threshold is now defined in the homework config
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

          {/* Exam Section */}
          <div className="divider">Exam Settings</div>

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
          <ExamConfigSection
            requiresExam={requiresExam}
            selectedExamConfigId={selectedExamConfigId}
            setSelectedExamConfigId={setSelectedExamConfigId}
            passingThreshold={passingThreshold}
            setPassingThreshold={setPassingThreshold}
            onExamConfigCreated={(examConfigId) => {
              setSelectedExamConfigId(examConfigId)
            }}
          />

          {/* Homework Section */}
          <div className="divider">Homework Settings</div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Requires Homework</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={requiresHomework}
              onChange={(e) => setRequiresHomework(e.target.value === "true")}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>

          {/* Homework Config Section */}
          {requiresHomework && (
            <>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Homework Configuration</span>
                </label>
                <ExamConfigSection
                  requiresExam={requiresHomework}
                  selectedExamConfigId={selectedHomeworkConfigId}
                  setSelectedExamConfigId={setSelectedHomeworkConfigId}
                  passingThreshold={homeworkPassingThreshold}
                  setPassingThreshold={setHomeworkPassingThreshold}
                  onExamConfigCreated={(homeworkConfigId) => {
                    setSelectedHomeworkConfigId(homeworkConfigId)
                  }}
                  configType="homework"
                />
              </div>
            </>
          )}

          {/* Attachment section with type selection */}
          <div className="divider">Attachments</div>

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
