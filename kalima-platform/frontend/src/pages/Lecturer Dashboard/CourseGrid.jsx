"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { User, BookOpen, Star, Edit, Eye, Clock, Users, FileText, X } from "lucide-react"
import { Link } from "react-router-dom"
import { getMyContainers, deleteContainerById, updateContainerById } from "../../routes/lectures"
import { getAllSubjects } from "../../routes/courses"
import { getAllLevels } from "../../routes/levels"
import Pagination from "../../components/Pagination"

// Memoized Course Card Component
const CourseCard = memo(function CourseCard({
  container,
  index,
  stats,
  getContainerTypeTranslation,
  getContainerImage,
  onDelete,
  onEdit,
  loading,
  t,
  isRTL,
}) {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      <figure className="relative h-48 flex-shrink-0">
        <img
          src={getContainerImage(container, index) || "/placeholder.svg"}
          alt={container.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {container.price > 0 ? (
          <div className="absolute bottom-2 left-2 bg-primary text-primary-content px-2 py-1 rounded-md text-sm font-medium">
            {container.price} {t("currency")}
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 bg-success text-success-content px-2 py-1 rounded-md text-sm font-medium">
            {t("free")}
          </div>
        )}
      </figure>

      <div className="card-body p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-lg font-bold line-clamp-1">{container.name}</h3>
          <div className="badge badge-outline">{getContainerTypeTranslation(container.type)}</div>
        </div>

        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <User className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.createdBy?.name || t("unknown")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.subject?.name || t("unspecified")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Star className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.level?.name || t("unspecified")}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between text-xs text-base-content/60 mt-auto">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span>
              {stats.students} {t("student")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span>
              {stats.lectures} {t("content")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{stats.duration}</span>
          </div>
        </div>

        <div className="card-actions justify-end mt-3 gap-2">
          <Link to={`container-details/${container._id}`}>
            <button className="btn btn-sm btn-ghost">
              <Eye
                className="h-4 w-4"
                style={{ marginRight: isRTL ? 0 : "0.25rem", marginLeft: isRTL ? "0.25rem" : 0 }}
              />
              {t("view")}
            </button>
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(container)} disabled={loading}>
            <Edit className="h-4 w-4" />
            {t("edit")}
          </button>
          <button className="btn btn-error btn-sm" onClick={() => onDelete(container._id)} disabled={loading}>
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  )
})

CourseCard.displayName = "CourseCard"

