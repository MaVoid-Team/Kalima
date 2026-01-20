"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllLecturers } from "../../routes/fetch-users";
import { useTranslation } from "react-i18next";
import TeacherCard from "../../components/TeacherCard";

export const TeachersSection = React.memo(() => {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleTeachers, setVisibleTeachers] = useState(4);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllLecturers();
      if (result.success) {
        const formattedTeachers = result.data.map((lecturer) => ({
          id: lecturer._id,
          image: "/course-1.png",
          name: lecturer.name,
          subject:
            lecturer.expertise ||
            (isRTL ? "خبير تعليمي" : "Educational Expert"),
          experience: lecturer.bio || (isRTL ? "خبير" : "Expert"),
          grade: isRTL ? "جميع المراحل" : "All Levels",
          rating: 5,
          email: lecturer.email,
          gender: lecturer.gender,
        }));
        setTeachers(formattedTeachers);
      } else {
        setError(result.error || t("teachers.errors.failed"));
      }
    } catch (err) {
      setError(t("teachers.errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTeachers = () => {
    setVisibleTeachers(teachers.length);
  };

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
              {isRTL ? "مجتمع النخبة" : "The Elite Circle"}
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
                عقول <span className="text-secondary italic">ملهمة</span> <br />
                تصنع الفارق
              </>
            ) : (
              <>
                Inspiring <span className="text-secondary italic">Minds</span>{" "}
                <br />
                Crafting Excellence
              </>
            )}
          </motion.h2>

          <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-2xl italic border-l-4 border-primary/20 pl-8 rtl:border-l-0 rtl:border-r-4 rtl:pr-8 rtl:pl-0">
            {isRTL
              ? "نخبة من أفضل المعلمين والخبراء التربويين الذين كرسوا حياتهم للتميز الأكاديمي وصناعة جيل مبدع."
              : "An elite selection of world-class educators and experts dedicated to academic excellence and nurturing innovation."}
          </p>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
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
              onClick={fetchTeachers}
            >
              {t("teachers.errors.retry")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {teachers.slice(0, visibleTeachers).map((teacher) => (
                <TeacherCard key={teacher.id} {...teacher} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && visibleTeachers < teachers.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex justify-center"
          >
            <button
              onClick={loadMoreTeachers}
              className="group inline-flex items-center gap-4 px-12 py-5 bg-white rounded-full border border-base-content/10 hover:border-primary transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 font-black text-base-content tracking-tight uppercase">
                {t("teachers.loadMore")}
              </span>
              <div className="relative z-10 w-10 h-10 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {isRTL ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
});

TeachersSection.displayName = "TeachersSection";
