import { useState, useEffect, memo, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import {
  Search,
  Play,
  BookOpen,
  Users,
  ArrowLeft,
  GraduationCap,
  Rocket,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const WelcomeSection = memo(() => {
  const { i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [animationData, setAnimationData] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Load Lottie animation only when section is in view
  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    fetch("/STUDENT.json")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch((err) => console.error("Failed to load Lottie:", err));

    return () => {
      isMounted = false;
    };
  }, [isInView]);

  // Memoized handlers
  const handleSearch = useCallback(() => {
    navigate(`/courses?search=${searchQuery}`);
  }, [navigate, searchQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleNavigateCourses = useCallback(() => {
    navigate("/courses");
  }, [navigate]);

  const handleNavigateTeachers = useCallback(() => {
    navigate("/teachers");
  }, [navigate]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Premium Background */}

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: "transform, opacity" }}
        className="transform-gpu"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] transform-gpu"
        style={{ willChange: "transform, opacity" }}
      />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #AF0D0E 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Illustration Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[45%] flex justify-center relative order-1 lg:order-2 transform-gpu"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square">
              {/* Multi-layer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#AF0D0E]/20 via-[#FF5C28]/15 to-transparent rounded-full blur-[60px]" />
              <div className="absolute inset-10 bg-gradient-to-tl from-[#FF5C28]/10 to-transparent rounded-full blur-[40px]" />

              {/* Animated rings */}
              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-[#AF0D0E]/20 transform-gpu"
                style={{ willChange: "transform" }}
              />
              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute inset-12 rounded-full border border-[#FF5C28]/15 transform-gpu"
                style={{ willChange: "transform" }}
              />

              {/* Floating particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] transform-gpu"
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                  style={{
                    willChange: "transform, opacity",
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 18}%`,
                  }}
                />
              ))}

              {/* Premium glass container */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-white/90 via-white/80 to-gray-50/90 shadow-2xl border border-white/50 backdrop-blur-sm" />

              {/* Lottie Container */}
              <div className="relative w-full h-full p-8 flex items-center justify-center">
                {animationData ? (
                  <motion.div
                    className="w-full h-full"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  >
                    <Lottie
                      animationData={animationData}
                      className="w-full h-full drop-shadow-2xl"
                      loop
                      rendererSettings={{
                        preserveAspectRatio: "xMidYMid slice",
                        progressiveLoad: true,
                      }}
                    />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-gray-200 border-t-[#AF0D0E] rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <div
            className={`w-full lg:w-[55%] flex flex-col space-y-5 sm:space-y-6 lg:space-y-7 order-2 lg:order-1 items-start ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-5 py-2.5  shadow-[#AF0D0E]/5"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Rocket className="w-5 h-5 text-[#AF0D0E]" />
                </motion.div>
                <span className="text-sm font-bold bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] bg-clip-text text-transparent">
                  {isRTL
                    ? "تحلق في سماء الإبداع"
                    : "Soar in the Sky of Creativity"}
                </span>
                <Sparkles className="w-4 h-4 text-[#FF5C28]" />
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {isRTL ? (
                  <>
                    <span>منصة </span>
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AF0D0E] via-[#D4342C] to-[#FF5C28]">
                        كلمة
                      </span>
                      {/* Underline decoration */}
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] rounded-full origin-right"
                      />
                    </span>
                    <span> التعليمية</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AF0D0E] via-[#D4342C] to-[#FF5C28]">
                        Kalima
                      </span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] rounded-full origin-left"
                      />
                    </span>
                    <span> Learning Platform</span>
                  </>
                )}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl font-medium mb-8"
            >
              {isRTL
                ? "منصة تعليمية متكاملة توفر لك أفضل المعلمين والدورات التعليمية من الصف الرابع الابتدائي حتى الثالث الثانوي."
                : "A comprehensive educational platform providing the best teachers and courses from elementary to high school."}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-full max-w-xl"
            >
              <div className="relative w-full max-w-md mb-8">
                <input
                  type="text"
                  placeholder={
                    isRTL
                      ? "ابحث عن دورة، معلم، أو مادة..."
                      : "Search for courses, teachers..."
                  }
                  className={`w-full h-12 sm:h-14 ${
                    isRTL ? "pr-6 pl-24" : "pl-6 pr-24"
                  } bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10 transition-all text-sm sm:text-base`}
                />
                <button
                  className={`absolute top-1.5 bottom-1.5 ${
                    isRTL ? "left-1.5" : "right-1.5"
                  } px-4 sm:px-6 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 transition-all text-sm`}
                >
                  {isRTL ? "بحث" : "Search"}
                </button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 20px 40px rgba(175, 13, 14, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigateCourses}
                className="group px-7 py-4 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white rounded-2xl font-bold text-base flex items-center gap-3 shadow-xl shadow-red-500/20 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                <span>{isRTL ? "تصفح الكورسات" : "Browse Courses"}</span>
                <ArrowLeft
                  className={`w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ${!isRTL && "rotate-180"}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigateTeachers}
                className="group px-7 py-4 bg-white text-gray-900 hover:text-[#AF0D0E] rounded-2xl font-bold text-base flex items-center gap-3 border-2 border-gray-100 hover:border-[#AF0D0E]/20 shadow-lg shadow-gray-200/50 hover:shadow-red-500/10 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-[#AF0D0E]/10 flex items-center justify-center transition-colors duration-300">
                  <Play
                    className={`w-3.5 h-3.5 fill-current text-gray-500 group-hover:text-[#AF0D0E] transition-colors duration-300 ${!isRTL && "rotate-180"}`}
                  />
                </div>
                <span>{isRTL ? "المعلمين" : "Teachers"}</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