export default function CourseGrid() {
  const { t, i18n } = useTranslation("lecturerDashboard")
  const isRTL = i18n.language === "ar"
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  const [editingContainer, setEditingContainer] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    price: "",
    description: "",
    goal: "",
    subject: "",
    level: "",
    imageFile: null,
    removeImage: false,
  })

  // Memoized filtered containers
  const filteredContainers = useMemo(() => {
    return containers.filter((container) => container.parent === null || container.type === "lecture")
  }, [containers])

  // Fetch subjects and levels
  useEffect(() => {
    const fetchSubjectsAndLevels = async () => {
      try {
        const [subjectsResult, levelsResult] = await Promise.all([getAllSubjects(), getAllLevels()])

        if (subjectsResult.success) {
          setSubjects(subjectsResult.data)
        }
        if (levelsResult.success) {
          setLevels(levelsResult.data)
        }
      } catch (err) {
        console.error("Error fetching subjects/levels:", err)
      }
    }
    fetchSubjectsAndLevels()
  }, [])

  // Fetch lecturer's containers
  const fetchContainers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMyContainers()

      if (result.status === "success") {
        setContainers(result.data.containers)
      } else {
        setError(result.message || "Failed to fetch containers")
      }
    } catch (err) {
      console.error("Error fetching containers:", err)
      setError(t("errorDeletingContainer"))
    } finally {
      setLoading(false)
    }
  }, [t])

  const handleEditContainer = useCallback((container) => {
    setEditingContainer(container)
    setEditForm({
      name: container.name || "",
      type: container.type || "",
      price: container.price || "",
      description: container.description || "",
      goal: container.goal || "",
      subject: container.subject?._id || "",
      level: container.level?._id || "",
      imageFile: null,
      removeImage: false,
    })
    setShowEditModal(true)
  }, [])

  const handleUpdateContainer = useCallback(
    async (e) => {
      e.preventDefault()
      if (!editingContainer) return

      try {
        setLoading(true)
        const formData = new FormData()
        formData.append("name", editForm.name)
        formData.append("type", editForm.type)
        formData.append("price", editForm.price)
        if (editForm.description) formData.append("description", editForm.description)
        if (editForm.goal) formData.append("goal", editForm.goal)
        if (editForm.subject) formData.append("subject", editForm.subject)
        if (editForm.level) formData.append("level", editForm.level)
        if (editForm.imageFile) formData.append("image", editForm.imageFile)
        if (editForm.removeImage) formData.append("removeImage", "true")

        const result = await updateContainerById(editingContainer._id, formData)
        if (result.status === "success") {
          setShowEditModal(false)
          setEditingContainer(null)
          fetchContainers()
        } else {
          toast.error(result.message || t("failedToUpdateContainer"))
        }
      } catch (err) {
        console.error("Error updating container:", err)
        toast.error(err.message || t("errorUpdatingContainer"))
      } finally {
        setLoading(false)
      }
    },
    [editForm, editingContainer, fetchContainers, t]
  )

  const handleDeleteContainer = useCallback(
    async (containerId) => {
      if (!window.confirm(t("confirmDeleteContainer"))) return

      try {
        setLoading(true)
        const result = await deleteContainerById(containerId)
        if (result.status === "success") {
          fetchContainers()
        } else {
          setError(result.message || t("failedToDeleteContainer"))
        }
      } catch (err) {
        console.error("Error deleting container:", err)
        setError(t("errorDeletingContainer"))
      } finally {
        setLoading(false)
      }
    },
    [t, fetchContainers],
  )

  useEffect(() => {
    fetchContainers()
  }, [fetchContainers])

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return {
      currentItems: filteredContainers.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredContainers.length,
    }
  }, [currentPage, filteredContainers, itemsPerPage])

  // Memoized container type getter using translations
  const getContainerTypeTranslation = useCallback(
    (type) => {
      return t(`containerTypes.${type}`, { defaultValue: type })
    },
    [t],
  )

  // Memoized container image getter
  const getContainerImage = useCallback((container, index) => {
    if (container.type === "lecture") {
      return `/course-${(index % 3) + 1}.png`
    }
    if (container.subject?.name === "Mathematics") {
      return `/course-${(index % 3) + 1}.png`
    }
    return `/course-${(index % 6) + 1}.png`
  }, [])

  // Memoized container stats calculator with translations
  const getContainerStats = useCallback(
    (container) => ({
      students: container.numberOfViews || 0,
      lectures: container.children?.length || 0,
      duration:
        container.type === "lecture" ? `45 ${t("minutes")}` : `${container.children?.length || 0} ${t("lectures")}`,
    }),
    [t],
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-24 h-24 bg-base-200 rounded-full flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold">{t("noCoursesTitle")}</h3>
        <p className="text-lg text-base-content/50 max-w-md mx-auto">{t("noCoursesDescription")}</p>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary mt-4">
            <Edit className="h-4 w-4" style={{ marginRight: isRTL ? 0 : "0.5rem", marginLeft: isRTL ? "0.5rem" : 0 }} />
            {t("addNewCourse")}
          </button>
        </Link>
      </div>
    )
  }

  // Empty state
  if (filteredContainers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-base-content/50">{t("noCourses")}</p>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary mt-4">{t("addNewCourse")}</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{t("courseManagement")}</h2>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary btn-base rounded-xl">
            <span>{t("addNewCourse")}</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
        {paginationData.currentItems.map((container, index) => {
          const stats = getContainerStats(container)
          return (
            <CourseCard
              key={container._id}
              container={container}
              index={index}
              stats={stats}
              getContainerTypeTranslation={getContainerTypeTranslation}
              getContainerImage={getContainerImage}
              onDelete={handleDeleteContainer}
              onEdit={handleEditContainer}
              loading={loading}
              t={t}
              isRTL={isRTL}
            />
          )
        })}
      </div>

      {/* Edit Container Modal */}
      {showEditModal && editingContainer && (
        <div className="fixed inset-0 bg-neutral/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-base-100 border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{t("editCourse")}</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateContainer} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("courseName")}</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("courseType")}</span>
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="select select-bordered"
                  required
                >
                  <option value="course">{t("course")}</option>
                  <option value="lecture">{t("lecture")}</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("price")}</span>
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>

              {editForm.type === "course" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("description")}</span>
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="textarea textarea-bordered h-24"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("goal")}</span>
                    </label>
                    <textarea
                      value={editForm.goal}
                      onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                      className="textarea textarea-bordered h-24"
                      required
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("subject")}</span>
                  </label>
                  <select
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">{t("selectSubject")}</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("level")}</span>
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">{t("selectLevel")}</option>
                    {levels.map((level) => (
                      <option key={level._id} value={level._id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("courseImage")}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, imageFile: e.target.files[0], removeImage: false })}
                  className="file-input file-input-bordered"
                />
                {editingContainer.image && (
                  <label className="label cursor-pointer">
                    <span className="label-text">{t("removeCurrentImage")}</span>
                    <input
                      type="checkbox"
                      checked={editForm.removeImage}
                      onChange={(e) => setEditForm({ ...editForm, removeImage: e.target.checked, imageFile: null })}
                      className="checkbox"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-ghost">
                  {t("cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : t("saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={paginationData.totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        labels={{
          previous: isRTL ? "السابق" : "Previous",
          next: isRTL ? "التالي" : "Next",
          showing: isRTL ? "عرض" : "Showing",
          of: isRTL ? "من" : "of",
        }}
      />
    </div>
  )
}
