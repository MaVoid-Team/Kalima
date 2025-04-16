"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getAllContainers } from "../routes/lectures"
import { FilterDropdown } from "../../src/components/FilterDropdown"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import { CourseCard } from "../components/CourseCard"
import { motion, AnimatePresence } from "framer-motion"

export default function CoursesPage() {
  const [containers, setContainers] = useState([])
  const [filteredContainers, setFilteredContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

  useEffect(() => {
    fetchContainers()
  }, [])

  const fetchContainers = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getAllContainers()
      console.log("API Response:", result)

      if (result.status === "success") {
        setContainers(result.data.containers)
        setFilteredContainers(result.data.containers)
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

  // Generate course data based on containers from API
  const generateCourseData = (containersData) => {
    return containersData.map((container, index) => {
      // Get the level name if available
      const levelName = container.level?.name || ""

      // Map level name to stage in Arabic
      let stage = "المرحلة الثانوية" // Default
      if (levelName) {
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
          default:
            stage = "المرحلة الثانوية"
        }
      }

      // Determine if course is free or paid
      const isFree = container.price === 0
      const status = isFree ? "مجاني" : "مدفوع"

      // Map container type to course type in Arabic
      let type = "شرح" // Default
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

      return {
        id: container._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: container.name,
        subject: container.subject?.name || "",
        teacher: container.createdBy?.name || "مدرس غير محدد",
        teacherRole: container.createdBy?.role || "محاضر",
        grade: levelName,
        rating: 4 + (index % 2) * 0.5, // Default rating
        stage: stage,
        type: type,
        status: status,
        price: container.price || 0,
        childrenCount: container.children?.length || 0,
        containerType: container.type || "lecture",
      }
    })
  }

  // Apply filters to containers
  const applyFilters = useCallback(() => {
    // First, filter the raw container data based on selected criteria
    let filtered = [...containers]

    if (selectedSubject) {
      filtered = filtered.filter((container) => container.subject?.name === selectedSubject)
    }

    if (selectedGrade) {
      filtered = filtered.filter((container) => container.level?.name === selectedGrade)
    }

    if (selectedCourseType) {
      // Map Arabic type back to API type
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
      filtered = filtered.filter((container) => container.type === apiType)
    }

    if (selectedCourseStatus) {
      if (selectedCourseStatus === "مجاني") {
        filtered = filtered.filter((container) => container.price === 0)
      } else if (selectedCourseStatus === "مدفوع") {
        filtered = filtered.filter((container) => container.price > 0)
      }
    }

    if (selectedPrice) {
      const priceRange = selectedPrice.split("-")
      if (priceRange.length === 2) {
        const minPrice = Number.parseInt(priceRange[0])
        const maxPrice = Number.parseInt(priceRange[1])
        filtered = filtered.filter((container) => container.price >= minPrice && container.price <= maxPrice)
      }
    }

    // Then convert the filtered containers to course data format
    setFilteredContainers(filtered)
  }, [
    selectedStage,
    selectedGrade,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    selectedPrice,
    containers,
  ])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedTerm("")
    setSelectedSubject("")
    setSelectedCourseType("")
    setSelectedCourseStatus("")
    setSelectedPrice("")
    setFilteredContainers(containers)
  }, [containers])

  // Memoize filtered courses
  const memoizedFilteredCourses = useMemo(() => generateCourseData(filteredContainers), [filteredContainers])

  // Get unique subjects for the subject filter
  const subjectOptions = useMemo(() => {
    const uniqueSubjects = new Set()
    containers.forEach((container) => {
      if (container.subject?.name) {
        uniqueSubjects.add(container.subject.name)
      }
    })
    return Array.from(uniqueSubjects).map((subject) => ({
      label: subject,
      value: subject,
    }))
  }, [containers])

  // Get unique levels for the grade filter
  const levelOptions = useMemo(() => {
    const uniqueLevels = new Set()
    containers.forEach((container) => {
      if (container.level?.name) {
        uniqueLevels.add(container.level.name)
      }
    })
    return Array.from(uniqueLevels).map((level) => ({
      label: level,
      value: level,
    }))
  }, [containers])

  // Course type options based on container types
  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set()
    containers.forEach((container) => {
      if (container.type) {
        uniqueTypes.add(container.type)
      }
    })

    return Array.from(uniqueTypes).map((type) => {
      let label = type
      switch (type) {
        case "course":
          label = "شرح"
          break
        case "year":
          label = "سنة كاملة"
          break
        case "term":
          label = "فصل دراسي"
          break
        case "month":
          label = "شهر"
          break
      }
      return { label, value: label }
    })
  }, [containers])

  // Price range options
  const priceOptions = [
    { label: "مجاني", value: "0-0" },
    { label: "أقل من 500 جنيه", value: "1-500" },
    { label: "500-1000 جنيه", value: "500-1000" },
    { label: "أكثر من 1000 جنيه", value: "1000-10000" },
  ]

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: "المرحلة الابتدائية", value: "المرحلة الابتدائية" },
        { label: "المرحلة الإعدادية", value: "المرحلة الإعدادية" },
        { label: "المرحلة الثانوية", value: "المرحلة الثانوية" },
        { label: "المرحلة الابتدائية العليا", value: "المرحلة الابتدائية العليا" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: t("filters.grade"),
      value: selectedGrade,
      options: levelOptions,
      onSelect: setSelectedGrade,
    },
    {
      label: t("filters.subject"),
      value: selectedSubject,
      options: subjectOptions,
      onSelect: setSelectedSubject,
    },
    {
      label: t("filters.type"),
      value: selectedCourseType,
      options: typeOptions,
      onSelect: setSelectedCourseType,
    },
    {
      label: t("filters.status"),
      value: selectedCourseStatus,
      options: [
        { label: "مجاني", value: "مجاني" },
        { label: "مدفوع", value: "مدفوع" },
      ],
      onSelect: setSelectedCourseStatus,
    },
    {
      label: t("filters.price") || "السعر",
      value: selectedPrice,
      options: priceOptions,
      onSelect: setSelectedPrice,
    },
  ]

  return (
    <div className="relative min-h-screen w-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background Pattern */}
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

      {/* Main Content */}
      <div className="relative z-10">
        {/* Title Section */}
        <div className={`container mx-auto px-4 pt-8 pb-4 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">{t("title")}</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        {/* Search and Filters Section */}
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

        {/* Courses Section */}
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
                      <CourseCard
                        {...course}
                        isRTL={isRTL}
                        childrenCount={course.childrenCount}
                        teacherRole={course.teacherRole}
                        status={course.status}
                      />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
