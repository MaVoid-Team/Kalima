"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getAllSubjects } from "../routes/courses"
import { FilterDropdown } from "../../src/components/FilterDropdown"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import { CourseCard } from "../components/CourseCard"
import { motion, AnimatePresence } from "framer-motion"

export default function CoursesPage() {
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
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
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getAllSubjects()
      console.log("API Response:", result)

      if (result.success) {
        setSubjects(result.data)
        setFilteredSubjects(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  // Generate course data based on subjects from API
  const generateCourseData = (subjectsData) => {
    return subjectsData.map((subject, index) => {
      // Get the first level name if available
      const levelName = subject.level?.[0]?.name || ""

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
          default:
            stage = "المرحلة الثانوية"
        }
      }

      return {
        id: subject._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: subject.name,
        subject: subject.name,
        teacher: "مدرس غير محدد", // You might want to get this from the API
        teacherRole: "مدرس",
        grade: levelName,
        rating: 4 + (index % 2) * 0.5, // Default rating
        stage: stage,
        type: "شرح", // Default type
        status: "مجاني", // Default status
        price: 0, // Default price
        childrenCount: 0, // Default children count
        containerType: "lecture", // Default container type
      }
    })
  }

  // Apply filters to subjects
  const applyFilters = useCallback(() => {
    let filtered = generateCourseData(subjects)

    if (selectedStage) {
      filtered = filtered.filter((course) => course.stage === selectedStage)
    }

    if (selectedGrade) {
      filtered = filtered.filter((course) => course.grade === selectedGrade)
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

    setFilteredSubjects(filtered)
  }, [
    selectedStage,
    selectedGrade,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    subjects,
  ])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedTerm("")
    setSelectedSubject("")
    setSelectedCourseType("")
    setSelectedCourseStatus("")
    setFilteredSubjects(subjects)
  }, [subjects])

  // Memoize filtered courses
  const memoizedFilteredCourses = useMemo(() => generateCourseData(filteredSubjects), [filteredSubjects])

  // Get unique subjects for the subject filter
  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      label: subject.name,
      value: subject.name,
    }))
  }, [subjects])

  // Get unique levels for the grade filter
  const levelOptions = useMemo(() => {
    const uniqueLevels = new Set()
    subjects.forEach((subject) => {
      subject.level?.forEach((level) => {
        uniqueLevels.add(level.name)
      })
    })
    return Array.from(uniqueLevels).map((level) => ({
      label: level,
      value: level,
    }))
  }, [subjects])

  // Course type options
  const typeOptions = [
    { label: "شرح", value: "شرح" },
    { label: "مراجعة", value: "مراجعة" },
    { label: "تدريبات", value: "تدريبات" },
    { label: "كورس كامل", value: "كورس كامل" },
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
  ]

  // Rest of your component remains the same...
  // Just make sure to use memoizedFilteredCourses for rendering the courses

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
            <ErrorAlert error={error} onRetry={fetchSubjects} />
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