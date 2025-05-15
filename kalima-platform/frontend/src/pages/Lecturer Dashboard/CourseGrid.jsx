"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useTranslation } from "react-i18next"
import { User, BookOpen, Star, Edit, Eye, Clock, Users, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { getMyContainers, deleteContainerById } from "../../routes/lectures"
import Pagination from "../../components/Pagination"

// Memoized container type mapping
const containerTypeArabicMap = {
  course: "كورس",
  year: "سنة دراسية",
  term: "فصل دراسي",
  month: "شهر",
  lecture: "محاضرة"
}

// Memoized Course Card Component
const CourseCard = memo(function CourseCard({
  container,
  index,
  stats,
  getContainerTypeArabic,
  getContainerImage,
  onDelete,
  loading,
  t
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
          <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-sm font-medium">
            {container.price} جنيه
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 bg-success text-white px-2 py-1 rounded-md text-sm font-medium">
            مجاني
          </div>
        )}
      </figure>

      <div className="card-body p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-lg font-bold line-clamp-1">{container.name}</h3>
          <div className="badge badge-outline">{getContainerTypeArabic(container.type)}</div>
        </div>

        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <User className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.createdBy?.name || "غير معروف"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.subject?.name || "غير محدد"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Star className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{container.level?.name || "غير محدد"}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between text-xs text-base-content/60 mt-auto">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span>{stats.students} طالب</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span>{stats.lectures} محتوى</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{stats.duration}</span>
          </div>
        </div>

        <div className="card-actions justify-end mt-3">
          <Link to={`container-details/${container._id}`}>
            <button className="btn btn-sm btn-ghost">
              <Eye className="h-4 w-4 mr-1" />
              اظهار
            </button>
          </Link>
          <button
            className="btn btn-error btn-sm"
            onClick={() => onDelete(container._id)}
            disabled={loading}
          >
            مسح
          </button>
        </div>
      </div>
    </div>
  )
})

CourseCard.displayName = "CourseCard"

export default function CourseGrid() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  // Memoized filtered containers
  const filteredContainers = useMemo(() => {
    return containers.filter(
      (container) => container.parent === null || container.type === "lecture"
    )
  }, [containers])

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
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteContainer = useCallback(async (containerId) => {
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
  }, [t, fetchContainers])

  useEffect(() => {
    fetchContainers()
  }, [fetchContainers])

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return {
      currentItems: filteredContainers.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredContainers.length
    }
  }, [currentPage, filteredContainers, itemsPerPage])

  // Memoized container type getter
  const getContainerTypeArabic = useCallback((type) => {
    return containerTypeArabicMap[type] || type
  }, [])

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

  // Memoized container stats calculator
  const getContainerStats = useCallback((container) => ({
    students: container.numberOfViews || 0,
    lectures: container.children?.length || 0,
    duration: container.type === "lecture" 
      ? "45 دقيقة" 
      : `${container.children?.length || 0} محاضرة`
  }), [])

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
        <p className="text-lg text-gray-500 max-w-md mx-auto">{t("noCoursesDescription")}</p>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary mt-4">
            <Edit className="h-4 w-4 mr-2" />
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
        <p className="text-lg text-gray-500">{t("noCourses")}</p>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary mt-4">قم باضافه كورس</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     اداره الكورساتي
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary btn-base rounded-xl">
            <span>            قم باضافه كورس 
</span>
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
              getContainerTypeArabic={getContainerTypeArabic}
              getContainerImage={getContainerImage}
              onDelete={handleDeleteContainer}
              loading={loading}
              t={t}
            />
          )
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={paginationData.totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        labels={{
          previous: "السابق",
          next: "التالي",
          showing: "عرض",
          of: "من"
        }}
      />
    </div>
  )
}