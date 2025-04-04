import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  FaAward,
  FaBookOpen,
  FaCertificate,
  FaChalkboardTeacher,
  FaClock,
  FaGraduationCap,
  FaMedal,
} from "react-icons/fa";
import { AppDownloadSection } from "./Home/app-download-section";
import { ChevronLeft, Loader } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CourseCard } from "./../components/CourseCard";
import { getAllSubjects } from "./../routes/courses";
import { Card } from "react-daisyui";
function Services() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const services = [
    {
      icon: <FaClock className="text-4xl mb-4 text-blue-300" />,
      title: "شاهد في أي وقت في اليوم",
      desc: "اختبارات لتثبيت ما تم قصه",
    },
    {
      icon: <FaGraduationCap className="text-4xl mb-4 text-blue-300" />,
      title: "معلمين على اعلى مستوى",
      desc: "نعشر المنحة اهتماما لما بالحفاظ على دوره الكويسات المقدمة من المعلمين المنعاقدين معهم من أجل مصلحة طلابنا الشراء",
    },
    {
      icon: <FaMedal className="text-4xl mb-4 text-blue-300" />,
      title: "توغير كويسات عالية الجودة",
      desc: "نعشر المنحة اهتماما لما بالحفاظ على دوره الكويسات المقدمة من المعلمين المنعاقدين معهم من أجل مصلحة طلابنا الشراء",
    },
  ];

  const features = [
    {
      icon: <FaChalkboardTeacher />,
      text: isRTL ? "معلمين محترفين" : "Professional Teachers",
    },
    {
      icon: <FaAward />,
      text: isRTL ? "كورسات عالية الجودة" : "High Quality Courses",
    },
    {
      icon: <FaClock />,
      text: isRTL ? "تعلم في أي وقت" : "Learn Anytime",
    },
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: isRTL ? "سارة علي" : "Sarah Ali",
      role: isRTL ? "طالبة، الصف الثالث الثانوي" : "12th Grade Student",
      content: isRTL
        ? "تجربة التعلم على منصة كلمة كانت رائعة بكل المقاييس! أحببت طريقة تنظيم المحتوى حيث يتم تقديم المعلومات بشكل تدريجي وسلس، مما يجعل التعلم ممتعاً ويسهل الفهم. أيضاً نظام متابعة التقدم رائع جداً."
        : "The learning experience on Kalima was exceptional! I loved the gradual content delivery that made complex topics approachable. The progress tracking system helped me stay motivated throughout my journey.",
      image: "/student1.jpg",
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: 2,
      name: isRTL ? "أحمد السيد" : "Ahmed Al-Sayed",
      role: isRTL ? "طالب، الصف الثاني الثانوي" : "11th Grade Student",
      content: isRTL
        ? "المنصة تقدم محتوى تعليمي مفيد جداً، والدروس يتم شرحها بأسلوب واضح وسهل. أعجبني التنوع في المواد التعليمية المتاحة، ولكن أتمنى أن يتم إضافة المزيد من التمارين العملية."
        : "Kalima's clear explanations transformed how I understand difficult concepts. While the content variety is impressive, I'd love to see more practical exercises to reinforce learning.",
      image: "/student2.jpg",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: 3,
      name: isRTL ? "أسيل صفوان" : "Aseel Safwan",
      role: isRTL ? "طالبة، الصف الأول الثانوي" : "10th Grade Student",
      content: isRTL
        ? "أحببت التعلم عبر كلمة! الفيديوهات ذات جودة عالية، والمحتوى غني بالمعلومات القيمة. أكثر شيء أعجبني هو إمكانية تحميل الملخصات والمواد الإضافية."
        : "Learning with Kalima has been transformative! The premium video quality and downloadable resources helped me excel in subjects I previously struggled with.",
      image: "/student3.jpg",
      color: "from-amber-500 to-orange-600",
    },
  ];

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300,
    mass: 0.5,
  };

  const fadeIn = (direction, type, delay, duration) => ({
    hidden: {
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: type || "spring",
        delay: delay || 0,
        duration: duration || 1,
        ease: "easeOut",
      },
    },
  });

  const images = {
    maleStudent: "/servicesherosection2",
    femaleStudent: "/servicesherosection1",
    decorativeCircle:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlYmY0ZmYiIHN0cm9rZT0iI2Q0ZTVmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
  };

  const benefits = [
    {
      id: 1,
      number: "03",
      title: isRTL ? "الدعم" : "Support",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "مطاهدة" : "Monitoring",
      content: isRTL
        ? "معلم دقيقة حكومة مستقيمات مبلغهم، أن يحدثه للانخفض بالتعديل الأول أو الثلاثين لجهاز إحدى إبراهيمها على هذه الحصول."
        : "Professional minute government straightens their amount, that it happens to decrease by the first or thirtieth amendment to one of their devices to get this.",
    },
    {
      id: 2,
      number: "02",
      title: isRTL ? "العنف الشخصي" : "Personal Violence",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "شهدت" : "Witnessed",
      content: isRTL
        ? "منطقة عملية وسياحة جملة التخصصة المتاحية (1/2, 3/4) ومؤشرات الإطلاقين عن حكمها والتعليمات، ويرسيك البيانات المحلية في الموضوعات البيانية."
        : "Operational area and tourism total available specialties (1/2, 3/4) and indicators of the two launches about its ruling and instructions, and local data in graphic subjects.",
    },
    {
      id: 3,
      number: "05",
      title: isRTL ? "الإنشئيات" : "Facilities",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "من بين" : "Among",
      content: isRTL
        ? "مستوى استخدامها، ومساعدة فئة الموظفية أمة."
        : "Level of use, and helping the employee category nation.",
    },
    {
      id: 4,
      number: "01",
      title: isRTL ? "المحاصون" : "Harvesters",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "تحديد" : "Identification",
      content: isRTL
        ? "مستعمل من أصحاب رئيس الطفل العاملية هو تحليل القوة تحت الاسم، وتختلف ذلك السياسة وتتفعيل كما هي اجتماعية والورق والركاء غير بقدمه من النائب."
        : "Used by the owners of the working child's head is the analysis of power under the name, and that policy differs and is activated as it is social and paper and non-submission by the deputy.",
    },
    {
      id: 5,
      number: "04",
      title: isRTL ? "السلطات" : "Authorities",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "استصفاع" : "Exemption",
      content: isRTL
        ? "توجد قندكم إزالة استصفاع متناولتها بتقديم العلاقة من مدينة صحرية مصممة، مما أخذته"
        : "There is your removal of exemption handled by presenting the relationship from a designed desert city, which took it",
    },
    {
      id: 6,
      number: "06",
      title: isRTL ? "المنطلقات" : "Starting Points",
      prefix: isRTL ? "بـ" : "With",
      subheader: isRTL ? "بداية" : "Beginning",
      content: isRTL
        ? "إذا كان أن يكون المختلفة للنظام من جانبهم، يمكن جميع جميع تجاهز إلى كلية مرتبطة بالتحديد."
        : "If it is to be different to the system from their side, all can gear to a college linked to the specification.",
    },
  ];
  const books = [
    { id: 1, title: "العلم جميع اللغات", image: "/Book.png" },
    { id: 2, title: "اللغة العربية", image: "/Book-1.png" },
    { id: 3, title: "اللغة الإنجليزية", image: "/Book-2.png" },
    { id: 4, title: "اللغة الفرنسية", image: "/Book-3.png" },
    { id: 5, title: "اللغة الألمانية", image: "/Book-4.png" },
    { id: 6, title: "اللغة الإسبانية", image: "/Book-5.png" },
    { id: 7, title: "اللغة الصينية", image: "/Book-2.png" },
  ];
  const books1 = [
    { id: 1, title: "العلم جميع اللغات", image: "/Book-6.png" },
    { id: 2, title: "اللغة العربية", image: "/Book-7.png" },
    { id: 3, title: "اللغة الإنجليزية", image: "/Book-8.png" },
    { id: 4, title: "اللغة الفرنسية", image: "/Book-9.png" },
    { id: 5, title: "اللغة الألمانية", image: "/Book-10.png" },
    { id: 6, title: "اللغة الإسبانية", image: "/Book-11.png" },
    { id: 7, title: "اللغة الصينية", image: "/Book-12.png" },
  ];
  const books2 = [
    { id: 1, title: "العلم جميع اللغات", image: "/Book-13.png" },
    { id: 2, title: "اللغة العربية", image: "/Book-14.png" },
    { id: 3, title: "اللغة الإنجليزية", image: "/Book-15.png" },
    { id: 4, title: "اللغة الفرنسية", image: "/Book-16.png" },
    { id: 5, title: "اللغة الألمانية", image: "/Book-17.png" },
    { id: 6, title: "اللغة الإسبانية", image: "/Book-18.png" },
    { id: 7, title: "اللغة الصينية", image: "/Book-19.png" },
  ];

  return (
    <motion.section
      variants={staggerContainer()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className="bg-gradient-to-b from-base-100 to-base-200 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div
          className={`flex flex-col lg:flex-row items-center gap-8 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Visual Elements (Left Side) */}
          <motion.div
            variants={fadeIn(isRTL ? "left" : "right", "tween", 0.2, 1)}
            className="w-full lg:w-1/2 relative"
            style={{ height: "clamp(350px, 55vw, 500px)" }}
          >
            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-primary/10 mix-blend-multiply filter blur-xl opacity-70"
            />

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-secondary/10 mix-blend-multiply filter blur-xl opacity-70"
            />

            {/* Character illustrations */}
            <div className="relative h-full w-full z-10">
              {/* Bottom Image (Male Student) */}
              <motion.div
                className="absolute left-8 sm:left-12 md:left-16 bottom-0 h-[70%] sm:h-[75%] md:h-[80%] w-[45%] sm:w-[40%] md:w-[35%] rounded-t-full rounded-b-full p-2 sm:p-3 md:p-4 z-0"
                whileHover={{ y: -10 }}
              >
                <img
                  src={
                    images.maleStudent ||
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  }
                  alt={isRTL ? "طالب" : "Male student"}
                  className="w-full h-full object-cover rounded-t-full rounded-b-full shadow-lg md:shadow-xl border-2 border-secondary/30"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "servicesherosection2.png";
                  }}
                />
              </motion.div>

              {/* Top Image (Female Student) */}
              <motion.div
                className="absolute right-8 sm:right-12 md:right-16 bottom-8 sm:bottom-12 md:bottom-16 h-[85%] sm:h-[90%] md:h-[100%] w-[55%] sm:w-[50%] md:w-[45%] rounded-t-full rounded-b-full p-2 sm:p-3 md:p-4 z-10"
                whileHover={{ y: -10 }}
              >
                <img
                  src={
                    images.femaleStudent ||
                    "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  }
                  alt={isRTL ? "طالبة" : "Female student"}
                  className="w-full h-full object-cover rounded-t-full rounded-b-full shadow-lg md:shadow-xl border-2 border-primary/30"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "servicesherosection1.png";
                  }}
                />
                {/* Kalima text label */}
                <motion.div
                  className="absolute -top-5 sm:-top-6 md:-top-7 left-1/2 -translate-x-1/2 text-lg sm:text-xl md:text-2xl font-bold text-primary whitespace-nowrap"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                >
                  {isRTL ? "كلمة" : "Kalima"}
                </motion.div>
              </motion.div>
            </div>

            {/* Additional decorative elements */}
            <div className="absolute -left-12 sm:-left-16 md:-left-20 -top-12 sm:-top-16 md:-top-20 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 rounded-full bg-primary/10 mix-blend-multiply filter blur-xl opacity-70 z-0" />
            <div className="absolute -right-6 sm:-right-8 md:-right-10 bottom-6 sm:bottom-8 md:bottom-10 w-32 sm:w-36 md:w-40 h-32 sm:h-36 md:h-40 rounded-full bg-secondary/10 mix-blend-multiply filter blur-xl opacity-70 z-0" />

            {/* Small decorative circles */}
            <motion.div
              className="absolute top-6 sm:top-8 md:top-10 left-6 sm:left-8 md:left-10 w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full bg-accent"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-12 sm:bottom-16 md:bottom-20 right-12 sm:right-16 md:right-20 w-5 sm:w-6 md:w-6 h-5 sm:h-6 md:h-6 rounded-full bg-error"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>

          {/* Text Content (Right Side) */}
          <motion.div
            variants={fadeIn(isRTL ? "right" : "left", "tween", 0.2, 1)}
            className="w-full lg:w-1/2 space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0"
          >
            {/* Title with animated SVG underline */}
            <div className="relative">
              <motion.h1
                initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-base-content leading-tight ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL ? (
                  <>
                    <span className="text-base-content">مرحبا بك في منصة</span>
                    <span className="text-primary relative inline-block">
                    كلمـــــة
                        <svg
                          className="absolute -bottom-3 left-0 w-full"
                          width="140"
                          height="16"
                          viewBox="0 0 140 16"
                          fill="none"
                        >
                          <path
                            d="M0 8C20 16 40 0 60 8C80 16 100 0 120 8C140 16 140 0 140 8"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    
                  </>
                ) : (
                  <>
                    <span className="text-primary">Welcome to </span>
                    Kalima Platform
                  </>
                )}
              </motion.h1>
            </div>

            {/* Subtitle with decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`relative ${isRTL ? "text-right" : "text-left"}`}
            >
              <motion.p className="text-lg sm:text-xl md:text-2xl text-base-content/80 leading-relaxed mb-6">
                {isRTL
                  ? "منصة كلمة هي منصة تعليم الكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي."
                  : "Kalima Platform is an e-learning platform providing resources for students from 4th grade through 12th grade."}
              </motion.p>

              {/* Decorative line */}
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`flex flex-wrap gap-4 ${
                isRTL ? "justify-start" : "justify-end"
              }`}
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(var(--p), 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-md gap-2"
              >
                {isRTL ? "تسجيل الدخول" : "Sign In"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isRTL ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  )}
                </svg>
              </motion.button>
            </motion.div>

            {/* Animated decorative elements */}
            <motion.div
              className="absolute -bottom-8 -left-8 w-24 h-24 opacity-10 text-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-base-content"
          >
            {isRTL
              ? "فوائد الانضمام إلى منصة كلمة"
              : "Benefits of Joining Kalima Platform"}
          </motion.h2>

          {/* First Row (03, 02, 05) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[benefits[0], benefits[1], benefits[2]].map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                    {benefit.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-base-content">
                      {benefit.title}
                    </h3>
                    <p className="text-base-content/70">
                      {benefit.prefix} {benefit.subheader}
                    </p>
                  </div>
                </div>
                <p className="text-base-content/80 text-sm">
                  {benefit.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Second Row (01, 04, 06) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[benefits[3], benefits[4], benefits[5]].map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                    {benefit.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-base-content">
                      {benefit.title}
                    </h3>
                    <p className="text-base-content/70">
                      {benefit.prefix} {benefit.subheader}
                    </p>
                  </div>
                </div>
                <p className="text-base-content/80 text-sm">
                  {benefit.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        <section className="bg-gradient-to-b from-base-100 to-base-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                isRTL ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Content - Left Side */}
              <div className="w-full lg:w-1/2 space-y-6">
  <h3 className="text-xl font-bold text-primary">
    {isRTL ? "معلومات عنا" : "About Us"}
  </h3>

  <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content leading-tight">
    {isRTL ? (
      <>
        تعلم وجيب الدرجات النهائية{" "}
        <span className="text-primary relative inline-block">
          معانا
          <svg
            className="absolute -bottom-3 left-0 w-full"
            width="140"
            height="16"
            viewBox="0 0 140 16"
            fill="none"
          >
            <path
              d="M0 8C20 16 40 0 60 8C80 16 100 0 120 8C140 16 140 0 140 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </>
    ) : (
      <>
        Learn and achieve final grades{" "}
        <span className="text-primary relative inline-block">
          with us
          <svg
            className="absolute -bottom-3 left-0 w-full"
            width="140"
            height="16"
            viewBox="0 0 140 16"
            fill="none"
          >
            <path
              d="M0 8C20 16 40 0 60 8C80 16 100 0 120 8C140 16 140 0 140 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </>
    )}
  </h2>

  <p className={`text-lg text-base-content/80 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
    {isRTL
      ? "منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي."
      : "Kalima Platform is an e-learning platform that provides resources for students from 4th grade through 12th grade."}
  </p>

  <div className="relative">
    {/* Features List with Arrow Images */}
    <div className="flex flex-col gap-4 relative z-10">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-4">
          {/* Feature Icon */}
          <div className="text-primary text-xl bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
            {feature.icon}
          </div>
          
          {/* Feature Text */}
          <span className="text-base-content font-medium flex-1">
            {feature.text}
          </span>
          
          {/* Arrow Image - Shows only for the first feature */}
          {index === 0 && (
            <div className={`hidden   sm:block ${isRTL ? "mr-4" : "ml-4"}`}>
              <img
                src={isRTL ? "/curved-arrow-about.png" : "/curved-arrow-services.png"}
                alt=""
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>

              {/* Image Stack - Right Side */}
             <div 
  className="w-full lg:w-1/2 relative"
  style={{ height: "clamp(400px, 60vw, 500px)" }}
>
  {/* Dotted SVG Background (same as babbles) */}
  <div className="absolute inset-0 overflow-hidden z-0">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <pattern
        id="dotsPattern"
        x="0"
        y="0"
        width="25"
        height="25"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(0)"
      >
        <circle
          cx="2.5"
          cy="2.5"
          r="1.5"
          fill="currentColor"
          className="text-primary/20"
        />
      </pattern>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#dotsPattern)"
      />
    </svg>
  </div>

  {/* Single Centered Image */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 z-10"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="relative w-full h-full max-w-[500px]">
      <img
        src="/education-image-services.png" // Your single image path
        alt={isRTL ? "طلاب يدرسون" : "Students learning"}
        className="w-full h-full object-contain rounded-xl "
        loading="lazy"
      />
      
      {/* Decorative glow effect */}
      <div className="absolute -inset-4 rounded-xl bg-primary/10 mix-blend-multiply filter blur-xl z-0" />
    </div>
  </motion.div>

  {/* Decorative elements matching babbles */}
  <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-primary/10 mix-blend-multiply filter blur-xl z-0" />
  <div className="absolute -right-6 bottom-6 w-32 h-32 rounded-full bg-secondary/10 mix-blend-multiply filter blur-xl z-0" />
</div>
            </div>
          </div>
        </section>
        <AppDownloadSection />
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 relative"
            >
              {/* Main Title with Decorative Elements */}
              <div className="relative inline-block">
                <h2 className="text-4xl sm:text-5xl font-bold text-primary relative z-10 pb-2">
                  {isRTL ? "خدماتنا" : "Our Services"}
                  {/* Underline decoration - works for both languages */}
                  <svg
                    className="absolute bottom-0 left-0 w-full h-2 text-primary"
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={
                        isRTL
                          ? "M0,5 C50,0 150,10 200,5"
                          : "M0,5 C50,10 150,0 200,5"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </h2>

                {/* Decorative circles - same for both languages */}
                <motion.div
                  className="absolute -top-3 -right-4 w-4 h-4 rounded-full bg-secondary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-3 w-3 h-3 rounded-full bg-accent"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
              </div>

              {/* Subtitle with animated dots */}
              <motion.p
                className={`mt-6 text-xl sm:text-2xl text-base-content/80 max-w-2xl mx-auto relative ${
                  isRTL ? "text-right" : "text-left"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {isRTL
                  ? "هدفنا هو تبسيط المعلومة لضمان تفوقك الدراسي"
                  : "Our goal is to simplify information to ensure your academic excellence"}
                <span
                  className={`inline-flex items-center ${
                    isRTL ? "mr-2" : "ml-2"
                  }`}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 mx-0.5 rounded-full bg-primary"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </span>
              </motion.p>

              {/* Decorative SVG elements */}
              <div className="absolute -top-8 left-1/4 opacity-20 text-primary w-24 h-24 -z-10">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="25" cy="25" r="20" />
                  <circle cx="75" cy="75" r="15" />
                </svg>
              </div>
              <div className="absolute -bottom-10 right-1/4 opacity-20 text-secondary w-20 h-20 -z-10">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <rect x="20" y="20" width="60" height="60" rx="10" />
                </svg>
              </div>
            </motion.div>
            {/* Services Grid */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/10 py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Services Grid - 4 columns */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${
                    isRTL ? "rtl" : "ltr"
                  }`}
                >
                  {/* Service 1 - High Quality Courses */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      borderColor: "var(--p)",
                    }}
                    className="bg-base-100 rounded-2xl shadow-sm overflow-hidden border-2 border-base-200 relative"
                  >
                    <div className="p-6 flex flex-col items-center text-center h-full">
                      <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-primary/10 text-primary relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-base-content mb-3">
                        {isRTL ? "كورسات عالية الجودة" : "High Quality Courses"}
                      </h3>
                      <p className="text-base-content/70 mb-4">
                        {isRTL
                          ? "نضمن جودة الكورسات المقدمة من المعلمين المتعاقدين معنا"
                          : "We ensure the quality of courses provided by our contracted teachers"}
                      </p>
                      <div className="mt-auto w-full">
                        <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-80"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 2 - Tests */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      borderColor: "var(--s)",
                    }}
                    className="bg-base-100 rounded-2xl shadow-sm overflow-hidden border-2 border-base-200 relative"
                  >
                    <div className="p-6 flex flex-col items-center text-center h-full">
                      <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-secondary/10 text-secondary relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-base-content mb-3">
                        {isRTL ? "اختبارات التثبيت" : "Assessment Tests"}
                      </h3>
                      <p className="text-base-content/70 mb-4">
                        {isRTL
                          ? "اختبارات دورية لتثبيت المعلومات وفهم المستوى"
                          : "Periodic tests to reinforce learning and measure progress"}
                      </p>
                      <div className="mt-auto w-full">
                        <div className="h-1 bg-gradient-to-r from-secondary to-accent rounded-full opacity-80"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 3 - Qualified Teachers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      borderColor: "var(--a)",
                    }}
                    className="bg-base-100 rounded-2xl shadow-sm overflow-hidden border-2 border-base-200 relative"
                  >
                    <div className="p-6 flex flex-col items-center text-center h-full">
                      <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-accent/10 text-accent relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-base-content mb-3">
                        {isRTL ? "معلمين متميزين" : "Qualified Teachers"}
                      </h3>
                      <p className="text-base-content/70 mb-4">
                        {isRTL
                          ? "نخبة من المعلمين المؤهلين ذوي الخبرة الطويلة"
                          : "Elite qualified teachers with extensive experience"}
                      </p>
                      <div className="mt-auto w-full">
                        <div className="h-1 bg-gradient-to-r from-accent to-primary rounded-full opacity-80"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 4 - Flexible Timing */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      borderColor: "var(--p)",
                    }}
                    className="bg-base-100 rounded-2xl shadow-sm overflow-hidden border-2 border-base-200 relative"
                  >
                    <div className="p-6 flex flex-col items-center text-center h-full">
                      <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-primary/10 text-primary relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-base-content mb-3">
                        {isRTL ? "مرونة في الوقت" : "Flexible Timing"}
                      </h3>
                      <p className="text-base-content/70 mb-4">
                        {isRTL
                          ? "شاهد الدروس في أي وقت يناسبك مع إمكانية التكرار"
                          : "Watch lessons anytime with replay options"}
                      </p>
                      <div className="mt-auto w-full">
                        <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-80"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 rounded-xl">
          <div className="max-w-7xl mx-auto">
            {/* Animated Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative text-center mb-8 sm:mb-12"
            >
              <div className="relative inline-block">
                <h2 className="text-sm sm:text-sm md:text-sm font-bold text-primary relative z-10 pb-2">
                  {isRTL ? "التحضير للأمتحان" : "Exam Preparation"}
                  {/* Underline decoration - works for both languages */}
                  <svg
                    className="absolute bottom-0 left-0 w-full h-2 text-primary"
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={
                        isRTL
                          ? "M0,5 C50,0 150,10 200,5"
                          : "M0,5 C50,10 150,0 200,5"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </h2>

                {/* Decorative circles - same for both languages */}
                <motion.div
                  className="absolute -top-3 -right-4 w-3 h-3 rounded-full bg-secondary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-3 w-2 h-2 rounded-full bg-accent"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Two Cards in One Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Card 1 - Primary */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`relative rounded-2xl overflow-hidden shadow-xl h-72 sm:h-96 ${
                isRTL ? "bg-secondary" : "bg-primary"
              }`}
            >
              <div className={`flex h-full ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                {/* Content */}
                <div className={`flex-1 flex flex-col justify-center p-6 sm:p-8 ${
                  isRTL ? "text-right" : "text-left"
                }`}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    {isRTL ? "التحضير للامتحانات النهائية" : "Final Exam Preparation"}
                  </h3>
                  <p className="text-white/90 mb-6 text-base sm:text-lg max-w-[90%]">
                    {isRTL
                      ? "دورات مكثفة مع أفضل المدرسين لتأهيلك للامتحانات"
                      : "Intensive courses with top teachers to prepare you for exams"}
                  </p>
                  <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium text-white bg-black/20 hover:bg-black/30 border border-white/20 flex items-center gap-2 transition-all"
                    >
                      {isRTL ? (
                        <>
                          <span>سجل الآن</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span>Register Now</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
          
                {/* Image */}
                <div className="flex-1 relative hidden sm:block">
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    src="/education-card1.png"
                    alt={isRTL ? "طلاب في محاضرة" : "Students in lecture"}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </motion.div>
          
            {/* Card 2 - Secondary */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={`relative rounded-2xl overflow-hidden shadow-xl h-72 sm:h-96 ${
                isRTL ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div className={`flex h-full ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                {/* Content */}
                <div className={`flex-1 flex flex-col justify-center p-6 sm:p-8 ${
                  isRTL ? "text-right" : "text-left"
                }`}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    {isRTL ? "دورات تقوية شاملة" : "Comprehensive Training Courses"}
                  </h3>
                  <p className="text-white/90 mb-6 text-base sm:text-lg max-w-[90%]">
                    {isRTL
                      ? "برامج تدريبية متخصصة لتعزيز مهاراتك الأكاديمية"
                      : "Specialized training programs to enhance your academic skills"}
                  </p>
                  <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium text-white bg-black/20 hover:bg-black/30 border border-white/20 flex items-center gap-2 transition-all"
                    >
                      {isRTL ? (
                        <>
                          <span>سجل الآن</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span>Register Now</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
          
                {/* Image */}
                <div className="flex-1 relative hidden sm:block">
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    src="/education-card2.png"
                    alt={isRTL ? "مجموعة دراسة" : "Study group"}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </motion.div>
          </div>
          </div>
        </div>
       <CoursesSection isRTL={isRTL} />
        <LanguageBooks books={books1} isRTL={isRTL} />
        <LanguageBooks books={books} isRTL={isRTL}/>
        <LanguageBooks books={books2} isRTL={isRTL}/>
        <TestimonialsSection isRTL={isRTL} />
      </div>
    </motion.section>
  );
}

export default Services;

// Motion utility functions
const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

const fadeIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: type || "spring",
      delay: delay || 0,
      duration: duration || 1,
      ease: "easeOut",
    },
  },
});


export function LanguageBooks({
  books = {},
  content = {
    en: {
      title: "Learn All Languages",
      subtitle: "Through our platform",
      buttonText: "View Details"
    },
    ar: {
      title: "تعلم جميع اللغات",
      subtitle: "من خلال منصتنا",
      buttonText: "عرض التفاصيل"
    }
  },
  rating = 4
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const langContent = content[i18n.language] || content.en;

  return (
    <div className="py-8 px-4 sm:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {/* Single Horizontal Row */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {/* Books */}
          {books.map((book) => (
            <motion.div
              key={book.id}
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: book.id * 0.1 }}
              whileHover={{
                y: -10,
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
            >
              <div className="relative w-[70px] sm:w-[90px]">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-auto rounded-sm"
                />
              </div>
            </motion.div>
          ))}

          {/* Card */}
          <motion.div
            className="flex-shrink-0 h-[50%] w-[280px] sm:w-[320px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <LanguageCourseCard
              isRTL={isRTL}
              title={langContent.title}
              subtitle={langContent.subtitle}
              rating={rating}
              buttonText={langContent.buttonText}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const LanguageCourseCard = ({
  isRTL = false,
  title,
  subtitle,
  rating = 0,
  imageUrl = "/languagedetails.png",
  buttonText = "View Details",
}) => {
  // Calculate star rating (0-5)
  const stars = Array(5)
    .fill(0)
    .map((_, i) => i < rating);

  return (
    <div
      className={`card card-side bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-3xl ${
        isRTL ? "flex-row-reverse" : ""
      }`}
    >
      <figure className="w-1/3 sm:w-2/5 relative">
        <img
          src={imageUrl}
          alt="Language Course"
          className="w-full h-full object-cover"
        />
      </figure>

      <div className="card-body w-2/3 sm:w-3/5 p-4 sm:p-6">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h2 className="card-title text-lg sm:text-xl font-bold text-primary">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-base-content/80 mt-1">
            {subtitle}
          </p>

          <div className="rating rating-xs sm:rating-sm mt-2">
            {stars.map((filled, index) => (
              <input
                key={index}
                type="radio"
                name="rating"
                className={`mask mask-star-2 ${
                  filled ? "bg-yellow-400" : "bg-gray-300"
                }`}
                checked={filled}
                readOnly
              />
            ))}
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className={`btn btn-primary btn-xs sm:btn-sm ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {buttonText}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  isRTL ? "mr-1 sm:mr-2" : "ml-1 sm:ml-2"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isRTL
                      ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                      : "M14 5l7 7m0 0l-7 7m7-7H3"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const TestimonialsSection = ({ isRTL = false }) => {
  // Testimonial data in both languages
  const testimonials = {
    en: [
      {
        text: "The learning experience on Kelma platform was excellent by all standards! I loved how the content was organized, presented gradually and smoothly, making learning enjoyable and easy to understand. The progress tracking system is also great.",
        name: "Sarah Ali",
        role: "Student",
        rating: 5,
        image: "/servicesherosection2.png"
      },
      {
        text: "The platform offers very useful educational content, and lessons are explained in a clear and simple way, making understanding easier. I liked the variety of available materials, but I hope more interactive options will be added.",
        name: "Omar Ahmed",
        role: "Teacher",
        rating: 4,
        image: "/servicesherosection2.png"
      },
      {
        text: "I loved learning through Kelma! The videos are of high quality, and the instructors are knowledgeable with valuable information that helps develop skills effectively. What I liked most was the ability to download needed documents.",
        name: "Aseel Safwan",
        role: "Designer",
        rating: 5,
        image: "/servicesherosection2.png"
      },
      {
        text: "The platform provides a unique learning experience with comprehensive content and excellent instructors. The interface is user-friendly and the community features are very helpful.",
        name: "Mohammed Khalid",
        role: "Developer",
        rating: 4,
        image: "/servicesherosection2.png"
      }
    ],
    ar: [
      {
        text: "تجربة التعلم على منصة كلمة كانت رائعة بكل المقاييس! أحبيت طريقة تنظيم المحتوى حيث يتم تقديم المعلومات بشكل تدريجي وسلس، مما يجعل التعلم ممتعاً ويسهل الفهم. أيضاً نظام متابعة التقدم رائع جداً.",
        name: "سارة علي",
        role: "طالبة",
        rating: 5,
        image: "/servicesherosection2.png"
      },
      {
        text: "المنصة تقدم محتوى تعليمي مفيد جداً، والدروس يتم شرحها بأسلوب واضح وسهل، مما يجعل الفهم أسهل. أعجبني التنوع في المواد التعليمية المتاحة، ولكن آمل أن يتم إضافة المزيد من الخيارات التفاعلية.",
        name: "عمر أحمد",
        role: "مدرس",
        rating: 4,
        image: "/servicesherosection2.png"
      },
      {
        text: "أحبيت التعلم عبر كلمة! الفيديوهات ذات جودة عالية، والمدرسون مليئون بالمعلومات القيمة التي تساعد في تطوير المهارات بشكل فعال. أكثر شيء أعجبني هو إمكانية تحميل المستندات المطلوبة.",
        name: "أصيل صفوان",
        role: "مصممة",
        rating: 5,
        image: "/servicesherosection2.png"
      },
      {
        text: "توفر المنصة تجربة تعلم فريدة مع محتوى شامل ومدرسين ممتازين. الواجهة سهلة الاستخدام وميزات المجتمع مفيدة جداً.",
        name: "محمد خالد",
        role: "مطور",
        rating: 4,
        image: "/servicesherosection2.png"
      }
    ]
  };

  const lang = isRTL ? "ar" : "en";
  const data = testimonials[lang];

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
    <div className="max-w-7xl mx-auto">
      <h2 className={`text-2xl sm:text-3xl font-bold mb-8 ${isRTL ? "text-right" : "text-left"} text-primary`}>
        {isRTL ? "آراء العملاء" : "Customer Testimonials"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((testimonial, index) => (
          <div 
            key={index} 
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
          >
            <div className="card-body p-6 flex flex-col">
              {/* Testimonial Text */}
              <p className={`text-base-content/80 mb-4 ${isRTL ? "text-right" : "text-left"} text-sm sm:text-base`}>
                {testimonial.text}
              </p>
              
              {/* User Info and Rating */}
              <div className="mt-auto">
              <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                  {/* User Image */}
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-gray-300">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* User Name and Role */}
                  <div className={isRTL ? "ml-3 text-right" : "ml-3 text-left"}>
                    <h4 className="font-medium text-base-content">{testimonial.name}</h4>
                    <p className="text-sm text-base-content/60">{testimonial.role}</p>
                  </div>
                </div>
                
                {/* Star Rating */}
                <div className={`mt-3 flex ${isRTL ? "justify-end" : "justify-start"}`}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${i < testimonial.rating ? 
                    "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};


const CoursesSection = ({ 
  isRTL = false,
  imageUrl = "/education-banner.png",
  content = {
    en: {
      title: "Browse All Courses",
      subtitle: "For All Academic Levels"
    },
    ar: {
      title: "تصفح جميع الكورسات",
      subtitle: "لجميع المراحل الدراسية"
    }
  }
}) => {
  // Validate and merge content with defaults
  const langContent = {
    ...(isRTL ? content.ar : content.en),
    ...(isRTL ? {
      title: content.ar?.title || "تصفح جميع الكورسات",
      subtitle: content.ar?.subtitle || "لجميع المراحل الدراسية"
    } : {
      title: content.en?.title || "Browse All Courses",
      subtitle: content.en?.subtitle || "For All Academic Levels"
    })
  };

  return (
    <div className={`py-6 px-4 sm:py-8 sm:px-6 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className={`flex flex-col md:flex-row ${isRTL ? "md:flex-row-reverse" : ""} items-center`}>
            {/* Optimized Image Container */}
            <div className="w-full md:w-2/5 p-4 sm:p-5 flex ">
              <div className="relative w-[200px] sm:w-[240px] md:w-[280px]">
                <img 
                  src={imageUrl}
                  alt={langContent.title}
                  className="w-full h-auto object-contain rounded-md"
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Text Content with Perfect Alignment */}
            <div className={`w-full md:w-3/5 p-4 sm:p-6 ${isRTL ? "md:text-right" : "md:text-left"}`}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {langContent.title}
              </h2>
              <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-300 ${isRTL ? "leading-loose" : ""}`}>
                {langContent.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



