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

const ActionButton = memo(
  ({ label, onClick, variant, icon: Icon, hasArrow, isRTL }) => {
    const isPrimary = variant === "primary";

    return (
      <motion.button
        whileHover={{
          scale: 1.03,
          boxShadow: isPrimary ? "0 20px 40px rgba(175, 13, 14, 0.25)" : "none",
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`group px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 transition-all duration-300 ${isPrimary
            ? "bg-gradient-kalima text-white shadow-xl shadow-red-500/20"
            : "bg-white text-gray-900 hover:text-primary border-2 border-gray-100 hover:border-primary/20"
          }`}
      >
        {isPrimary ? (
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
            <Icon className="w-3.5 h-3.5 fill-current text-gray-500 group-hover:text-primary transition-colors duration-300" />
          </div>
        )}
        <span>{label}</span>
        {hasArrow && (
          <ArrowLeft
            className={`w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ${!isRTL && "rotate-180"
              }`}
          />
        )}
      </motion.button>
    );
  },
);

ActionButton.displayName = "ActionButton";

const HeroDescription = memo(({ isRTL }) => (
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
));
HeroDescription.displayName = "HeroDescription";

const HeroSearch = memo(({ isRTL, searchQuery, onSearchChange, onSearch }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.6 }}
    className="w-full max-w-xl"
  >
    <div className="relative w-full max-w-md mb-8">
      <input
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={
          isRTL
            ? "ابحث عن دورة، معلم، أو مادة..."
            : "Search for courses, teachers..."
        }
        className={`w-full h-12 sm:h-14 ${isRTL ? "pr-6 pl-24" : "pl-6 pr-24"
          } bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10 transition-all text-sm sm:text-base`}
      />
      <button
        onClick={onSearch}
        className={`absolute top-1.5 bottom-1.5 ${isRTL ? "left-1.5" : "right-1.5"
          } px-4 sm:px-6 bg-gradient-kalima text-white font-bold rounded-xl shadow-lg shadow-red-500/20  text-sm`}
      >
        {isRTL ? "بحث" : "Search"}
      </button>
    </div>
  </motion.div>
));
HeroSearch.displayName = "HeroSearch";

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

  // Memoized data with brand colors
  const stats = useMemo(
    () => [
      {
        id: 1,
        value: "5,200",
        label: isRTL ? "طالب مسجل" : "Students",
        icon: Users,
        color: "text-[#AF0D0E]",
        bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      },
      {
        id: 2,
        value: "150",
        label: isRTL ? "معلم متميز" : "Teachers",
        icon: GraduationCap,
        color: "text-[#FF5C28]",
        bg: "bg-gradient-to-br from-orange-50 to-orange-100/50",
      },
      {
        id: 3,
        value: "500",
        label: isRTL ? "دورة تعليمية" : "Courses",
        icon: BookOpen,
        color: "text-[#AF0D0E]",
        bg: "bg-gradient-to-br from-red-50 to-orange-50",
      },
    ],
    [isRTL],
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center pb-16 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Premium Background */}

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-[1500px] sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Illustration Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[45%] flex justify-center relative order-1 lg:order-2 "
          >
            <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg ">
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
                    <div className="w-14 h-14 border-4 border-base-content/20 border-t-primary rounded-full " />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <div
            className={`w-full lg:w-[55%] flex flex-col space-y-5 sm:space-y-6 lg:space-y-7 order-2 lg:order-1 items-start ${isRTL ? "text-right" : "text-left"
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
                className="inline-flex items-center gap-3 py-2.5 shadow-primary/5"
              >
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-gradient-brand">
                  {isRTL
                    ? "تحلق في سماء الإبداع"
                    : "Soar in the Sky of Creativity"}
                </span>
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-base-content leading-[1.1] tracking-tight">
                {isRTL ? (
                  <>
                    <span>منصة </span>
                    <span className="relative inline-block">
                      <span className="text-gradient-brand">
                        كلمة
                      </span>
                      {/* Underline decoration */}
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute -bottom-1 left-0 right-0 h-1 gradient-brand-horizontal rounded-full origin-right"
                      />
                    </span>
                    <span> التعليمية</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-block">
                      <span className="text-gradient-brand">
                        Kalima
                      </span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute -bottom-1 left-0 right-0 h-1 gradient-brand-horizontal rounded-full origin-left"
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
              className="text-base sm:text-lg text-base-content/60 leading-relaxed max-w-xl font-medium mb-8"
            >
              {isRTL
                ? "منصة تعليمية متكاملة توفر لك أفضل المعلمين والدورات التعليمية من الصف الرابع الابتدائي حتى الثالث الثانوي."
                : "A comprehensive educational platform providing the best teachers and courses from elementary to high school."}
            </motion.p>
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
                className="group px-7 py-4 gradient-brand text-primary-content rounded-2xl font-bold text-base flex items-center gap-3 shadow-xl shadow-primary/20 transition-all duration-300"
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
                className="group px-7 py-4 bg-base-100 text-base-content hover:text-primary rounded-2xl font-bold text-base flex items-center gap-3 border-2 border-base-content/10 hover:border-primary/20 shadow-lg shadow-base-content/10 hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-base-200 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
                  <Play
                    className={`w-3.5 h-3.5 fill-current text-base-content/50 group-hover:text-primary transition-colors duration-300 ${!isRTL && "rotate-180"}`}
                  />
                </div>
                <span>{isRTL ? "المعلمين" : "Teachers"}</span>
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex flex-col items-center justify-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
                    <stat.icon
                      className={`w-5 h-5 ${stat.color}`}
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    +<AnimatedCounter value={stat.value} />
                  </h3>
                  <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
