"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { getAllLecturesPublic } from "../routes/lectures"
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
      const result = await getAllLecturesPublic()
      if (result.status === "success") {
        setLectures(result.data.containers)
        setFilteredLectures(result.data.containers)
      } else {
        setError(result.message || "Failed to fetch lectures")
      }
    } catch (err) {
      console.error("Error fetching lectures:", err)
      setError("حدث خطأ أثناء تحميل المحاضرات")
    } finally {
      setLoading(false)
    }
  }

  const generateLectureData = (lecturesData) => {
    return lecturesData.map((lecture) => ({
      id: lecture._id,
      image: `/course-${Math.floor(Math.random() * 6) + 1}.png`,
      title: lecture.name,
      subject: lecture.subject?.name || "غير محدد",
      teacher: lecture.createdBy?.name || "مدرس غير محدد",
      teacherRole: lecture.createdBy?.role || "محاضر",
      grade: lecture.level?.name || "غير محدد",
      rating: 4,
      stage: lecture.createdBy?.role || "غير محدد",
      type: "محاضرة",
      status: lecture.price > 0 ? "مدفوع" : "مجاني",
      price: lecture.price || 0,
      childrenCount: lecture.attachments
        ? (lecture.attachments.booklets?.length || 0) +
          (lecture.attachments.exams?.length || 0) +
          (lecture.attachments.homeworks?.length || 0) +
          (lecture.attachments.pdfsandimages?.length || 0)
        : 0,
      views: lecture.numberOfViews || 0,
      description: lecture.description || "لا يوجد وصف",
    }))
  }

  const applyFilters = useCallback(() => {
    let filtered = lectures

    if (selectedStage) {
      filtered = filtered.filter(
        (lecture) => lecture.createdBy?.role === selectedStage
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
      filtered = filtered.filter((lecture) => {
        const status = lecture.price > 0 ? "مدفوع" : "مجاني"
        return status === selectedStatus
      })
    }

    setFilteredLectures(filtered)
  }, [selectedStage, selectedGrade, selectedSubject, selectedStatus, lectures])

  const resetFilters = useCallback(() => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedSubject("")
    setSelectedStatus("")
    setFilteredLectures(lectures)
  }, [lectures])

  const memoizedFilteredLectures = useMemo(
    () => generateLectureData(filteredLectures),
    [filteredLectures]
  )

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

  const levelOptions = useMemo(() => {
    const uniqueLevels = new Set()
    lectures.forEach((lecture) => {
      if (lecture.level?.name) {
        uniqueLevels.add(lecture.level.name)
      }
    })
    return Array.from(uniqueLevels).map((level) => ({
      label: t(`levels.${level}`), // use i18n key
      value: level,
    }))
  }, [lectures, t])

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: "filters.stages.lecturer", value: "Lecturer" },
        { label: "filters.stages.professor", value: "Professor" },
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
        { label: "filters.statuses.free", value: "مجاني" },
        { label: "filters.statuses.paid", value: "مدفوع" },
      ],
      onSelect: setSelectedStatus,
    },
  ]

  // Inline dropdown component with translation support
  const FilterDropdown = ({ label, options, selectedValue, onSelect, isRTL }) => (
    <div className="w-full">
      <label
        className={`block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedValue}
          onChange={(e) => onSelect(e.target.value)}
          className={`w-full appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            isRTL ? "text-right" : "text-left"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <option value="">{t("filters.reset")}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label.startsWith("filters.") ? t(option.label) : option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
  

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
          <div className="flex justify-start">
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
                    <CourseCard
                      {...lecture}
                      isRTL={isRTL}
                      childrenCount={lecture.childrenCount}
                      teacherRole={lecture.teacherRole}
                      status={lecture.status}
                    />
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
