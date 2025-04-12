import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ChevronLeft, Loader } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Plus, Clock, Heart, ChevronRight } from "lucide-react";
import { CourseCard } from "../../components/CourseCard";
import { getAllSubjects } from "../../routes/courses";

export function CourseManagementSection() {
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
    <section className="p-6 md:p-8 bg-base-100" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Header matching your image exactly */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 mb-8"
      >
        {/* Button row - positioned left in RTL, right in LTR */}
        <div 
          className={`w-full flex ${isRTL ? 'justify-start' : 'justify-end'}`}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 text-primary px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-primary ${
              isRTL ? 'mr-auto' : 'ml-auto'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>{isRTL ? "إنشاء كورس جديد" : "Create New Course"}</span>
          </motion.button>
        </div>
      
        {/* Centered title section */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {isRTL ? "إدارة الكورسات" : "Course Management"}
          </h1>
        
        </div>
      </motion.div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
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
            {/* 3x3 Grid matching your image exactly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

export function ReviewCoursesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6; // 2 rows x 3 columns

  // Review courses data
  const allCourses = [
    {
      id: 1,
      subject: { ar: "الأحياء", en: "Biology" },
      title: {
        ar: "المراجعة النهائية في الأحياء للصف الثالث الثانوي",
        en: "Final Biology Review for 12th Grade",
      },
      instructor: { ar: "إيهاب أحمد", en: "Ehab Ahmed" },
      duration: { ar: "3 أسابيع", en: "3 Weeks" },
      students: 165,
      originalPrice: { ar: "300 ج", en: "300 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      subject: { ar: "رياضيات", en: "Math" },
      title: {
        ar: "مراجعة شاملة في الرياضيات التطبيقية",
        en: "Comprehensive Applied Math Review",
      },
      instructor: { ar: "سارة محمد", en: "Sara Mohamed" },
      duration: { ar: "4 أسابيع", en: "4 Weeks" },
      students: 243,
      originalPrice: { ar: "350 ج", en: "350 EGP" },
      isFree: false,
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      subject: { ar: "فلسفة", en: "Philosophy" },
      title: {
        ar: "مراجعة نهائية لمادة الفلسفة والمنطق",
        en: "Final Philosophy & Logic Review",
      },
      instructor: { ar: "عمرو خالد", en: "Amr Khaled" },
      duration: { ar: "2 أسابيع", en: "2 Weeks" },
      students: 98,
      originalPrice: { ar: "250 ج", en: "250 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      subject: { ar: "كيمياء", en: "Chemistry" },
      title: {
        ar: "المراجعة النهائية في الكيمياء العضوية",
        en: "Final Organic Chemistry Review",
      },
      instructor: { ar: "نورا سعيد", en: "Nora Saeed" },
      duration: { ar: "5 أسابيع", en: "5 Weeks" },
      students: 187,
      originalPrice: { ar: "400 ج", en: "400 EGP" },
      isFree: false,
      image:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 5,
      subject: { ar: "فيزياء", en: "Physics" },
      title: {
        ar: "مراجعة شاملة للفيزياء الحديثة",
        en: "Comprehensive Modern Physics Review",
      },
      instructor: { ar: "خالد وليد", en: "Khaled Waleed" },
      duration: { ar: "6 أسابيع", en: "6 Weeks" },
      students: 312,
      originalPrice: { ar: "450 ج", en: "450 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 6,
      subject: { ar: "لغة عربية", en: "Arabic" },
      title: {
        ar: "مراجعة النصوص الأدبية للثانوية العامة",
        en: "Literary Texts Review for High School",
      },
      instructor: { ar: "منى علي", en: "Mona Ali" },
      duration: { ar: "3 أسابيع", en: "3 Weeks" },
      students: 134,
      originalPrice: { ar: "300 ج", en: "300 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    // Additional courses for pagination demo
    {
      id: 7,
      subject: { ar: "تاريخ", en: "History" },
      title: {
        ar: "مراجعة التاريخ الحديث والمعاصر",
        en: "Modern and Contemporary History Review",
      },
      instructor: { ar: "أحمد سمير", en: "Ahmed Samir" },
      duration: { ar: "4 أسابيع", en: "4 Weeks" },
      students: 210,
      originalPrice: { ar: "320 ج", en: "320 EGP" },
      isFree: false,
      image:
        "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 8,
      subject: { ar: "جغرافيا", en: "Geography" },
      title: {
        ar: "مراجعة الجغرافيا البشرية والطبيعية",
        en: "Human and Physical Geography Review",
      },
      instructor: { ar: "هناء محمود", en: "Hana Mahmoud" },
      duration: { ar: "3 أسابيع", en: "3 Weeks" },
      students: 178,
      originalPrice: { ar: "280 ج", en: "280 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 9,
      subject: { ar: "لغة فرنسية", en: "French" },
      title: {
        ar: "مراجعة شاملة للغة الفرنسية",
        en: "Comprehensive French Language Review",
      },
      instructor: { ar: "ياسمين فؤاد", en: "Yasmine Fouad" },
      duration: { ar: "5 أسابيع", en: "5 Weeks" },
      students: 145,
      originalPrice: { ar: "380 ج", en: "380 EGP" },
      isFree: false,
      image:
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 10,
      subject: { ar: "اقتصاد", en: "Economics" },
      title: {
        ar: "مراجعة مبادئ الاقتصاد الكلي",
        en: "Macroeconomics Principles Review",
      },
      instructor: { ar: "عماد الدين", en: "Emad ElDin" },
      duration: { ar: "4 أسابيع", en: "4 Weeks" },
      students: 198,
      originalPrice: { ar: "350 ج", en: "350 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 11,
      subject: { ar: "إحصاء", en: "Statistics" },
      title: {
        ar: "مراجعة الإحصاء الوصفي والاستدلالي",
        en: "Descriptive and Inferential Statistics Review",
      },
      instructor: { ar: "نادر حسين", en: "Nader Hussein" },
      duration: { ar: "6 أسابيع", en: "6 Weeks" },
      students: 167,
      originalPrice: { ar: "400 ج", en: "400 EGP" },
      isFree: false,
      image:
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 12,
      subject: { ar: "علم نفس", en: "Psychology" },
      title: {
        ar: "مراجعة علم النفس التربوي",
        en: "Educational Psychology Review",
      },
      instructor: { ar: "سلمى وائل", en: "Salma Wael" },
      duration: { ar: "3 أسابيع", en: "3 Weeks" },
      students: 156,
      originalPrice: { ar: "300 ج", en: "300 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 13,
      subject: { ar: "علم نفس", en: "Psychology" },
      title: {
        ar: "مراجعة علم النفس التربوي",
        en: "Educational Psychology Review",
      },
      instructor: { ar: "سلمى وائل", en: "Salma Wael" },
      duration: { ar: "3 أسابيع", en: "3 Weeks" },
      students: 156,
      originalPrice: { ar: "300 ج", en: "300 EGP" },
      isFree: true,
      image:
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    }
  ];

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = allCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const totalPages = Math.ceil(allCourses.length / coursesPerPage);

  const toggleFavorite = (courseId) => {
    setFavorites((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 bg-base-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-2">
              {isRTL ? "كورسـات المراجعة" : "Review Courses"}
            </h2>
            <p className="text-base-content/70 text-lg">
              {isRTL
                ? "اكتشف أهم كورسات المراجعة النهائية"
                : "Discover top final review courses"}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2  text-primary px-4 py-2 rounded-r-full  rounded-l-full shadow-sm hover:shadow-md transition-all border border-primary"
          >
            <Plus className="w-5 h-5" />
            <span>{isRTL ? "أضف كورس" : "Add Course"}</span>
          </motion.button>
        </div>

        {/* Courses Grid - 2x3 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-base-100 rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-base-200/50 hover:border-primary/20 transition-all duration-300"
            >
              {/* Course Image */}
              <div className="relative h-48 w-full">
                <img
                  src={course.image}
                  alt={isRTL ? course.title.ar : course.title.en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Subject Tag */}
                <div className="absolute top-4 left-4 bg-base-content text-base-100 text-sm px-3 py-1 rounded-full">
                  {isRTL ? course.subject.ar : course.subject.en}
                </div>

                {/* Favorite Button */}
                <motion.button
                  onClick={() => toggleFavorite(course.id)}
                  className="absolute top-4 right-4 bg-base-100/80 p-2 rounded-full shadow-sm hover:bg-error/20 hover:text-error transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={
                      favorites.includes(course.id) ? "currentColor" : "none"
                    }
                  />
                </motion.button>
              </div>

              {/* Course Content */}
              <div className="p-4">
                <p className="text-base-content/70 text-sm mb-1">
                  {isRTL ? course.instructor.ar : course.instructor.en}
                </p>
                <h3 className="font-bold text-base-content mb-3 text-lg">
                  {isRTL ? course.title.ar : course.title.en}
                </h3>

                {/* Course Info */}
                <div className="flex items-center gap-4 text-sm text-base-content/70 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration[isRTL ? "ar" : "en"]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {course.students} {isRTL ? "طالب" : "Students"}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="line-through text-base-content/50 text-sm mr-2">
                      {course.originalPrice[isRTL ? "ar" : "en"]}
                    </span>
                    {course.isFree && (
                      <span className="text-primary font-medium">
                        {isRTL
                          ? "المراجعة مجاناً مع الكورس"
                          : "Free with course"}
                      </span>
                    )}
                  </div>
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    {isRTL ? "عرض المزيد" : "View More"}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <motion.button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </motion.button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-full font-medium transition-colors ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "hover:bg-base-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
function CourseSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Course categories data with real image icons
  const categories = [
    {
      id: 1,
      name: { ar: "الكيمياء", en: "Chemistry" },
      icon: "https://cdn-icons-png.flaticon.com/512/2695/2695395.png",
      count: 38,
    },
    {
      id: 2,
      name: { ar: "الرعاية الصحية", en: "Healthcare" },
      icon: "https://cdn-icons-png.flaticon.com/512/2964/2964300.png",
      count: 38,
    },
    {
      id: 3,
      name: { ar: "علم النفس", en: "Psychology" },
      icon: "https://cdn-icons-png.flaticon.com/512/3048/3048127.png",
      count: 38,
    },
    {
      id: 4,
      name: { ar: "اللغة العربية", en: "Arabic" },
      icon: "https://cdn-icons-png.flaticon.com/512/3898/3898082.png",
      count: 38,
    },
    {
      id: 5,
      name: { ar: "الفيزياء", en: "Physics" },
      icon: "https://cdn-icons-png.flaticon.com/512/2933/2933245.png",
      count: 38,
    },
    {
      id: 6,
      name: { ar: "اللغات", en: "Languages" },
      icon: "https://cdn-icons-png.flaticon.com/512/3899/3899618.png",
      count: 38,
    },
    {
      id: 7,
      name: { ar: "الفلسفة", en: "Philosophy" },
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936886.png",
      count: 38,
    },
    {
      id: 8,
      name: { ar: "التاريخ", en: "History" },
      icon: "https://cdn-icons-png.flaticon.com/512/3424/3424655.png",
      count: 38,
    },
    {
      id: 9,
      name: { ar: "الاقتصاد", en: "Economics" },
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936881.png",
      count: 38,
    },
    {
      id: 10,
      name: { ar: "الرياضيات", en: "Mathematics" },
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936883.png",
      count: 38,
    },
  ];

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 bg-base-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Matches the reference image style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-2">
            {isRTL ? "أهم الكورسات" : "Featured Courses"}
          </h2>
          <div className="flex items-center  gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-base-content/70 text-lg md:text-xl">
              {isRTL
                ? "استكشف كورساتنا الشائعة"
                : "Explore our popular courses"}
            </p>
          </div>
        </motion.div>

        {/* Courses Grid with enhanced animations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -8,
                boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-base-100 rounded-xl shadow-sm hover:shadow-md p-4 text-center transition-all duration-300 border border-base-200/50 hover:border-primary/20"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center p-2"
              >
                <img
                  src={category.icon}
                  alt={isRTL ? category.name.ar : category.name.en}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </motion.div>
              <h3 className="font-bold text-base-content mb-1 text-lg">
                {isRTL ? category.name.ar : category.name.en}
              </h3>
              <p className="text-sm text-base-content/70">
                {category.count} {isRTL ? "كورس" : "Courses"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AssistantsSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Assistant data with working online images
  const assistants = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80",
      name: { ar: "أحمد محمد", en: "Ahmed Mohamed" },
      description: {
        ar: "متخصص في الرياضيات والفيزياء مع أكثر من 10 سنوات خبرة",
        en: "Specialist in Mathematics and Physics with over 10 years of experience",
      },
      specialty: { ar: "الرياضيات والفيزياء", en: "Mathematics & Physics" },
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
      name: { ar: "سارة عبدالله", en: "Sarah Abdullah" },
      description: {
        ar: "خبيرة في اللغة الإنجليزية وتحضير اختبارات الآيلتس",
        en: "Expert in English language and IELTS test preparation",
      },
      specialty: { ar: "اللغة الإنجليزية", en: "English Language" },
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&auto=format&fit=crop&q=80",
      name: { ar: "خالد علي", en: "Khaled Ali" },
      description: {
        ar: "مدرس كيمياء معتمد وحاصل على جوائز في التدريس",
        en: "Certified chemistry teacher and award-winning instructor",
      },
      specialty: { ar: "الكيمياء", en: "Chemistry" },
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      name: { ar: "نورا سعد", en: "Nora Saad" },
      description: {
        ar: "متخصصة في علم الأحياء والعلوم الطبية",
        en: "Specialist in Biology and Medical Sciences",
      },
      specialty: { ar: "علم الأحياء", en: "Biology" },
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      name: { ar: "فيصل عبدالرحمن", en: "Faisal Abdulrahman" },
      description: {
        ar: "خبير في البرمجة وتطوير الويب والذكاء الاصطناعي",
        en: "Expert in Programming, Web Development and Artificial Intelligence",
      },
      specialty: { ar: "البرمجة", en: "Programming" },
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&auto=format&fit=crop&q=80",
      name: { ar: "لمى أحمد", en: "Lama Ahmed" },
      description: {
        ar: "مدرسة لغة عربية ومحاضرة في الأدب العربي",
        en: "Arabic language teacher and lecturer in Arabic literature",
      },
      specialty: { ar: "اللغة العربية", en: "Arabic Language" },
    },
  ];

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 bg-base-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background pattern similar to TeachersSection */}
      <div className="absolute top-0 left-0 w-2/3 h-full pointer-events-none z-0 opacity-10">
        <img
          src="/background-courses.png"
          alt="background pattern"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary dark:text-primary-400" />
            </div>
            <h2 className="text-lg sm:text-lg md:text-xl font-bold text-primary hover:text-primary-600">
              {isRTL ? "نخبه من المساعدين" : "Elite Assistants"}
              <span className="block h-1 w-16 mt-2 bg-primary dark:bg-primary-400 rounded-full"></span>
            </h2>
          </div>

          <Link
            to="/assistants"
            className="flex items-center text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm sm:text-base transition-colors duration-300"
          >
            {isRTL ? "مشاهده الجميع" : "View All"}
            <ChevronLeft
              className={`h-4 w-4 ${isRTL ? "mr-2" : "ml-2 rotate-180"}`}
            />
          </Link>
        </motion.div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {assistants.map((assistant, index) => (
              <motion.div
                key={assistant.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-base-100 rounded-xl shadow-lg hover:shadow-lg transition-all duration-300 relative mt-24"
              >
                {/* Assistant Image container - positioned half outside the card */}
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-48 h-48">
                  <div className="w-full h-full p-1 shadow-lg overflow-hidden">
                    <img
                      src={assistant.image}
                      alt={isRTL ? assistant.name.ar : assistant.name.en}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Content container - pushed down to make space for the image */}
                <div className="pt-24 pb-6 px-6 flex flex-col items-center text-center">
                  {/* Assistant Name */}
                  <h3 className="text-lg sm:text-xl font-bold text-base-content">
                    {isRTL ? assistant.name.ar : assistant.name.en}
                  </h3>

                  {/* Assistant Description */}
                  <p className="text-base-content text-sm sm:text-base mb-4">
                    {isRTL
                      ? assistant.description.ar
                      : assistant.description.en}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
function CoursesDashboard() {
  return (
    <div className="w-full overflow-x-hidden p-14">
      <CourseManagementSection />
      <AssistantsSection />
      <CourseSection />
      <ReviewCoursesSection />
    </div>
  );
}

export default CoursesDashboard;
