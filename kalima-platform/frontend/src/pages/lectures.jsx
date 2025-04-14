"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getAllLectures } from "../routes/lectures"
import { FilterDropdown } from "../components/FilterDropdown"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import { CourseCard } from "../components/CourseCard"
import { motion, AnimatePresence } from "framer-motion"

export default function LecturesPage() {
  const [lectures, setLectures] = useState([])
  const [filteredLectures, setFilteredLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { t, i18n } = useTranslation("lectures")
  const isRTL = i18n.language === "ar"

  // Filter states
  const [selectedStage, setSelectedStage] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getAllLectures()
      console.log("API Response:", result)

      if (result.success) {
        setLectures(result.data)
        setFilteredLectures(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error("Error fetching lectures:", err)
      setError("حدث خطأ أثناء تحميل المحاضرات")
    } finally {
      setLoading(false)
    }
  }

  // Generate lecture data for display
  const generateLectureData = (lecturesData) => {
    return lecturesData.map((lecture, index) => {
      // Count attachments
      const attachmentsCount = lecture.attachments
        ? (lecture.attachments.booklets?.length || 0) +
          (lecture.attachments.homeworks?.length || 0) +
          (lecture.attachments.exams?.length || 0) +
          (lecture.attachments.pdfsandimages?.length || 0)
        : 0

      return {
        id: lecture._id,
        image: `/course-${(index % 6) + 1}.png`, // Default lecture image
        title: lecture.name,
        subject: lecture.subject?.name || "غير محدد",
        teacher: lecture.createdBy?.name || "مدرس غير محدد",
        teacherRole: lecture.createdBy?.role || "محاضر",
        grade: lecture.level?.name || "غير محدد",
        rating: 4, // Default rating
        stage: mapLevelToStage(lecture.level?.name),
        type: "محاضرة",
        status: lecture.price > 0 ? "مدفوع" : "مجاني",
        price: lecture.price || 0,
        childrenCount: attachmentsCount,
        views: lecture.numberOfViews || 0,
        description: lecture.description || "لا يوجد وصف",
      }
    })
  }

  // Map level name to stage in Arabic
  const mapLevelToStage = (levelName) => {
    if (!levelName) return "غير محدد"
    switch (levelName) {
      case "Primary":
        return "المرحلة الابتدائية"
      case "Middle":
        return "المرحلة الإعدادية"
      case "Upper Primary":
        return "المرحلة الابتدائية العليا"
      default:
        return "المرحلة الثانوية"
    }
  }

  // Apply filters to lectures
  const applyFilters = useCallback(() => {
    let filtered = lectures

    if (selectedStage) {
      filtered = filtered.filter(
        (lecture) => mapLevelToStage(lecture.level?.name) === selectedStage
      )
    }

    if (selectedGrade) {
      filtered = filtered.filter(
        (lecture) => lecture.level?.name === selectedGrade
      )
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (lecture) => lecture.subject?.name === selectedSubject
      )
    }

    if (selectedStatus) {
      const statusFilter = selectedStatus === "مجاني" ? 0 : 1
      filtered = filtered.filter(
        (lecture) => (lecture.price > 0) === statusFilter
      )
    }

    setFilteredLectures(filtered)
  }, [selectedStage, selectedGrade, selectedSubject, selectedStatus, lectures])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedSubject("")
    setSelectedStatus("")
    setFilteredLectures(lectures)
  }, [lectures])

  // Memoize filtered lectures
  const memoizedFilteredLectures = useMemo(
    () => generateLectureData(filteredLectures),
    [filteredLectures]
  )

  // Get unique subjects for the subject filter
  const subjectOptions = useMemo(() => {
    const uniqueSubjects = new Set()
    lectures.forEach((lecture) => {
      if (lecture.subject?.name) {
        uniqueSubjects.add(lecture.subject.name)
      }
    })
    return Array.from(uniqueSubjects).map((subject) => ({
      label: subject,
      value: subject,
    }))
  }, [lectures])

  // Get unique levels for the grade filter
  const levelOptions = useMemo(() => {
    const uniqueLevels = new Set()
    lectures.forEach((lecture) => {
      if (lecture.level?.name) {
        uniqueLevels.add(lecture.level.name)
      }
    })
    return Array.from(uniqueLevels).map((level) => ({
      label: level,
      value: level,
    }))
  }, [lectures])

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
      label: t("filters.status"),
      value: selectedStatus,
      options: [
        { label: "مجاني", value: "مجاني" },
        { label: "مدفوع", value: "مدفوع" },
      ],
      onSelect: setSelectedStatus,
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
              {t("showLectures")}
            </button>
          </div>
        </div>

        {/* Lectures Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold text-center mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            {t("discover")}
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} onRetry={fetchLectures} />
          ) : memoizedFilteredLectures.length === 0 ? (
            <div className={`text-center py-12 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-lg">{t("noLectures")}</p>
              {(selectedStage || selectedGrade || selectedSubject || selectedStatus) && (
                <button className="btn btn-outline btn-sm mt-4" onClick={resetFilters}>
                  {t("filters.reset")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {memoizedFilteredLectures.map((lecture) => (
                  <motion.div
                    key={lecture.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link to={`/lecture-details/${lecture.id}`}>
                      <CourseCard
                        {...lecture}
                        isRTL={isRTL}
                        childrenCount={lecture.childrenCount}
                        teacherRole={lecture.teacherRole}
                        status={lecture.status}
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