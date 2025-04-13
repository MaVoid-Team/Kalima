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

// Fake data for courses (fallback)
const fakeCourses = [
  {
    id: 3,
    image: "/course-3.png",
    title: "أساسيات الفيزياء",
    subject: "فيزياء",
    teacher: "أستاذة سارة",
    grade: "الصف الأول الثانوي",
    rating: 5,
    stage: "المرحلة الثانوية",
    type: "تدريبات",
    status: "مجاني",
  },
]

export default function CoursesPage() {
  const [containers, setContainers] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
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

  useEffect(() => {
    fetchContainers()
  }, [])

  // Fetch containers from the API
  const fetchContainers = async () => {
    setLoading(true)
    try {
      const result = await getAllContainers()
      console.log("API Response:", result)

      if (result && result.data?.containers?.length > 0) {
        const containersData = result.data.containers
        setContainers(containersData)
        setFilteredCourses(generateCourseData(containersData))
      } else {
        // If no data is fetched, use fake data
        setFilteredCourses(fakeCourses)
      }
    } catch (err) {
      console.error("Error fetching containers:", err)
      setError("حدث خطأ أثناء تحميل البيانات")
      // If there's an error, use fake data
      setFilteredCourses(fakeCourses)
    } finally {
      setLoading(false)
    }
  }

  // Generate course data based on containers from API
  const generateCourseData = (containersData) => {
    if (!containersData || containersData.length === 0) return fakeCourses

    return containersData.map((container, index) => {
      // Map container type to course type in Arabic
      let courseType
      switch (container.type) {
        case "lecture":
          courseType = "شرح"
          break
        case "month":
          courseType = "مراجعة"
          break
        case "term":
        case "year":
          courseType = "تدريبات"
          break
        case "course":
          courseType = "كورس كامل"
          break
        default:
          courseType = "شرح"
      }

      // Map level name to stage in Arabic
      let stage
      if (container.level && container.level.name) {
        switch (container.level.name) {
          case "Primary":
            stage = "المرحلة الابتدائية"
            break
          case "Middle":
            stage = "المرحلة الإعدادية"
            break
          default:
            stage = "المرحلة الثانوية"
        }
      } else {
        stage = "المرحلة الثانوية" // Default
      }

      // Determine if course is free or paid
      const status = container.price && container.price > 0 ? "مدفوع" : "مجاني"

      // Get number of children (lectures/subcourses)
      const childrenCount = container.children ? container.children.length : 0

      return {
        id: container._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: container.name,
        subject: container.subject?.name || "موضوع غير محدد",
        teacher: container.createdBy?.name || "مدرس غير محدد",
        teacherRole: container.createdBy?.role || "مدرس",
        grade: container.level?.name || "الصف الأول",
        rating: 4 + (index % 2) * 0.5,
        stage: stage,
        type: courseType,
        status: status,
        price: container.price || 0,
        childrenCount: childrenCount,
        containerType: container.type,
      }
    })
  }

  // Apply filters to courses
  const applyFilters = useCallback(() => {
    let filtered = containers.length > 0 ? generateCourseData(containers) : fakeCourses

    if (selectedStage) {
      filtered = filtered.filter((course) => course.stage === selectedStage)
    }

    if (selectedGrade) {
      filtered = filtered.filter((course) => course.grade === selectedGrade)
    }

    if (selectedTerm) {
      // Filter for term (based on container type)
      filtered = filtered.filter((course) => course.containerType === "term" || !selectedTerm)
    }

    if (selectedSubject) {
      filtered = filtered.filter((course) => course.subject === selectedSubject)
    }

    if (selectedCourseType) {
      filtered = filtered.filter((course) => course.type === selectedCourseType)
    }

    if (selectedCourseStatus) {
      filtered = filtered.filter((course) => course.status === selectedCourseStatus)
    }

    setFilteredCourses(filtered)
  }, [
    selectedStage,
    selectedGrade,
    selectedTerm,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
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
    setFilteredCourses(containers.length > 0 ? generateCourseData(containers) : fakeCourses)
  }, [containers])

  // Memoize filtered courses to avoid recalculating on every render
  const memoizedFilteredCourses = useMemo(() => filteredCourses, [filteredCourses])

  // Get unique subjects from containers for the subject filter
  const subjectOptions = useMemo(() => {
    if (!containers || containers.length === 0) return []

    const uniqueSubjects = new Set()
    containers.forEach((container) => {
      if (container.subject && container.subject.name) {
        uniqueSubjects.add(container.subject.name)
      }
    })

    return Array.from(uniqueSubjects).map((subject) => ({
      label: subject,
      value: subject,
    }))
  }, [containers])

  // Get unique levels from containers for the grade filter
  const levelOptions = useMemo(() => {
    if (!containers || containers.length === 0) return []

    const uniqueLevels = new Set()
    containers.forEach((container) => {
      if (container.level && container.level.name) {
        uniqueLevels.add(container.level.name)
      }
    })

    return Array.from(uniqueLevels).map((level) => ({
      label: level,
      value: level,
    }))
  }, [containers])

  // Get unique container types for the course type filter
  const typeOptions = useMemo(() => {
    if (!containers || containers.length === 0) return []

    const uniqueTypes = new Set()
    containers.forEach((container) => {
      if (container.type) {
        let arabicType
        switch (container.type) {
          case "lecture":
            arabicType = "شرح"
            break
          case "month":
            arabicType = "مراجعة"
            break
          case "term":
          case "year":
            arabicType = "تدريبات"
            break
          case "course":
            arabicType = "كورس كامل"
            break
          default:
            arabicType = container.type
        }
        uniqueTypes.add(arabicType)
      }
    })

    return Array.from(uniqueTypes).map((type) => ({
      label: type,
      value: type,
    }))
  }, [containers])

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: "المرحلة الابتدائية", value: "المرحلة الابتدائية" },
        { label: "المرحلة الإعدادية", value: "المرحلة الإعدادية" },
        { label: "المرحلة الثانوية", value: "المرحلة الثانوية" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: t("filters.grade"),
      value: selectedGrade,
      options:
        levelOptions.length > 0
          ? levelOptions
          : [
              { label: "Primary", value: "Primary" },
              { label: "Middle", value: "Middle" },
              { label: "Secondary", value: "Secondary" },
            ],
      onSelect: setSelectedGrade,
    },
    {
      label: t("filters.term"),
      value: selectedTerm,
      options: [
        { label: "الفصل الأول", value: "term" },
        { label: "الفصل الثاني", value: "term" },
      ],
      onSelect: setSelectedTerm,
    },
    {
      label: t("filters.subject"),
      value: selectedSubject,
      options:
        subjectOptions.length > 0
          ? subjectOptions
          : [
              { label: "Mathematics", value: "Mathematics" },
              { label: "Science", value: "Science" },
              { label: "English", value: "English" },
            ],
      onSelect: setSelectedSubject,
    },
    {
      label: t("filters.type"),
      value: selectedCourseType,
      options:
        typeOptions.length > 0
          ? typeOptions
          : [
              { label: "شرح", value: "شرح" },
              { label: "مراجعة", value: "مراجعة" },
              { label: "تدريبات", value: "تدريبات" },
            ],
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

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl ${isRTL ? "ml-auto" : "mr-auto"}`}>
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
                selectedCourseStatus) && (
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
                    <Link to={`/course-details/${course.id}`}>
                      <CourseCard
                        {...course}
                        isRTL={isRTL}
                        childrenCount={course.childrenCount}
                        teacherRole={course.teacherRole}
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
