"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { User, BookOpen, Star, Heart, Edit, Eye, Clock, Users, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { getMyContainers } from "../../routes/lectures"
import Pagination from "../../components/Pagination" // Make sure to adjust the import path

export default function CourseGrid() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Set to 3 courses per page as requested

  // Fetch lecturer's containers
  const fetchContainers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMyContainers()

      if (result.status === "success") {
        // Filter to show only top-level courses and lectures
        const topLevelContainers = result.data.containers.filter(
          (container) => container.parent === null || container.type === "lecture",
        )
        setContainers(topLevelContainers)
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

  useEffect(() => {
    fetchContainers()
  }, [fetchContainers])

  // Get current containers for the current page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentContainers = containers.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
    // Here you would typically make an API call to update the favorite status
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

  // Get appropriate image based on container type
  const getContainerImage = (container, index) => {
    if (container.type === "lecture") {
      return `/course-${(index % 3) + 1}.png`
    } else if (container.subject?.name === "Mathematics") {
      return `/course-${(index % 3) + 1}.png`
    } else {
      return `/course-${(index % 6) + 1}.png`
    }
  }

  // Get container stats
  const getContainerStats = (container) => {
    return {
      students: container.numberOfViews || 0,
      lectures: container.children?.length || 0,
      duration: container.type === "lecture" ? "45 دقيقة" : `${container.children?.length || 0} محاضرة`,
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">خطأ!</strong>
        <span className="block sm:inline"> {error}</span>
        <button className="btn btn-sm btn-outline mt-2" onClick={fetchContainers}>
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("courseManagement")}</h2>
        <Link to="/dashboard/lecturer-dashboard/CoursesForm">
          <button className="btn btn-primary btn-sm rounded-full">
            <span>{t("addNewCourse")}</span>
          </button>
        </Link>
      </div>

      {containers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">{t("noCourses")}</p>
          <Link to="/dashboard/lecturer-dashboard/CoursesForm">
            <button className="btn btn-primary mt-4">{t("addNewCourse")}</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {currentContainers.map((container, index) => {
              const stats = getContainerStats(container)
              return (
                <div
                  key={container._id}
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <figure className="relative h-48">
                    <img
                      src={getContainerImage(container, index) || "/placeholder.svg"}
                      alt={container.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
                      onClick={() => toggleFavorite(container._id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites[container._id] ? "fill-primary text-primary" : "text-base-content/70"
                        }`}
                      />
                    </button>
                    {container.price > 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-sm font-medium">
                        {container.price} جنيه
                      </div>
                    )}
                    {container.price === 0 && (
                      <div className="absolute bottom-2 left-2 bg-success text-white px-2 py-1 rounded-md text-sm font-medium">
                        مجاني
                      </div>
                    )}
                  </figure>

                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="card-title text-lg font-bold line-clamp-1">{container.name}</h3>
                      <div className="badge badge-outline">{getContainerTypeArabic(container.type)}</div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-base-content/70 mt-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{container.createdBy?.name || "غير معروف"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{container.subject?.name || "غير محدد"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{container.level?.name || "غير محدد"}</span>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="flex justify-between text-xs text-base-content/60">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{stats.students} طالب</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{stats.lectures} محتوى</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{stats.duration}</span>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-3">
                      <Link to={`container-details/${container._id}`}>
                        <button className="btn btn-sm btn-ghost">
                          <Eye className="h-4 w-4 mr-1" />
                          {t("view")}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={containers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={paginate}
            labels={{
              previous: "السابق",
              next: "التالي",
              showing: "عرض",
              of: "من"
            }}
          />
        </>
      )}
    </div>
  )
}