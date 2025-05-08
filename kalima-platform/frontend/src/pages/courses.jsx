"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"

import { getAllContainers } from "../routes/lectures"
import { getAllSubjects } from "../routes/courses"
import { getAllLevels } from "../routes/levels"
import { FilterDropdown } from "../../src/components/FilterDropdown"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import { CourseCard } from "../components/CourseCard"
import { getAllLecturers } from "../routes/fetch-users"

export default function CoursesPage() {
  const [containers, setContainers] = useState([])
  const [filteredContainers, setFilteredContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const ITEMS_PER_PAGE = 6

  // Data states
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])
  const [lecturers, setLecturers] = useState([])

  const { t, i18n } = useTranslation("courses")
  const isRTL = i18n.language === "ar"

  // Filter states
  const [selectedStage, setSelectedStage] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCourseType, setSelectedCourseType] = useState("")
  const [selectedCourseStatus, setSelectedCourseStatus] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")

  // Fetch initial data: subjects, levels, and lecturers
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch subjects
        const subjectsResult = await getAllSubjects()
        if (subjectsResult.success) {
          setSubjects(subjectsResult.data || [])
        } else {
          console.error("Failed to fetch subjects:", subjectsResult.error)
        }

        // Fetch levels
        const levelsResult = await getAllLevels()
        if (levelsResult.success) {
          setLevels(levelsResult.data?.levels || [])
        } else {
          console.error("Failed to fetch levels:", levelsResult.error)
        }

        // Fetch lecturers
        const lecturersResult = await getAllLecturers()
        if (lecturersResult.success) {
          setLecturers(lecturersResult.data || [])
        } else {
          console.error("Failed to fetch lecturers:", lecturersResult.error)
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch containers when page changes
  useEffect(() => {
    fetchContainers()
  }, [currentPage])

  const fetchContainers = async () => {
    setLoading(true)
    setError("")
    try {
      // Use the original getAllContainers function without modifications
      const result = await getAllContainers()
      console.log("API Response:", result)

      if (result.status === "success") {
        // Filter containers to only include those with type "course"
        const courseContainers = result.data.containers.filter((container) => container.type === "course")

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const paginatedContainers = courseContainers.slice(startIndex, endIndex)

        setContainers(courseContainers)
        setFilteredContainers(paginatedContainers)
        setTotalResults(courseContainers.length)
        setTotalPages(Math.ceil(courseContainers.length / ITEMS_PER_PAGE))
      } else {
        setError(result.error || "Failed to fetch containers")
      }
    } catch (err) {
      console.error("Error fetching containers:", err)
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = useCallback(() => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedTerm("")
    setSelectedSubject("")
    setSelectedCourseType("")
    setSelectedCourseStatus("")
    setSelectedPrice("")
    setCurrentPage(1)

    // Reset to show all course containers with pagination
    const courseContainers = containers.filter((container) => container.type === "course")
    const paginatedContainers = courseContainers.slice(0, ITEMS_PER_PAGE)
    setFilteredContainers(paginatedContainers)
    setTotalResults(courseContainers.length)
    setTotalPages(Math.ceil(courseContainers.length / ITEMS_PER_PAGE))
  }, [containers])

  const generateCourseData = (containersData) =>
    containersData.map((container, index) => {
      const levelName = container.level?.name || ""

      let stage = "المرحلة الثانوية"
      switch (levelName) {
        case "Primary":
          stage = "المرحلة الابتدائية"
          break
        case "Middle":
          stage = "المرحلة الإعدادية"
          break
        case "Upper Primary":
          stage = "المرحلة الابتدائية العليا"
          break
        case "Higher Secondary":
          stage = "المرحلة الثانوية"
          break
        case "Fourth Elementary":
          stage = "الصف الرابع الابتدائي"
          break
        case "First Primary":
          stage = "الصف الأول الابتدائي"
          break
        case "Second Primary":
          stage = "الصف الثاني الابتدائي"
          break
        case "Third Primary":
          stage = "الصف الثالث الابتدائي"
          break
        case "First Secondary":
          stage = "الصف الأول الثانوي"
          break
        case "Second Secondary":
          stage = "الصف الثاني الثانوي"
          break
        case "Third Secondary":
          stage = "الصف الثالث الثانوي"
          break
      }

      const isFree = container.price === 0
      const status = isFree ? "مجاني" : "مدفوع"

      let type = "شرح"
      switch (container.type) {
        case "course":
          type = "شرح"
          break
        case "year":
          type = "سنة كاملة"
          break
        case "term":
          type = "فصل دراسي"
          break
        case "month":
          type = "شهر"
          break
        default:
          type = container.type || "شرح"
      }

      const teacherId = container.createdBy?._id || container.createdBy
      const matchedLecturer = lecturers.find((lecturer) => lecturer._id === teacherId)

      return {
        id: container._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: container.name,
        subject: container.subject?.name || "",
        teacher: matchedLecturer?.name || "مدرس غير محدد",
        teacherRole: matchedLecturer?.role || "محاضر",
        grade: levelName,
        rating: 4 + (index % 2) * 0.5,
        stage,
        type,
        status,
        price: container.price || 0,
        childrenCount: container.children?.length || 0,
        containerType: container.type || "lecture",
      }
    })

  const applyFilters = useCallback(() => {
    // Filter the containers based on selected filters
    let filtered = [...containers].filter((container) => container.type === "course")

    // Apply stage filter
    if (selectedStage) {
      filtered = filtered.filter((container) => {
        const levelName = container.level?.name || ""
        let stage
        switch (levelName) {
          case "Primary":
          case "Fourth Elementary":
          case "First Primary":
          case "Second Primary":
          case "Third Primary":
            stage = "المرحلة الابتدائية"
            break
          case "Middle":
          case "Upper Primary":
            stage = "المرحلة الإعدادية"
            break
          case "Higher Secondary":
          case "First Secondary":
          case "Second Secondary":
          case "Third Secondary":
            stage = "المرحلة الثانوية"
            break
          default:
            stage = ""
        }
        return stage === selectedStage
      })
    }

    // Apply subject filter
    if (selectedSubject) {
      filtered = filtered.filter((c) => c.subject?.name === selectedSubject)
    }

    // Apply grade filter
    if (selectedGrade) {
      const levelId = levels.find((level) => {
        const displayName =
          {
            Primary: "المرحلة الابتدائية",
            Middle: "المرحلة الإعدادية",
            "Upper Primary": "المرحلة الابتدائية العليا",
            "Higher Secondary": "المرحلة الثانوية",
            "Fourth Elementary": "الصف الرابع الابتدائي",
            "First Primary": "الصف الأول الابتدائي",
            "Second Primary": "الصف الثاني الابتدائي",
            "Third Primary": "الصف الثالث الابتدائي",
            "First Secondary": "الصف الأول الثانوي",
            "Second Secondary": "الصف الثاني الثانوي",
            "Third Secondary": "الصف الثالث الثانوي",
          }[level.name] === selectedGrade
      })?._id

      if (levelId) {
        filtered = filtered.filter((c) => c.level?._id === levelId)
      }
    }

    // Apply course type filter
    if (selectedCourseType) {
      let apiType = "course"
      switch (selectedCourseType) {
        case "شرح":
          apiType = "course"
          break
        case "سنة كاملة":
          apiType = "year"
          break
        case "فصل دراسي":
          apiType = "term"
          break
        case "شهر":
          apiType = "month"
          break
        default:
          apiType = selectedCourseType
      }
      filtered = filtered.filter((c) => c.type === apiType)
    }

    // Apply course status filter
    if (selectedCourseStatus) {
      filtered = filtered.filter((c) => {
        const price = c.price || 0
        return selectedCourseStatus === "مجاني" ? price === 0 : price > 0
      })
    }

    // Apply price filter
    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number)
      filtered = filtered.filter((c) => {
        const price = c.price || 0
        return price >= min && (max === 0 || price <= max)
      })
    }

    // Reset to first page when applying new filters
    setCurrentPage(1)

    // Apply pagination to filtered results
    const startIndex = 0 // First page
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedContainers = filtered.slice(startIndex, endIndex)

    setFilteredContainers(paginatedContainers)
    setTotalResults(filtered.length)
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
  }, [
    containers,
    selectedStage,
    selectedGrade,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    selectedPrice,
    levels,
  ])

  // Apply filters when filter selections change
  useEffect(() => {
    if (containers.length > 0) {
      applyFilters()
    }
  }, [
    selectedStage,
    selectedGrade,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    selectedPrice,
    containers.length,
  ])

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)

      // Get all filtered containers (without pagination)
      const filtered = [...containers].filter((container) => container.type === "course")

      // Apply all active filters
      if (
        selectedStage ||
        selectedGrade ||
        selectedSubject ||
        selectedCourseType ||
        selectedCourseStatus ||
        selectedPrice
      ) {
        // The filters have already been applied, so we just need to paginate the current filtered set
        const startIndex = (newPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const paginatedContainers = filtered.slice(startIndex, endIndex)
        setFilteredContainers(paginatedContainers)
      } else {
        // No filters active, just paginate the course containers
        const courseContainers = containers.filter((container) => container.type === "course")
        const startIndex = (newPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const paginatedContainers = courseContainers.slice(startIndex, endIndex)
        setFilteredContainers(paginatedContainers)
      }
    }
  }

  const memoizedFilteredCourses = useMemo(() => generateCourseData(filteredContainers), [filteredContainers, lecturers])

  // Create subject options from fetched subjects
  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      label: subject.name,
      value: subject.name,
      id: subject._id,
    }))
  }, [subjects])

  // Create level options from fetched levels
  const levelOptions = useMemo(() => {
    return levels.map((level) => {
      // Map raw API values to display names
      const displayName =
        {
          Primary: "المرحلة الابتدائية",
          Middle: "المرحلة الإعدادية",
          "Upper Primary": "المرحلة الابتدائية العليا",
          "Higher Secondary": "المرحلة الثانوية",
          "Fourth Elementary": "الصف الرابع الابتدائي",
          "First Primary": "الصف الأول الابتدائي",
          "Second Primary": "الصف الثاني الابتدائي",
          "Third Primary": "الصف الثالث الابتدائي",
          "First Secondary": "الصف الأول الثانوي",
          "Second Secondary": "الصف الثاني الثانوي",
          "Third Secondary": "الصف الثالث الثانوي",
        }[level.name] || level.name

      return {
        label: displayName,
        value: displayName,
        id: level._id,
      }
    })
  }, [levels])

  const priceOptions = [
    { label: "مجاني", value: "0-0" },
    { label: "أقل من 500 جنيه", value: "1-500" },
    { label: "500-1000 جنيه", value: "500-1000" },
    { label: "أكثر من 1000 جنيه", value: "1000-10000" },
  ]

  const typeOptions = [
    { label: "شرح", value: "شرح" },
    { label: "سنة كاملة", value: "سنة كاملة" },
    { label: "فصل دراسي", value: "فصل دراسي" },
    { label: "شهر", value: "شهر" },
  ]

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: t("filters.all"), value: "" },
        { label: "المرحلة الابتدائية", value: "المرحلة الابتدائية" },
        { label: "المرحلة الإعدادية", value: "المرحلة الإعدادية" },
        { label: "المرحلة الثانوية", value: "المرحلة الثانوية" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: t("filters.grade"),
      value: selectedGrade,
      options: [{ label: t("filters.all"), value: "" }, ...levelOptions],
      onSelect: setSelectedGrade,
    },
    {
      label: t("filters.subject"),
      value: selectedSubject,
      options: [{ label: t("filters.all"), value: "" }, ...subjectOptions],
      onSelect: setSelectedSubject,
    },
    {
      label: t("filters.type"),
      value: selectedCourseType,
      options: [{ label: t("filters.all"), value: "" }, ...typeOptions],
      onSelect: setSelectedCourseType,
    },
    {
      label: t("filters.status"),
      value: selectedCourseStatus,
      options: [
        { label: t("filters.all"), value: "" },
        { label: "مجاني", value: "مجاني" },
        { label: "مدفوع", value: "مدفوع" },
      ],
      onSelect: setSelectedCourseStatus,
    },
    {
      label: t("filters.price") || "السعر",
      value: selectedPrice,
      options: [{ label: t("filters.all"), value: "" }, ...priceOptions],
      onSelect: setSelectedPrice,
    },
  ]

  return (
    <div className="relative min-h-screen w-full" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} w-2/3 h-screen pointer-events-none z-0`}>
        <div className="relative w-full h-full">
          <img
            src="/background-courses.png"
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-top opacity-50"
            style={{ maxWidth: "600px" }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <div className={`container mx-auto px-4 pt-8 pb-4 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">{t("title")}</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className={`flex justify-start`}>
            <button className="btn btn-outline btn-sm rounded-md mx-2" onClick={resetFilters}>
              {t("filters.reset")}
            </button>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button className="btn btn-primary btn-sm rounded-md">{t("search.options")}</button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl ${isRTL ? "ml-auto" : "mr-auto"} mt-4`}
          >
            {filterOptions.map((filter) => (
              <FilterDropdown
                key={filter.label}
                label={filter.label}
                options={filter.options}
                selectedValue={filter.value}
                placeholder={t("filters.select")}
                onSelect={filter.onSelect}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              className={`btn btn-accent btn-md rounded-full px-8 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={applyFilters}
            >
              <Search className="h-5 w-5 ml-2" />
              {t("showCourses")}
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold text-center mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            {t("discover")}
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} onRetry={fetchContainers} />
          ) : memoizedFilteredCourses.length === 0 ? (
            <div className={`text-center py-12 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-lg">{t("noCourses")}</p>
              {(selectedStage ||
                selectedGrade ||
                selectedTerm ||
                selectedSubject ||
                selectedCourseType ||
                selectedCourseStatus ||
                selectedPrice) && (
                <button className="btn btn-outline btn-sm mt-4" onClick={resetFilters}>
                  {t("filters.reset")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {memoizedFilteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link to={`/courses/${course.id}`}>
                        <CourseCard {...course} isRTL={isRTL} />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="join">
                    <button
                      className="join-item btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {isRTL ? "التالي" : "السابق"}
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        // If 5 or fewer pages, show all
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        // If near the start, show first 5 pages
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        // If near the end, show last 5 pages
                        pageNum = totalPages - 4 + i
                      } else {
                        // Otherwise show 2 before and 2 after current page
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`join-item btn ${currentPage === pageNum ? "btn-active" : ""}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      className="join-item btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {isRTL ? "السابق" : "التالي"}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mt-4 text-sm text-gray-600">
                {t("showing")} {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} {t("of")} {totalResults} {t("courses")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
