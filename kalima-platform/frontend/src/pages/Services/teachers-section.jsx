"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader, Users, Award, GraduationCap } from 'lucide-react';
import { getAllLecturers } from "../../routes/fetch-users";
import { useTranslation } from "react-i18next";
import TeacherCard from "../../components/TeacherCard";
import { motion } from "framer-motion";

export function TeachersSection() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';
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
          subject: lecturer.expertise || t('teachers.labels.expertise'),
          experience: lecturer.bio || t('teachers.labels.experience'),
          grade: t('teachers.labels.gradeLevels'),
          rating: 5,
          email: lecturer.email,
          gender: lecturer.gender
        }));
        setTeachers(formattedTeachers);
      } else {
        setError(result.error || t('teachers.errors.failed'));
      }
    } catch (err) {
      setError(t('teachers.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTeachers = () => {
    setVisibleTeachers(teachers.length);
  };

  const stats = [
    { id: 1, icon: Users, value: teachers.length, label: isRTL ? "معلم محترف" : "Expert Teachers" },
    { id: 2, icon: GraduationCap, value: "15+", label: isRTL ? "سنة خبرة" : "Years Experience" },
    { id: 3, icon: Award, value: "98%", label: isRTL ? "رضا الطلاب" : "Student Satisfaction" },
  ];

  return (
    <section className="relative py-20 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Giant Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.02, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`text-[15rem] lg:text-[22rem] font-bold leading-none select-none ${
            isRTL ? "font-[family-name:var(--font-bigx)]" : "font-[family-name:var(--font-laxr)]"
          }`}
          style={{
            WebkitTextStroke: "2px currentColor",
            color: "transparent",
          }}
        >
          {isRTL ? "المعلمين" : "TEACHERS"}
        </motion.div>
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-secondary/10 via-primary/10 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-gradient-to-tl from-accent/10 via-secondary/10 to-transparent rounded-full blur-3xl"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 backdrop-blur-sm rounded-full border border-secondary/20 mb-6">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-[family-name:var(--font-malmoom)] text-secondary">
              {t('teachers.title')}
            </span>
          </div>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family-name:var(--font-headline)]`}>
            {t('teachers.heading')}{" "}
            <span className="text-primary relative inline-block">
              {t('teachers.platform')}
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
              ? "تعرف على فريقنا من المعلمين المحترفين ذوي الخبرة الواسعة"
              : "Meet our team of professional teachers with extensive experience"}
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
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-base-100/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-base-300/50 group-hover:border-secondary/50 transition-colors text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-[family-name:var(--font-bigx)] bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-base-content/60 font-[family-name:var(--font-malmoom)]">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-secondary" />
            <span className={`font-[family-name:var(--font-body)] ${isRTL ? "mr-2" : "ml-2"}`}>
              {t('teachers.errors.loading')}
            </span>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <p className="font-[family-name:var(--font-body)]">{error}</p>
            <button className="btn btn-sm btn-outline font-[family-name:var(--font-malmoom)]" onClick={fetchTeachers}>
              {t('teachers.errors.retry')}
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-[family-name:var(--font-body)]">{t('teachers.errors.noneFound')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {teachers.slice(0, visibleTeachers).map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <TeacherCard teacher={teacher} />
                </motion.div>
              ))}
            </div>

            {visibleTeachers < teachers.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group btn btn-secondary btn-lg rounded-full gap-2 font-[family-name:var(--font-handicrafts)] overflow-hidden"
                  onClick={loadMoreTeachers}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative">{t('teachers.loadMore')}</span>
                  <ChevronLeft className={`w-5 h-5 ${isRTL ? "mr-0" : "ml-0 rotate-180"}`} />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}