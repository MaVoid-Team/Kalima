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
            <h2 className="text-xs sm:text-xs md:text-xs font-bold text-primary mb-3">
              {isRTL ? "التحضير للأمتحان" : "Exam Preparation"}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-1 bg-gradient-to-r from-primary to-secondary mt-2 mx-auto w-40"
                style={{ originX: isRTL ? 1 : 0 }}
              />
            </h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl sm:text-xl text-base-content/80"
            >
              {isRTL ? "التحضير للأمتحان السنوى" : "Annual Exam Preparation"}
            </motion.p>
          </motion.div>
      
          {/* Two Cards in One Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-xl overflow-hidden shadow-xl h-64 sm:h-80"
            >
              <img 
                src="https://images.unsplash.com/photo-1581726690015-c9861fa5057f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt={isRTL ? "طلاب يدرسون" : "Students studying"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              
              <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-8 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {isRTL ? "الضم إلى دوراتنا التدريبية" : "Join Our Training Courses"}
                </h3>
                <p className="text-white/90 mb-4 text-lg sm:text-xl">
                  {isRTL ? "وطور مهاراتك" : "And develop your skills"}
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary btn-lg"
                  >
                    {isRTL ? "الضم الآن" : "Join Now"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
      
            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative rounded-xl overflow-hidden shadow-xl h-64 sm:h-80"
            >
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt={isRTL ? "فصل دراسي" : "Classroom"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              
              <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-8 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {isRTL ? "الضم إلى دوراتنا التدريبية" : "Join Our Training Courses"}
                </h3>
                <p className="text-white/90 mb-4 text-lg sm:text-xl">
                  {isRTL ? "وطور مهاراتك" : "And develop your skills"}
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary btn-lg"
                  >
                    {isRTL ? "الضم الآن" : "Join Now"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
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
