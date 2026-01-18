"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CourseCard } from "../../components/CourseCard";
import { getAllContainers } from "../../routes/lectures";
import { getAllLecturers } from "../../routes/fetch-users";

export const CoursesSection = React.memo(() => {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [containersResult, lecturersResult] = await Promise.all([
        getAllContainers(),
        getAllLecturers(),
      ]);

      if (containersResult.status === "success" && lecturersResult.success) {
        const containersData = containersResult.data.containers;
        const lecturersList = lecturersResult.data;

        setCourses(
          containersData.slice(0, 6).map((container, index) => {
            const lecturer = lecturersList.find(
              (lect) => lect._id === container.createdBy,
            );

            let grade = isRTL ? "جميع المراحل" : "All Levels";
            if (container.level) {
              const levelName = container.level.name;
              if (levelName === "Primary")
                grade = isRTL ? "ابتدائي" : "Primary";
              else if (levelName === "Middle")
                grade = isRTL ? "إعدادي" : "Middle";
              else if (levelName === "Upper Primary")
                grade = isRTL ? "عليا" : "Upper Prim";
              else if (levelName === "Higher Secondary")
                grade = isRTL ? "ثانوي" : "Secondary";
            }

            return {
              id: container._id,
              image: `/course-${(index % 6) + 1}.png`,
              title: container.name,
              subject: container.subject?.name || "",
              teacher: lecturer?.name || `Dr. ${container.name}`,
              teacherRole: lecturer?.role || "Faculty",
              grade,
              rating: 5,
              duration: 12 + index,
              status: container.price > 0 ? "Premium" : "Free",
              price: container.price || 0,
              childrenCount: container.children?.length || 0,
              type: container.type === "course" ? "Academic" : container.type,
            };
          }),
        );
      } else {
        setError(t("courses.errors.failed"));
      }
    } catch (err) {
      console.error("Error fetching courses or lecturers:", err);
      setError(t("courses.errors.failed"));
    } finally {
      setLoading(false);
    }
  }, [t, isRTL]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <section
      className="relative py-16 sm:py-24 lg:py-40 bg-white overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header - Same style as other sections */}
        <div className={`mb-12 sm:mb-20 ${isRTL ? "text-right" : "text-left"}`}>
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex items-center gap-6 mb-10 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-16 h-px bg-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
              {isRTL ? "المسارات التعليمية" : "Learning Paths"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-base-content leading-[0.9] tracking-tighter mb-6 sm:mb-10"
          >
            {isRTL ? (
              <>
                استكشف <span className="text-secondary italic">مستقبلك</span>{" "}
                <br />
                عبر كورساتنا
              </>
            ) : (
              <>
                Explore Your{" "}
                <span className="text-secondary italic">Future</span> <br />
                Through Our Courses
              </>
            )}
          </motion.h2>

          <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-2xl italic border-l-4 border-primary/20 pl-8 rtl:border-l-0 rtl:border-r-4 rtl:pr-8 rtl:pl-0">
            {isRTL
              ? "مناهج تعليمية متطورة مصممة بأحدث المعايير العالمية لتضمن لك تجربة تعلم فريدة ومتكاملة."
              : "Advanced educational curricula designed with the latest global standards to ensure a unique and integrated learning experience."}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-base-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-dashed border-base-content/10 rounded-3xl">
            <p className="text-base-content/40 mb-8">{error}</p>
            <button
              className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-shadow"
              onClick={fetchCourses}
            >
              {t("courses.errors.retry")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} isRTL={isRTL} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <Link to="/courses">
            <button className="group inline-flex items-center gap-4 px-12 py-5 bg-white rounded-full border border-base-content/10 hover:border-primary transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 font-black text-base-content tracking-tight uppercase">
                {t("courses.viewAll")}
              </span>
              <div className="relative z-10 w-10 h-10 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ChevronRight
                  className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`}
                />
              </div>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

CoursesSection.displayName = "CoursesSection";
