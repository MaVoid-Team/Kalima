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
import { ChevronLeft, Loader } from "lucide-react"
import {  AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { CourseCard } from "./../components/CourseCard"
import { getAllSubjects } from "./../routes/courses"
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
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: 2,
      name: isRTL ? "أحمد السيد" : "Ahmed Al-Sayed",
      role: isRTL ? "طالب، الصف الثاني الثانوي" : "11th Grade Student",
      content: isRTL 
        ? "المنصة تقدم محتوى تعليمي مفيد جداً، والدروس يتم شرحها بأسلوب واضح وسهل. أعجبني التنوع في المواد التعليمية المتاحة، ولكن أتمنى أن يتم إضافة المزيد من التمارين العملية."
        : "Kalima's clear explanations transformed how I understand difficult concepts. While the content variety is impressive, I'd love to see more practical exercises to reinforce learning.",
      image: "/student2.jpg",
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: 3,
      name: isRTL ? "أسيل صفوان" : "Aseel Safwan",
      role: isRTL ? "طالبة، الصف الأول الثانوي" : "10th Grade Student",
      content: isRTL 
        ? "أحببت التعلم عبر كلمة! الفيديوهات ذات جودة عالية، والمحتوى غني بالمعلومات القيمة. أكثر شيء أعجبني هو إمكانية تحميل الملخصات والمواد الإضافية."
        : "Learning with Kalima has been transformative! The premium video quality and downloadable resources helped me excel in subjects I previously struggled with.",
      image: "/student3.jpg",
      color: "from-amber-500 to-orange-600"
    }
  ];

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const springConfig = {
    type: "spring",
    damping: 30,
    stiffness: 300,
    mass: 0.5
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
    maleStudent:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    femaleStudent:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
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
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
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
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
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
                    <span className="text-primary">مرحبا بك في </span>
                    منصة كلمـــــة
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

                <p className="text-lg text-base-content/80 leading-relaxed text-right">
                  {isRTL
                    ? "منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي."
                    : "Kalima Platform is an e-learning platform that provides resources for students from 4th grade through 12th grade."}
                </p>

                <div className="relative">
                  {/* Features List - Position changes based on RTL */}
                  <div
                    className={`space-y-4 relative z-10 ${
                      isRTL ? "pr-12" : "pl-12"
                    }`}
                  >
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-primary text-xl bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                          {feature.icon}
                        </div>
                        <span className="text-base-content font-medium">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Professional Curved Arrow - Always points to features */}
                  <motion.svg
                    whileHover={{ scale: 1.05 }}
                    width="160"
                    height="80"
                    viewBox="0 0 160 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`absolute ${
                      isRTL ? "left-0" : "right-0"
                    } -bottom-6 text-primary z-0`}
                    style={{ transform: isRTL ? "scaleX(-1)" : "scaleX(1)" }}
                  >
                    <defs>
                      <linearGradient
                        id="arrowGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="100%"
                          stopColor="currentColor"
                          stopOpacity="1"
                        />
                      </linearGradient>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <path d="M0 0L10 3.5L0 7Z" fill="currentColor" />
                      </marker>
                    </defs>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      d="M10 70C40 40 80 20 140 20"
                      stroke="url(#arrowGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrowhead)"
                      fill="none"
                    />
                    <path
                      d="M10 70C40 40 80 20 140 20"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeOpacity="0.1"
                      fill="none"
                    />
                  </motion.svg>
                </div>
              </div>

              {/* Image Stack - Right Side */}
              <div
                className="w-full lg:w-1/2 relative"
                style={{ height: "clamp(400px, 60vw, 500px)" }}
              >
                {/* Dotted SVG Background */}
                <div className="absolute inset-0 overflow-hidden z-0">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

                {/* Container for precise positioning */}
                <div className="relative h-full w-full z-10">
                  {/* Bottom Image */}
                  <motion.div
                    className="absolute left-4 sm:left-8 bottom-0 h-[80%] w-[55%] sm:w-[50%] rounded-2xl p-2 sm:p-4 z-0"
                    whileHover={{ y: -10 }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                      alt={isRTL ? "طلاب يدرسون" : "Students studying"}
                      className="w-full h-full object-cover rounded-lg shadow-xl border-2 border-secondary/30"
                      loading="lazy"
                    />
                  </motion.div>

                  {/* Top Image */}
                  <motion.div
                    className="absolute right-4 sm:right-8 top-0 h-[80%] w-[55%] sm:w-[50%] rounded-2xl p-2 sm:p-4 z-10"
                    whileHover={{ y: -10 }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                      alt={isRTL ? "طالبة تدرس" : "Student learning"}
                      className="w-full h-full object-cover rounded-lg shadow-xl border-2 border-primary/30"
                      loading="lazy"
                    />
                  </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -left-12 sm:-left-20 -top-12 sm:-top-20 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-primary/10 mix-blend-multiply filter blur-xl z-0" />
                <div className="absolute -right-6 sm:-right-10 bottom-6 sm:bottom-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-secondary/10 mix-blend-multiply filter blur-xl z-0" />
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
          <h2 className="text-xs sm:text-xs md:text-xs font-bold text-primary relative z-10 pb-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl h-72 sm:h-96"
          >
            <img 
              src="https://images.unsplash.com/photo-1591123720164-de1348028a82?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80" 
              alt={isRTL ? "طلاب في محاضرة" : "Students in lecture"}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {isRTL ? "التحضير للامتحانات النهائية" : "Final Exam Preparation"}
                </h3>
                <p className={`text-white/90 mb-6 text-lg ${isRTL ? 'ml-auto' : 'mr-auto'} max-w-[90%]`}>
                  {isRTL 
                    ? "دورات مكثفة مع أفضل المدرسين لتأهيلك للامتحانات" 
                    : "Intensive courses with top teachers to prepare you for exams"}
                </p>
                <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-6 py-3 rounded-lg font-medium text-lg
                      bg-gradient-to-r from-primary to-primary-dark
                      text-white shadow-md
                      border-0
                      flex items-center gap-2
                      transition-all duration-300
                      hover:shadow-lg
                    `}
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
            </div>
          </motion.div>
        
          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl h-72 sm:h-96"
          >
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1631&q=80" 
              alt={isRTL ? "مجموعة دراسة" : "Study group"} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {isRTL ? "دورات تقوية شاملة" : "Comprehensive Training Courses"}
                </h3>
                <p className={`text-white/90 mb-6 text-lg ${isRTL ? 'ml-auto' : 'mr-auto'} max-w-[90%]`}>
                  {isRTL 
                    ? "برامج تدريبية متخصصة لتعزيز مهاراتك الأكاديمية" 
                    : "Specialized training programs to enhance your academic skills"}
                </p>
                <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-6 py-3 rounded-lg font-medium text-lg
                      bg-gradient-to-r from-primary to-primary-dark
                      text-white shadow-md
                      border-0
                      flex items-center gap-2
                      transition-all duration-300
                      hover:shadow-lg
                    `}
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
            </div>
          </motion.div>
        </div>
        </div>
      </div>
      <AllCoursesSections />
      <section className={`relative py-20 px-4 sm:px-6 lg:px-8 bg-base-100`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl sm:text-4xl font-bold text-base-content mb-4`}>
            {isRTL ? "آراء طلابنا" : "Student Testimonials"}
          </h2>
          <motion.div 
            className={`w-24 h-1.5 ${testimonials[activeIndex].accentColor} mx-auto rounded-full`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          />
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <motion.button 
            onClick={prevTestimonial}
            className={`absolute top-1/2 ${isRTL ? 'right-4 sm:right-8' : 'left-4 sm:left-8'} -translate-y-1/2 z-20 p-3 rounded-full bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 group border border-base-300`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-base-content group-hover:text-primary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </motion.button>

          <motion.button 
            onClick={nextTestimonial}
            className={`absolute top-1/2 ${isRTL ? 'left-4 sm:left-8' : 'right-4 sm:right-8'} -translate-y-1/2 z-20 p-3 rounded-full bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 group border border-base-300`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-base-content group-hover:text-primary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </motion.button>

          {/* Testimonials Carousel */}
          <div className="relative h-[500px] sm:h-[550px] overflow-hidden">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                activeIndex === index && (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, x: isRTL ? 150 : -150 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? -150 : 150 }}
                    transition={springConfig}
                    className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 sm:p-8"
                  >
                    {/* Student Image */}
                    <motion.div
                      initial={{ scale: 0.8, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ ...springConfig, delay: 0.2 }}
                      className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-base-100 shadow-xl"
                    >
                      <div className={`absolute inset-0 ${testimonial.accentColor} flex items-center justify-center text-white text-5xl font-bold`}>
                        {testimonial.name.charAt(0)}
                      </div>
                    </motion.div>

                    {/* Testimonial Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.4 }}
                      className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} max-w-2xl`}
                    >
                      <div className={`bg-base-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-base-300 relative overflow-hidden ${isRTL ? 'pr-12' : 'pl-12'}`}>
                        {/* Quote Icon */}
                        <div className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-6 w-12 h-12 rounded-full ${testimonial.accentColor} flex items-center justify-center text-white shadow-md`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>

                        <p className="text-base-content/80 text-lg sm:text-xl mb-8 leading-relaxed">
                          {testimonial.content}
                        </p>

                        <div>
                          <h4 className="font-bold text-base-content text-xl">{testimonial.name}</h4>
                          <p className="text-base-content/60">{testimonial.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`relative w-3 h-3 rounded-full transition-all ${activeIndex === index ? 'bg-primary' : 'bg-base-300'}`}
              >
                {activeIndex === index && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute inset-0 rounded-full bg-current"
                    transition={springConfig}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
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



export function AllCoursesSections() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';
  const [languages, setLanguages] = useState([])
  const [scientific, setScientific] = useState([])
  const [literary, setLiterary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  // Fake data for courses
  const fakeCourses = {
    languages: [
      {
        id: 1,
        image: "/course-1.png",
        title: "اللغة الإنجليزية",
        subject: "لغة إنجليزية",
        teacher: "أستاذ محمد",
        grade: "الصف الثالث الثانوي",
        rating: 5,
        duration: 12,
      },
      {
        id: 2,
        image: "/course-2.png",
        title: "اللغة الفرنسية",
        subject: "لغة فرنسية",
        teacher: "أستاذ أحمد",
        grade: "الصف الثاني الثانوي",
        rating: 5,
        duration: 10,
      },
    ],
    scientific: [
      {
        id: 3,
        image: "/course-3.png",
        title: "كيمياء عامة",
        subject: "كيمياء",
        teacher: "أستاذة سارة",
        grade: "الصف الأول الثانوي",
        rating: 5,
        duration: 15,
      },
      {
        id: 4,
        image: "/course-4.png",
        title: "أساسيات الفيزياء",
        subject: "فيزياء",
        teacher: "أستاذ علي",
        grade: "الصف الثاني الثانوي",
        rating: 4.5,
        duration: 18,
      },
    ],
    literary: [
      {
        id: 5,
        image: "/course-5.png",
        title: "الأدب العربي",
        subject: "لغة عربية",
        teacher: "أستاذة منى",
        grade: "الصف الثالث الثانوي",
        rating: 4,
        duration: 14,
      },
      {
        id: 6,
        image: "/course-6.png",
        title: "التاريخ الإسلامي",
        subject: "تاريخ",
        teacher: "أستاذ خالد",
        grade: "الصف الأول الثانوي",
        rating: 4.5,
        duration: 12,
      },
    ]
  }

  // Fetch courses from the API
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllSubjects()
      if (result.success && result.data?.data?.subjects?.length > 0) {
        const subjectsData = result.data.data.subjects
        
        // Filter subjects into categories (in a real app, you'd have proper categorization)
        setLanguages(fakeCourses.languages)
        setScientific(fakeCourses.scientific)
        setLiterary(fakeCourses.literary)
      } else {
        // Use fake data if API fails
        setLanguages(fakeCourses.languages)
        setScientific(fakeCourses.scientific)
        setLiterary(fakeCourses.literary)
      }
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(t('courses.errors.failed'))
      // Fallback to fake data
      setLanguages(fakeCourses.languages)
      setScientific(fakeCourses.scientific)
      setLiterary(fakeCourses.literary)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const fetchSubjectDetails = async (subjectId) => {
    console.log("Fetching subject details for:", subjectId)
  }

  const renderCourseSection = (title, courses, viewAllLink) => {
    return (
      <div className="mb-16">
        <h3 className="text-center text-2xl font-bold mb-8">
          {title}
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className={isRTL ? 'mr-2' : 'ml-2'}>
              {t('courses.errors.loading')}
            </span>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchCourses}>
              {t('courses.errors.retry')}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link to={`/courses/${course.id}`}>
                      <CourseCard
                        id={course.id}
                        image={course.image}
                        teacherName={course.teacher}
                        subject={course.subject}
                        subjectId={course.id}
                        level={course.grade}
                        duration={course.duration}
                        rating={course.rating}
                        fetchSubjectDetails={fetchSubjectDetails}
                      />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8">
              <Link to={viewAllLink}>
                <button className="btn btn-primary rounded-full">
                  {t('courses.viewAll')}
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2 rotate-180'}`} />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <section className="md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">
          {t('courses.title')}
        </h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          {t('courses.heading')} 
          <span className="text-primary border-b-2 border-primary pb-1">
            {t('courses.platform')}
          </span>
        </h3>

        {/* Languages Section */}
        {renderCourseSection(
          isRTL ? "تعلم جميع اللغات" : "Learn All Languages",
          languages,
          "/courses/languages"
        )}

        {/* Scientific Subjects Section */}
        {renderCourseSection(
          isRTL ? "المواد العلمية" : "Scientific Subjects",
          scientific,
          "/courses/scientific"
        )}

        {/* Literary Subjects Section */}
        {renderCourseSection(
          isRTL ? "المواد الأدبية" : "Literary Subjects",
          literary,
          "/courses/literary"
        )}
      </div>
    </section>
  )
}