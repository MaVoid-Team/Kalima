"use client"

import { useState, useEffect } from "react"
import { FolderPlus, FileText, Paperclip } from "lucide-react"
import { createContainer, createLecture, createLectureAttachment } from "../../routes/lectures"
import { getAllSubjects } from "../../routes/courses"
import ContainerList from "./container-list"

// Container types
const CONTAINER_TYPES = {
  COURSE: "course",
  YEAR: "year",
  TERM: "term",
  MONTH: "month",
  LECTURE: "lecture",
}

function ContainerCreationPanel({ courseStructure, updateCourseStructure, formData, createdBy, isRTL }) {
  // Form state
  const [containerName, setContainerName] = useState("")
  const [containerType, setContainerType] = useState(CONTAINER_TYPES.YEAR)
  const [selectedParentId, setSelectedParentId] = useState(courseStructure.parent?.id || null)
  const [lectureLink, setLectureLink] = useState("")
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState([])

  // UI state
  const [expandedItems, setExpandedItems] = useState({})

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsResponse = await getAllSubjects()
        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data)
        } else {
          console.error(subjectsResponse.error)
        }
      } catch (error) {
        console.error("Error fetching subjects:", error)
      }
    }
    fetchSubjects()
  }, [])

  const toggleExpand = (type, id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}_${id}`]: !prev[`${type}_${id}`],
    }))
  }

  // Create container or lecture
  const handleCreateContainer = async (e) => {
    e.preventDefault()

    if (!selectedParentId) {
      alert(isRTL ? "يرجى تحديد الحاوية الأب" : "Please select a parent container")
      return
    }

    if (!containerName) {
      alert(isRTL ? "يرجى إدخال اسم الحاوية" : "Please enter a container name")
      return
    }

    setIsSubmitting(true)

    try {
      if (containerType === CONTAINER_TYPES.LECTURE) {
        if (!lectureLink) {
          alert(isRTL ? "يرجى إدخال رابط المحاضرة" : "Please enter a lecture link")
          setIsSubmitting(false)
          return
        }

        const lectureData = {
          name: containerName,
          type: "lecture",
          lecture_type: "Revision",
          createdBy: createdBy,
          level: formData.gradeLevel,
          teacherAllowed: formData.privacy === "teacher",
          subject: formData.subject,
          parent: selectedParentId,
          price: formData.courseType === "paid" ? Number(formData.priceSession) || 0 : 0,
          description: `Lecture for ${containerName}`,
          numberOfViews: 0,
          videoLink: lectureLink,
          examLink: "",
        }

        // Create the lecture
        const response = await createLecture(lectureData)
        const lecture = response.data.lecture

        // If there's an attachment, upload it
        if (attachmentFile) {
          const attachmentData = {
            type: "homework",
            attachment: attachmentFile,
          }
          await createLectureAttachment(lecture.id, attachmentData)
        }

        const newLecture = {
          id: lecture.id,
          name: lecture.name,
          parent: lecture.parent,
          type: lecture.type,
          videoLink: lecture.videoLink,
          attachment: attachmentFile ? { type: "homework", name: attachmentFile.name } : null,
        }

        updateCourseStructure({
          ...courseStructure,
          lectures: [...courseStructure.lectures, newLecture],
        })
      } else {
        // For regular containers
        const containerData = {
          name: containerName,
          type: containerType === CONTAINER_TYPES.LECTURE ? CONTAINER_TYPES.COURSE : containerType,
          createdBy: createdBy,
          parent: selectedParentId,
          level: formData.gradeLevel,
          subject: formData.subject,
          price: formData.courseType === "paid" ? Number(formData.priceFull) || 0 : 0,
          teacherAllowed: formData.privacy === "teacher",
        }

        const response = await createContainer(containerData)
        const container = response.data.container

        const newContainer = {
          id: container.id,
          name: container.name,
          parent: container.parent,
          type: containerType,
        }

        updateCourseStructure({
          ...courseStructure,
          containers: [...courseStructure.containers, newContainer],
        })
      }

      setContainerName("")
      setLectureLink("")
      setAttachmentFile(null)
      alert(
        isRTL
          ? `تم إنشاء ${containerType === CONTAINER_TYPES.LECTURE ? "المحاضرة" : "الحاوية"} بنجاح`
          : `${containerType === CONTAINER_TYPES.LECTURE ? "Lecture" : "Container"} created successfully`,
      )
    } catch (error) {
      console.error(`Error creating ${containerType}:`, error)
      alert(
        isRTL
          ? `حدث خطأ أثناء إنشاء ${containerType === CONTAINER_TYPES.LECTURE ? "المحاضرة" : "الحاوية"}`
          : `Error creating ${containerType === CONTAINER_TYPES.LECTURE ? "lecture" : "container"}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get all available parent containers based on the selected container type
  const getAvailableParents = () => {
    switch (containerType) {
      case CONTAINER_TYPES.YEAR:
        return [courseStructure.parent]
      case CONTAINER_TYPES.TERM:
        return courseStructure.containers.filter((c) => c.type === CONTAINER_TYPES.YEAR)
      case CONTAINER_TYPES.MONTH:
        return courseStructure.containers.filter((c) => c.type === CONTAINER_TYPES.TERM)
      case CONTAINER_TYPES.LECTURE:
        return courseStructure.containers.filter((c) => c.type === CONTAINER_TYPES.MONTH)
      default:
        return [courseStructure.parent]
    }
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold mb-6 text-primary text-center">
        {isRTL ? "إضافة محتوى تعليمي" : "Add Educational Content"}
      </h2>

      {/* Container Creation Form */}
      <form onSubmit={handleCreateContainer} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isRTL ? "نوع المحتوى" : "Content Type"}</label>
            <select
              value={containerType}
              onChange={(e) => {
                setContainerType(e.target.value)
                setSelectedParentId(null) // Reset parent selection when type changes
              }}
              className="w-full select select-bordered bg-base-200"
              required
            >
              <option value={CONTAINER_TYPES.YEAR}>{isRTL ? "سنة دراسية" : "Academic Year"}</option>
              <option value={CONTAINER_TYPES.TERM}>{isRTL ? "فصل دراسي" : "Term"}</option>
              <option value={CONTAINER_TYPES.MONTH}>{isRTL ? "شهر" : "Month"}</option>
              <option value={CONTAINER_TYPES.LECTURE}>{isRTL ? "محاضرة" : "Lecture"}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isRTL ? "الحاوية الأب" : "Parent Container"}</label>
            <select
              value={selectedParentId || ""}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full select select-bordered bg-base-200"
              required
            >
              <option value="" disabled>
                {isRTL ? "اختر الحاوية الأب" : "Select parent container"}
              </option>
              {getAvailableParents().map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{isRTL ? "اسم المحتوى" : "Content Name"}</label>
          <input
            type="text"
            value={containerName}
            onChange={(e) => setContainerName(e.target.value)}
            placeholder={isRTL ? "اسم المحتوى" : "Content name"}
            className="w-full input input-bordered bg-base-200"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{isRTL ? "الموضوع" : "Subject"}</label>
          <select
            value={formData.subject || ""}
            onChange={(e) => {
              updateCourseStructure({ ...courseStructure, formData: { ...formData, subject: e.target.value } })
            }}
            className="w-full select select-bordered bg-base-200"
            required
          >
            <option value="" disabled>
              {isRTL ? "اختر الموضوع" : "Select subject"}
            </option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {containerType === CONTAINER_TYPES.LECTURE && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{isRTL ? "رابط المحاضرة" : "Lecture Link"}</label>
              <input
                type="text"
                value={lectureLink}
                onChange={(e) => setLectureLink(e.target.value)}
                placeholder={isRTL ? "رابط الفيديو" : "Video link"}
                className="w-full input input-bordered bg-base-200"
                required={containerType === CONTAINER_TYPES.LECTURE}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {isRTL ? "إرفاق واجب (اختياري، .pdf فقط)" : "Attach Homework (Optional, .pdf only)"}
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files[0])}
                  className="file-input file-input-bordered w-full bg-base-200"
                  accept=".pdf"
                />
                <Paperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              </div>
              {attachmentFile && (
                <p className="mt-2 text-sm text-base-content/70">
                  {isRTL ? "الملف المختار:" : "Selected file:"} {attachmentFile.name}
                </p>
              )}
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              {containerType === CONTAINER_TYPES.LECTURE ? (
                <FileText className="w-4 h-4 mr-1" />
              ) : (
                <FolderPlus className="w-4 h-4 mr-1" />
              )}
              {isRTL
                ? `إضافة ${containerType === CONTAINER_TYPES.LECTURE ? "محاضرة" : "حاوية"}`
                : `Add ${containerType === CONTAINER_TYPES.LECTURE ? "Lecture" : "Container"}`}
            </>
          )}
        </button>
      </form>

      {/* Container Lists */}
      <ContainerList
        courseStructure={courseStructure}
        isRTL={isRTL}
        selectedParentId={selectedParentId}
        setSelectedParentId={setSelectedParentId}
        expandedItems={expandedItems}
        toggleExpand={toggleExpand}
      />
    </div>
  )
}

export default ContainerCreationPanel