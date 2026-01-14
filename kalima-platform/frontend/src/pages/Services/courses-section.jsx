"use client"

import { useTranslation } from "react-i18next"
import { ChevronLeft, Loader, BookOpen, Users, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { CourseCard } from "../../components/CourseCard"
import { getAllContainers } from "../../routes/lectures"
import { getAllLecturers } from "../../routes/fetch-users"

export function CoursesSection() {
  const { t, i18n } = useTranslation("home")
  const isRTL = i18n.language === "ar"
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [containersResult, lecturersResult] = await Promise.all([
        getAllContainers(),
        getAllLecturers(),
      ])

      if (containersResult.status === "success" && lecturersResult.success) {
        const containersData = containersResult.data.containers
        const lecturersList = lecturersResult.data

        setCourses(
          containersData.map((container, index) => {
            const lecturer = lecturersList.find(
              (lect) => lect._id === container.createdBy
            )

            let grade = "الصف الأول"
            if (container.level) {
              const levelName = container.level.name
              if (levelName === "Primary") grade = "الصف الأول الابتدائي"
              else if (levelName === "Middle") grade = "الصف الأول الإعدادي"
              else if (levelName === "Upper Primary") grade = "الصف الرابع الابتدائي"
              else if (levelName === "Higher Secondary") grade = "الصف الأول الثانوي"
            }

            return {
              id: container._id,
              image: `/course-${(index % 6) + 1}.png`,
              title: container.name,
              subject: container.subject?.name || "",
              teacher: lecturer?.name || `أستاذ ${container.name}`,
              teacherRole: lecturer?.role || "محاضر",
              grade,
              rating: 4 + (index % 2) * 0.5,
              duration: 12 + index,
              status: container.price > 0 ? "مدفوع" : "مجاني",
              price: container.price || 0,
              childrenCount: container.children?.length || 0,
              type: container.type === "course" ? "شرح" : container.type,
            }
          })
        )
      } else {
        setError(t("courses.errors.failed"))
      }
    } catch (err) {
      console.error("Error fetching courses or lecturers:", err)
      setError(t("courses.errors.failed"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const stats = [
    { id: 1, icon: BookOpen, value: courses.length, label: isRTL ? "دورة متاحة" : "Available Courses" },
    { id: 2, icon: Users, value: "10K+", label: isRTL ? "طالب نشط" : "Active Students" },
    { id: 3, icon: Clock, value: "24/7", label: isRTL ? "دعم مستمر" : "Support" },
  ]

  return (
    <section className="relative py-20 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Giant Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.02, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`text-[15rem] lg:text-[22rem] font-bold leading-none select-none ${
            isRTL ? "font-[family-name:var(--font-shakhabeet)]" : "font-[family-name:var(--font-bigx)]"
          }`}
          style={{
            WebkitTextStroke: "2px currentColor",
            color: "transparent",
          }}
        >
          {isRTL ? "دورات" : "COURSES"}
        </motion.div>
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-gradient-to-tl from-secondary/10 via-accent/10 to-transparent rounded-full blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-[family-name:var(--font-malmoom)] text-primary">
              {t("courses.title")}
            </span>
          </div>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family-name:var(--font-headline)]`}>
            {t("courses.heading")}{" "}
            <span className="text-primary relative inline-block">
              {t("courses.platform")}
              <svg
                className={`absolute -bottom-3 w-full ${isRTL ? "right-0" : "left-0"}`}
                width="140"
                height="16"
                viewBox="0 0 140 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 8C20 16 40 0 60 8C80 16 100 0 120 8C140 16 140 0 140 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className={`text-lg text-base-content/70 max-w-2xl mx-auto font-[family-name:var(--font-body)]`}>
            {isRTL
              ? "استكشف مجموعة واسعة من الدورات التعليمية المصممة لتناسب احتياجاتك"
              : "Explore a wide range of educational courses designed to meet your needs"}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-base-100/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-base-300/50 group-hover:border-primary/50 transition-colors text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-[family-name:var(--font-bigx)] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-base-content/60 font-[family-name:var(--font-malmoom)]">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className={`font-[family-name:var(--font-body)] ${isRTL ? "mr-2" : "ml-2"}`}>
              {t("courses.errors.loading")}
            </span>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <p className="font-[family-name:var(--font-body)]">{error}</p>
            <button className="btn btn-sm btn-outline font-[family-name:var(--font-malmoom)]" onClick={fetchCourses}>
              {t("courses.errors.retry")}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <AnimatePresence>
                {courses.slice(0, 4).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <Link to={`/courses/${course.id}`}>
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

            {courses.length > 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <Link to="/courses">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group btn btn-primary btn-lg rounded-full gap-2 font-[family-name:var(--font-handicrafts)] overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative">{t("courses.viewAll")}</span>
                    <ChevronLeft className={`w-5 h-5 ${isRTL ? "mr-0" : "ml-0 rotate-180"}`} />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
