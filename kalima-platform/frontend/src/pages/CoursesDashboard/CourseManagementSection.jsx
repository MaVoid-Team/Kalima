import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {  Loader } from "lucide-react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllSubjects } from "../../routes/courses";
import { CourseCard } from "../../components/CourseCard";
import { Link } from "react-router-dom";
export default function CourseManagementSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  // Enhanced fake data combining your image structure and provided data
  const fakeCourses = [
    {
      id: 1,
      image: "/course-1.png",
      title: "اللغة العربية",
      subject: "اللغة العربية",
      teacher: "أ/ كامل عادل",
      instructor: "أ/ كامل عادل",
      grade: "الصف الأول",
      level: "المرحلة الإعدادية",
      stage: "المرحلة الإعدادية",
      duration: 12,
      durationText: "12 ساعة تدريبية",
      rating: 4.5,
    },
    {
      id: 2,
      image: "/course-2.png",
      title: "اللغة الإنجليزية",
      subject: "اللغة الإنجليزية",
      teacher: "أ/ أسلمي أحمد",
      instructor: "أ/ أسلمي أحمد",
      grade: "الصف الثالث",
      level: "المرحلة الإعدادية",
      stage: "المرحلة الإعدادية",
      duration: 12,
      durationText: "12 ساعة تدريبية",
      rating: 4.5,
    },
    {
      id: 3,
      image: "/course-3.png",
      title: "الرياضيات",
      subject: "الرياضيات",
      teacher: "أ/ محمد عبدالله",
      instructor: "أ/ محمد عبدالله",
      grade: "الصف الخامس",
      level: "المرحلة الابتدائية",
      stage: "المرحلة الابتدائية",
      duration: 12,
      durationText: "12 ساعة تدريبية",
      rating: 5,
    },
    // Duplicate to create 3x3 grid
    ...Array(6)
      .fill()
      .map((_, i) => ({
        id: i + 4,
        image:
          i % 3 === 0
            ? "/course-1.png"
            : i % 3 === 1
            ? "/course-2.png"
            : "/course-3.png",
        title:
          i % 3 === 0
            ? "اللغة العربية"
            : i % 3 === 1
            ? "اللغة الإنجليزية"
            : "الرياضيات",
        subject:
          i % 3 === 0
            ? "اللغة العربية"
            : i % 3 === 1
            ? "اللغة الإنجليزية"
            : "الرياضيات",
        teacher:
          i % 3 === 0
            ? "أ/ كامل عادل"
            : i % 3 === 1
            ? "أ/ أسلمي أحمد"
            : "أ/ محمد عبدالله",
        instructor:
          i % 3 === 0
            ? "أ/ كامل عادل"
            : i % 3 === 1
            ? "أ/ أسلمي أحمد"
            : "أ/ محمد عبدالله",
        grade:
          i % 3 === 0
            ? "الصف الأول"
            : i % 3 === 1
            ? "الصف الثالث"
            : "الصف الخامس",
        level: i % 3 === 2 ? "المرحلة الابتدائية" : "المرحلة الإعدادية",
        stage: i % 3 === 2 ? "المرحلة الابتدائية" : "المرحلة الإعدادية",
        duration: 12,
        durationText: "12 ساعة تدريبية",
        rating: 4 + (i % 2) * 0.5,
      })),
  ];

  // Fetch courses from API - matches your provided function
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllSubjects();
      if (result.success && result.data?.data?.subjects?.length > 0) {
        const subjectsData = result.data.data.subjects;
        setCourses(
          subjectsData.map((subject, index) => {
            let grade = "الصف الأول";
            if (subject.level && subject.level.length > 0) {
              const levelName = subject.level[0].name;
              if (levelName === "Primary") {
                grade = "الصف الأول الابتدائي";
              } else if (levelName === "Middle") {
                grade = "الصف الأول الإعدادي";
              } else if (levelName === "Upper Primary") {
                grade = "الصف الرابع الابتدائي";
              }
            }

            return {
              id: subject._id,
              image: `/course-${(index % 3) + 1}.png`,
              title: subject.name,
              subject: subject.name,
              teacher: `أستاذ ${subject.name}`,
              instructor: `أ/ ${
                subject.instructor || subject.name.split(" ")[0]
              }`,
              grade: grade,
              level: grade,
              stage: grade.includes("الابتدائي")
                ? "المرحلة الابتدائية"
                : "المرحلة الإعدادية",
              duration: 12 + index,
              durationText: `${12 + index} ساعة تدريبية`,
              rating: 4 + (index % 2) * 0.5,
            };
          })
        );
      } else {
        setCourses(fakeCourses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(t("courses.errors.failed"));
      setCourses(fakeCourses);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Mock function for fetchSubjectDetails
  const fetchSubjectDetails = async (subjectId) => {
    console.log("Fetching subject details for:", subjectId);
  };

  return (
    <section className="p-4 md:p-8 bg-base-100" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header matching your image exactly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 md:gap-6 mb-6 md:mb-8"
        >
          {/* Button row - positioned left in RTL, right in LTR */}
          <div className={`w-full flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1 md:gap-2 text-primary px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base shadow-sm hover:shadow-md transition-all border border-primary ${
                isRTL ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span>{isRTL ? "إنشاء كورس جديد" : "Create New Course"}</span>
            </motion.button>
          </div>
        
          {/* Centered title section */}
          <div className="text-center">
            <h1 className="text-xl md:text-3xl font-bold text-primary">
              {isRTL ? "إدارة الكورسات" : "Course Management"}
            </h1>
          </div>
        </motion.div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-48 md:h-64">
            <Loader className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <span className={isRTL ? "mr-2" : "ml-2"}>
              {isRTL ? "جاري تحميل البيانات..." : "Loading data..."}
            </span>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchCourses}>
              {isRTL ? "حاول مرة أخرى" : "Try again"}
            </button>
          </div>
        ) : (
          <>
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence>
                {courses.slice(0, 9).map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-base-200/50 transition-all duration-300"
                  >
                    {/* Using your CourseCard component with enhanced props */}
                    <Link href={`/courses/${course.id}`} passHref>
                      <div className="relative">
                        <CourseCard
                          id={course.id}
                          image={course.image}
                          teacherName={course.teacher}
                          instructor={course.instructor}
                          subject={course.subject}
                          subjectId={course.id}
                          level={course.level}
                          grade={course.grade}
                          stage={course.stage}
                          duration={course.duration}
                          durationText={course.durationText}
                          rating={course.rating}
                          fetchSubjectDetails={fetchSubjectDetails}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
