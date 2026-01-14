import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import {
  Search,
  Play,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Rocket,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

const WelcomeSection = React.memo(() => {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/STUDENT.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, []);

  // Custom Counter Component using Framer Motion
  const CountUp = ({ from, to, prefix = "", suffix = "" }) => {
    const nodeRef = React.useRef();

    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      const controls = animate(from, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (value) => {
          node.textContent = `${prefix}${Math.round(
            value
          ).toLocaleString()}${suffix}`;
        },
      });

      return () => controls.stop();
    }, [from, to, prefix, suffix]);

    return <span ref={nodeRef} />;
  };

  const stats = useMemo(
    () => [
      {
        id: 1,
        value: 5200,
        prefix: "+",
        label: t("welcome.stats.students") || "طالب متفوق",
        icon: Users,
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        id: 2,
        value: 150,
        prefix: "+",
        label: t("welcome.stats.teachers") || "معلم خبير",
        icon: GraduationCap,
        color: "text-orange-500",
        bg: "bg-orange-50",
      },
      {
        id: 3,
        value: 500,
        prefix: "+",
        label: t("welcome.stats.courses") || "كورس تعليمي",
        icon: BookOpen,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
      },
    ],
    [t]
  );

  const features = useMemo(
    () => [
      {
        label: t("welcome.features.interactive") || "محتوى تفاعلي",
        icon: CheckCircle2,
      },
      {
        label: t("welcome.features.certified") || "شهادات معتمدة",
        icon: CheckCircle2,
      },
      {
        label: t("welcome.features.progress") || "تقدم مستمر",
        icon: CheckCircle2,
      },
    ],
    [t]
  );

  return (
    // Warm peachy background matching screenshot exactly
    // Premium "Living" background with Aurora effect and Noise texture
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center pt-10 pb-20 overflow-hidden bg-[#FEFBF9]">
      {/* Dynamic Animated Glow Layers (Aurora Effect) - Airy & Subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-30%] right-[-10%] w-[60rem] h-[60rem] bg-gradient-to-br from-[#FF5C28]/20 to-[#AF0D0E]/20 rounded-full blur-[140px] opacity-40 mixture-blend-overlay"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[-20%] w-[50rem] h-[50rem] bg-[#AF0D0E]/15 rounded-full blur-[150px] opacity-30 mixture-blend-multiply"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[10%] w-[55rem] h-[55rem] bg-[#FF5C28]/15 rounded-full blur-[160px] opacity-30"
        />
      </div>

      {/* Noise Texture Overlay for Premium Feel */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Giant Animated Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2 }}
          className={`text-[20rem] lg:text-[45rem] font-bold leading-none tracking-tighter ${
            isRTL
              ? "font-[family-name:var(--font-shakhabeet)]"
              : "font-[family-name:var(--font-bigx)]"
          }`}
          style={{
            WebkitTextStroke: "2px #AF0D0E",
            color: "transparent",
          }}
        >
          {isRTL ? "كلمة" : "KALIMA"}
        </motion.div>
      </div>

      {/* Decorative Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          src="/bDots.png"
          className="absolute top-40 left-20 w-32 opacity-20"
          alt=""
        />
        <motion.img
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          src="/rDots.png"
          className="absolute bottom-40 right-20 w-32 opacity-20"
          alt=""
        />
      </div>

      <div
        className={`container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 ${
          isRTL ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Left Section: Illustration (Lottie) - Elite Levitation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1, y: [0, -20, 0] }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
          viewport={{ once: true }}
          className="w-full lg:w-5/12 flex justify-center relative"
        >
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* Multi-layered soft glow behind illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C28]/15 to-[#AF0D0E]/5 rounded-full blur-[100px]" />
            <div className="absolute w-3/4 h-3/4 bg-[#AF0D0E]/5 rounded-full blur-[60px] animate-pulse" />

            {animationData ? (
              <Lottie
                animationData={animationData}
                className="w-full h-full relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                loop={true}
              />
            ) : (
              <img
                src="/student_illustration.png"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                alt="Student Illustration"
              />
            )}

            {/* Red Accent Dot from Screenshot - Inner position */}
            <div
              className={`absolute ${
                isRTL ? "-right-4" : "-left-4"
              } top-1/2 w-4 h-4 bg-[#AF0D0E] rounded-full shadow-[0_0_20px_rgba(175,13,14,0.4)] z-20`}
            />
          </div>
        </motion.div>

        {/* Right Section: Content - Staggered Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
              },
            },
          }}
          className={`w-full lg:w-7/12 space-y-10 ${
            isRTL ? "text-right pr-4" : "text-left pl-4"
          }`}
        >
          {/* Elite Capsule Badge */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: isRTL ? 50 : -50 },
              visible: { opacity: 1, x: 0 },
            }}
            className={`inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-xl rounded-full border border-orange-100/30 shadow-[0_4px_15px_rgba(255,92,40,0.08)] hover:shadow-[0_8px_25px_rgba(255,92,40,0.15)] transition-all cursor-pointer group ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-1.5 bg-orange-50 rounded-full group-hover:scale-110 transition-transform">
              <Rocket className="w-4 h-4 text-[#FF5C28]" />
            </div>
            <span className="text-sm font-bold text-gray-800 tracking-tight">
              {t("welcome.badge") || "الانطلاق في سماء الإبداع"}
            </span>
            <Sparkles className="w-4 h-4 text-[#AF0D0E] animate-pulse" />
          </motion.div>

          {/* Hero Typography - High Fidelity */}
          <div className="space-y-6">
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-6xl lg:text-[5.5rem] font-black text-[#1A1A1A] leading-[1.05] tracking-tight"
            >
              <span className="font-[family-name:var(--font-headline)]">
                {t("welcome.heading1") || "منصة"}
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AF0D0E] via-[#FF5C28] to-[#AF0D0E] bg-[length:200%_auto] animate-gradient font-[family-name:var(--font-bigx)] drop-shadow-sm filter brightness-110">
                {t("welcome.kalima") || "كلمة"}
              </span>{" "}
              <span className="font-[family-name:var(--font-headline)]">
                {t("welcome.heading2") || "التعليمية"}
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-xl lg:text-2xl text-gray-500 font-medium font-[family-name:var(--font-body)] max-w-2xl leading-relaxed opacity-80"
            >
              {t("welcome.description") ||
                "منصة تعليمية متكاملة توفر لك أفضل المعلمين والكورسات من الصف الرابع الابتدائي حتى الثالث الثانوي"}
            </motion.p>
          </div>

          {/* Features List - Elite Styling */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            className={`flex flex-wrap gap-x-12 gap-y-6 items-center ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 group cursor-default ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="text-[#AF0D0E] p-0.5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-[0.95rem] font-bold text-gray-600 group-hover:text-black transition-colors">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Integrated Search Bar - Pixel Perfect from Screenshot */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="relative max-w-2xl w-full"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-200 to-orange-100 rounded-[2.2rem] blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500" />
              <div className="relative flex items-center bg-[#F9F9F9] rounded-[2rem] border border-gray-100 p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_50px_rgba(175,13,14,0.06)] transition-all duration-500">
                <div className="p-4 opacity-40">
                  <Search className="w-7 h-7 text-gray-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    t("welcome.searchPlaceholder") ||
                    "أبحث عن كورس، معلم، أو مادة..."
                  }
                  className={`flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-gray-800 font-bold placeholder:text-gray-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />

                {/* Magnetic-style Search Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#AF0D0E] hover:bg-[#8d0a0b] text-white px-10 py-4 rounded-[1.5rem] font-bold flex items-center gap-3 transition-all shadow-xl shadow-[#AF0D0E]/20"
                  onClick={() => navigate(`/courses?search=${searchQuery}`)}
                >
                  <ChevronLeft
                    className={`w-5 h-5 ${isRTL ? "" : "rotate-180"}`}
                  />
                  <span>{t("welcome.search") || "ابحث"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons - Magnetic Polish */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-wrap items-center gap-12 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, x: isRTL ? -5 : 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/courses")}
              className="px-12 py-5 rounded-[1.8rem] font-bold text-white flex items-center gap-3 shadow-[0_20px_40px_rgba(175,13,14,0.15)] transition-all bg-gradient-to-l from-[#AF0D0E] to-[#FF5C28]"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("welcome.browseCourses") || "تصفح الكورسات"}</span>
              <ChevronLeft className={`w-5 h-5 ${isRTL ? "" : "rotate-180"}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, x: isRTL ? 5 : -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/teachers")}
              className="group flex items-center gap-6 text-[#1A1A1A] font-black hover:text-[#AF0D0E] transition-all"
            >
              <div className="w-14 h-14 bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-full flex items-center justify-center group-hover:bg-[#AF0D0E] group-hover:text-white group-hover:border-[#AF0D0E] transition-all duration-300">
                <Play
                  className={`w-5 h-5 fill-current ${
                    isRTL ? "" : "rotate-180"
                  }`}
                />
              </div>
              <span className="text-xl tracking-tight">
                {t("welcome.teachers") || "المعلمين"}
              </span>
            </motion.button>
          </motion.div>

          {/* Stats Cards Row - Elite Perspective Tilt */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12"
          >
            {stats
              .sort((a, b) => a.id - b.id)
              .map((stat, index) => (
                <motion.div
                  key={stat.id}
                  whileHover={{
                    scale: 1.05,
                    rotateY: isRTL ? 5 : -5,
                    translateZ: 20,
                  }}
                  className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_15px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col items-center gap-4 group/card cursor-pointer perspective-1000"
                >
                  <div
                    className={`${stat.bg} ${stat.color} p-5 rounded-[1.2rem] group-hover/card:bg-[#AF0D0E] group-hover/card:text-white transition-all duration-300`}
                  >
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 text-center">
                    <div
                      className={`text-5xl font-black font-[family-name:var(--font-bigx)] ${stat.color} group-hover/card:text-[#1A1A1A] transition-colors`}
                    >
                      <CountUp from={0} to={stat.value} prefix={stat.prefix} />
                    </div>
                    <div className="text-[0.95rem] text-gray-400 font-black tracking-wide pt-1">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Discover More Scroll Indicator - Centered */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 cursor-pointer group"
      >
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-300 font-bold group-hover:text-red-400 transition-colors">
            {t("welcome.discoverMore") || "اكتشف المزيد"}
          </span>
        </div>
        <div className="w-10 h-16 border-2 border-red-50 rounded-full relative p-2 shadow-inner group-hover:border-red-100 transition-all">
          <motion.div
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-4 bg-[#AF0D0E]/80 rounded-full mx-auto"
          />
        </div>
      </motion.div>
    </div>
  );
});

export default WelcomeSection;
