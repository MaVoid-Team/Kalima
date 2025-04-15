import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import { Users, ChevronLeft } from "lucide-react";

import { Plus, Clock, Heart, ChevronRight } from "lucide-react";

function ReviewCoursesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(6); // Default to desktop view

  // Review courses data (same as before)

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
    },
  ];

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile
        setCoursesPerPage(1);
      } else if (window.innerWidth < 1024) {
        // Tablet
        setCoursesPerPage(2);
      } else {
        // Desktop
        setCoursesPerPage(6);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      className="relative py-8 md:py-16 bg-base-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-3xl font-bold text-base-content mb-1 md:mb-2">
              {isRTL ? "كورسـات المراجعة" : "Review Courses"}
            </h2>
            <p className="text-base-content/70 text-sm md:text-lg">
              {isRTL
                ? "اكتشف أهم كورسات المراجعة النهائية"
                : "Discover top final review courses"}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 md:gap-2 text-primary px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base shadow-sm hover:shadow-md transition-all border border-primary"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>{isRTL ? "أضف كورس" : "Add Course"}</span>
          </motion.button>
        </div>

        {/* Responsive Courses Grid */}
        <div
          className={`
          grid gap-4 md:gap-6 mb-8 md:mb-12
          ${coursesPerPage === 1 ? "grid-cols-1" : ""}
          ${coursesPerPage === 2 ? "grid-cols-1 sm:grid-cols-2" : ""}
          ${
            coursesPerPage === 6
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : ""
          }
        `}
        >
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
              <div className="relative h-40 sm:h-48 w-full">
                <img
                  src={course.image}
                  alt={isRTL ? course.title.ar : course.title.en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Subject Tag */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-base-content text-base-100 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {isRTL ? course.subject.ar : course.subject.en}
                </div>

                {/* Favorite Button */}
                <motion.button
                  onClick={() => toggleFavorite(course.id)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-base-100/80 p-1 sm:p-2 rounded-full shadow-sm hover:bg-error/20 hover:text-error transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill={
                      favorites.includes(course.id) ? "currentColor" : "none"
                    }
                  />
                </motion.button>
              </div>

              {/* Course Content */}
              <div className="p-3 sm:p-4">
                <p className="text-base-content/70 text-xs sm:text-sm mb-1">
                  {isRTL ? course.instructor.ar : course.instructor.en}
                </p>
                <h3 className="font-bold text-base-content mb-2 sm:mb-3 text-base sm:text-lg">
                  {isRTL ? course.title.ar : course.title.en}
                </h3>

                {/* Course Info */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-base-content/70 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.duration[isRTL ? "ar" : "en"]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      {course.students} {isRTL ? "طالب" : "Students"}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="line-through text-base-content/50 text-xs sm:text-sm mr-1 sm:mr-2">
                      {course.originalPrice[isRTL ? "ar" : "en"]}
                    </span>
                    {course.isFree && (
                      <span className="text-primary font-medium text-xs sm:text-sm">
                        {isRTL
                          ? "المراجعة مجاناً مع الكورس"
                          : "Free with course"}
                      </span>
                    )}
                  </div>
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                  >
                    {isRTL ? "عرض المزيد" : "View More"}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <motion.button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1 sm:p-2 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "rotate-180" : ""}`}
            />
          </motion.button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-medium text-sm sm:text-base transition-colors ${
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
            className="p-1 sm:p-2 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "rotate-180" : ""}`}
            />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
export default ReviewCoursesSection;
