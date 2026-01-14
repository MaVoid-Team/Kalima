import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaAward,
  FaChalkboardTeacher,
  FaClock,
  FaUsers,
} from "react-icons/fa";

const AboutSection = React.memo(({ isRTL }) => {
  const features = useMemo(
    () => [
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
    ],
    [isRTL]
  );

  const stats = useMemo(
    () => [
      {
        id: 1,
        number: "10K+",
        label: isRTL ? "طالب نشط" : "Active Students",
        icon: <FaUsers />,
      },
      {
        id: 2,
        number: "500+",
        label: isRTL ? "دورة تدريبية" : "Courses",
        icon: <FaAward />,
      },
      {
        id: 3,
        number: "98%",
        label: isRTL ? "رضا الطلاب" : "Satisfaction",
        icon: <FaClock />,
      },
    ],
    [isRTL]
  );

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex flex-col lg:flex-row items-center gap-12 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <FaAward className="text-primary" />
              <span className="text-sm font-[family-name:var(--font-malmoom)] text-primary">
                {isRTL ? "معلومات عنا" : "About Us"}
              </span>
            </div>

            {/* Heading */}
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight font-[family-name:var(--font-headline)] ${isRTL ? "text-right" : "text-left"}`}>
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

            {/* Description */}
            <p
              className={`text-lg text-base-content/70 leading-relaxed font-[family-name:var(--font-body)] ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {isRTL
                ? "منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي."
                : "Kalima Platform is an e-learning platform that provides resources for students from 4th grade through 12th grade."}
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    {feature.icon}
                  </div>
                  <span className="text-base-content font-medium font-[family-name:var(--font-body)] flex-1">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary font-[family-name:var(--font-bigx)]">
                    {stat.number}
                  </div>
                  <div className="text-sm text-base-content/60 font-[family-name:var(--font-malmoom)] mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
            style={{ height: "clamp(400px, 60vw, 500px)" }}
          >
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <pattern
                  id="dotsPattern"
                  x="0"
                  y="0"
                  width="25"
                  height="25"
                  patternUnits="userSpaceOnUse"
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

            {/* Image Container */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-full max-w-[500px]">
                <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl">
                  <img
                    src="/man-working.jpg"
                    alt={isRTL ? "طلاب يدرسون" : "Students learning"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-50 -z-10" />
              </div>
            </motion.div>

            {/* Decorative Orbs */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl z-0"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -right-6 bottom-6 w-32 h-32 rounded-full bg-gradient-to-br from-secondary/20 to-transparent blur-3xl z-0"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;