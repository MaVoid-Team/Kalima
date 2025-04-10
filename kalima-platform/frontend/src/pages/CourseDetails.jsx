"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { getContainerById } from "../routes/lectures"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import { FaDoorOpen, FaSearch, FaRegStickyNote, FaArrowLeft } from "react-icons/fa"

const DetailItem = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-center"
  >
    <span className="text-sm text-base-content/70">{value}</span>
    <span className="font-semibold text-sm text-base-content">: {label}</span>
  </motion.div>
)

const LectureItem = ({ lecture, onClick, isRTL }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded-md"
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <FaRegStickyNote className="text-base-content w-4 h-4 flex-shrink-0" />
      <span className="break-words font-semibold">{lecture.name}</span>
    </div>
    <span className="font-semibold text-base-content/70 sm:text-base-content/70 sm:bg-transparent sm:px-0 sm:py-0 bg-primary text-white rounded-full px-3 py-1 whitespace-nowrap">
      {lecture.kind || "Lecture"}
    </span>
  </motion.li>
)

const LecturesList = ({ lectures, onLectureClick, isRTL }) => (
  <div>
    <ul className="list-none text-xs text-base-content space-y-2">
      {lectures.map((lecture) => (
        <LectureItem
          key={lecture._id || lecture.id}
          lecture={lecture}
          onClick={() => onLectureClick(lecture._id || lecture.id)}
          isRTL={isRTL}
        />
      ))}
    </ul>
  </div>
)

export default function CourseDetails() {
  const { t, i18n } = useTranslation("courseDetails", { fallback: "common" })
  const isRTL = i18n.language === "ar"
  const { containerId } = useParams()
  const [container, setContainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchContainerDetails = async () => {
      try {
        setLoading(true)
        const result = await getContainerById(containerId)
        console.log("Container details:", result)

        if (result && result.data?.container) {
          setContainer(result.data.container)
        } else {
          setError("Failed to fetch container details")
        }
      } catch (err) {
        console.error("Error fetching container details:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (containerId) {
      fetchContainerDetails()
    }
  }, [containerId])

  const handleLectureClick = (lectureId) => {
    // Navigate to lecture details page
    window.location.href = `/container-details/${containerId}/lecture-page/${lectureId}`
  }

  // Get subject and level names
  const subjectName = useMemo(() => {
    if (container?.subject) {
      return typeof container.subject === "object" ? container.subject.name : "Mathematics"
    }
    return "Mathematics"
  }, [container])

  const levelName = useMemo(() => {
    if (container?.level) {
      return typeof container.level === "object" ? container.level.name : "Primary"
    }
    return "Primary"
  }, [container])

  // Format container type for display
  const containerTypeDisplay = useMemo(() => {
    if (!container?.type) return ""

    switch (container.type) {
      case "lecture":
        return "محاضرة"
      case "month":
        return "اشتراك شهري"
      case "term":
        return "اشتراك فصل دراسي"
      case "year":
        return "اشتراك سنوي"
      case "course":
        return "كورس كامل"
      default:
        return container.type
    }
  }, [container])

  const courseDetailsContent = useMemo(
    () => (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        className="bg-base-100 shadow-lg rounded-lg p-6 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-sm"
        dir={isRTL ? "ltr" : "rtl"}
      >
        <h2 className="text-xl font-bold text-base-content text-center mb-4">تفاصيل الكورس</h2>
        <div className="w-full h-px bg-base-300 mb-4" />
        <div className="space-y-4">
          <DetailItem label="المدرس" value={container?.createdBy?.name || "غير معروف"} />
          <DetailItem label="عدد المحاضرات" value={container?.children?.length || 0} />
          <DetailItem label="المستوى" value={levelName} />
          <DetailItem label="المادة" value={subjectName} />
          <DetailItem label="النوع" value={containerTypeDisplay} />
          <DetailItem label="السعر" value={`${container?.price || 0} جنيه`} />
        </div>
      </motion.div>
    ),
    [container, isRTL, levelName, subjectName, containerTypeDisplay],
  )

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert error={error} onRetry={() => window.location.reload()} />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-base-200"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="container mx-auto px-4 pt-4 mb-8 flex items-center justify-between"
        >
          <div className="relative inline-block">
            <p className="flex items-center gap-x-4 text-3xl font-bold text-base-content md:mx-40 relative z-10">
              <FaSearch />
              {container?.name || "تفاصيل الكورس"}
            </p>
            <img
              src="/underline.png"
              alt="underline"
              className="absolute bottom-0 left-0 w-full h-auto object-contain z-0"
            />
          </div>
          <Link to="/courses">
            <button className="btn btn-outline btn-sm">
              <FaArrowLeft /> العودة للكورسات
            </button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {courseDetailsContent}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-focus transition duration-300 text-sm ${
                  isRTL ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <FaDoorOpen size={16} className="text-white" />
                اشترك الآن
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <motion.div
              className="rounded-lg shadow-sm w-full h-[300px] md:h-[400px overflow-hidden flex items-center justify-center"
              style={{ aspectRatio: "1/1" }}
            >
              <img
                src={`/course-${Math.floor(Math.random() * 6) + 1}.png`}
                alt="صورة الكورس"
                className="rounded-lg max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <h4 className={`text-lg mb-2 font-semibold text-base-content ${isRTL ? "text-right" : "text-left"}`}>
            <span className="font-bold">اسم الكورس:</span> {container?.name}
          </h4>
          <h4 className={`text-lg font-bold text-base-content ${isRTL ? "text-right" : "text-left"}`}>الوصف</h4>
          <p className={`text-sm font-semibold text-base-content mb-4 ${isRTL ? "text-right" : "text-left"}`}>
            {container?.description || "لا يوجد وصف متاح لهذا الكورس."}
            <span className="text-sm font-normal inline-block text-base-content block mt-2">المستوى: {levelName}</span>
          </p>
          <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"} mb-4`}>
            <span className="text-lg font-semibold text-base-content">
              المدة: {container?.children?.length || 0} محاضرة
            </span>
          </div>
          <div className="space-y-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <h4 className="text-lg font-bold text-base-content">أهداف الكورس</h4>
            <ul
              className={`list-disc ${isRTL ? "pr-4 list-inside" : "pl-4 list-outside"} text-sm font-semibold text-base-content`}
            >
              <li>فهم المفاهيم الأساسية في {subjectName}</li>
              <li>تطوير مهارات حل المشكلات</li>
              <li>تحسين القدرة على التفكير النقدي</li>
              <li>الاستعداد للاختبارات والامتحانات</li>
            </ul>
          </div>
        </motion.div>

        {container?.children && container.children.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className={`text-xl font-bold text-base-content mb-6 ${isRTL ? "text-right" : "text-left"}`}>
              محتوى الكورس
            </h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`bg-base-100 text-primary shadow-lg rounded-lg px-6 py-4 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-2xl ${
                isRTL ? "ml-auto" : "mr-auto"
              } relative`}
            >
              <div className={`absolute top-4 ${isRTL ? "left-2" : "right-2"} w-[100px] h-[100px] rounded-tl-lg`}>
                <img src="/CourseDetails2.png" alt="زخرفة" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-end">
                <div className={`w-full ${isRTL ? "pl-4" : "pr-4"}`}>
                  <LecturesList lectures={container.children} onLectureClick={handleLectureClick} isRTL={isRTL} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
