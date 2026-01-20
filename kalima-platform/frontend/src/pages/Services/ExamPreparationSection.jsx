"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, ShieldCheck, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ExamPreparationSection = React.memo(() => {
  const { i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const features = [
    {
      icon: Trophy,
      title: isRTL ? "درب عقلك" : "Brain Training",
      arDesc: "تمارين مكثفة لرفع سرعة البديهة والتركيز.",
      enDesc: "Intense drills for mental agility and focus.",
    },
    {
      icon: Star,
      title: isRTL ? "نماذج الامتحانات" : "Real Simulators",
      arDesc: "محاكاة واقعية لبيئة الامتحانات الفعلية.",
      enDesc: "Realistic exam environment simulators.",
    },
    {
      icon: ShieldCheck,
      title: isRTL ? "ثقة مطلقة" : "Ultimate Confidence",
      arDesc: "استراتيجيات للتغلب على قلق الامتحان.",
      enDesc: "Strategies to overcome exam anxiety.",
    },
  ];

  const stats = [
    { value: "98.5%", label: isRTL ? "معدل النجاح" : "Success Rate" },
    { value: "15K+", label: isRTL ? "سؤال" : "Questions" },
    { value: "850+", label: isRTL ? "امتحان تجريبي" : "Mock Exams" },
  ];

  return (
    <section
      className="relative py-16 sm:py-24 lg:py-40 bg-white overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`flex flex-col lg:flex-row items-stretch gap-12 lg:gap-24 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Editorial Side - The Narrative */}
          <div className="flex-1 flex flex-col justify-center">
            <div className={`space-y-12 ${isRTL ? "text-right" : "text-left"}`}>
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex items-center gap-6 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-16 h-px bg-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
                  {isRTL ? "التفوق في الامتحان" : "Exam Mastery"}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-base-content leading-[0.9] tracking-tighter"
              >
                {isRTL ? (
                  <>
                    نعدك <span className="text-secondary italic">لليوم</span>{" "}
                    <br /> الذي تنتظره
                  </>
                ) : (
                  <>
                    Preparing For <br />{" "}
                    <span className="text-secondary italic">The Big Day</span>
                  </>
                )}
              </motion.h2>

              <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-xl italic border-l-4 border-primary/20 pl-8 rtl:border-l-0 rtl:border-r-4 rtl:pr-8 rtl:pl-0">
                {isRTL
                  ? "نظام تحضير شامل يضمن لك التفوق والثقة في مواجهة أي امتحان."
                  : "A comprehensive preparation system ensuring excellence and confidence for any exam."}
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 gap-8 pt-8">
                {features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div
                      className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:-rotate-12">
                        <feat.icon className="w-6 h-6" strokeWidth={1} />
                      </div>
                      <h4 className="text-xl font-black text-base-content uppercase tracking-tight">
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-sm text-base-content/40 font-medium leading-loose group-hover:text-base-content/60 transition-colors">
                      {isRTL ? feat.arDesc : feat.enDesc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Side - Stats Dashboard */}
          <div className="flex-1 relative min-h-[600px] lg:min-h-0">
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Main Stats Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                  viewport={{ once: true }}
                  className="relative w-full rounded-[2rem] sm:rounded-[4rem] overflow-hidden border-[8px] sm:border-[16px] border-white shadow-2xl bg-base-100 p-6 sm:p-12"
                >
                  {/* Header */}
                  <div
                    className={`flex items-center justify-between mb-10 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                      {isRTL ? "هدف عالي" : "High Target"}
                    </span>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-6 mb-12">
                    <h3
                      className={`text-3xl font-black text-base-content tracking-tight ${isRTL ? "text-right" : ""}`}
                    >
                      {isRTL ? "دقة الإجابة" : "Exam Precision"}
                    </h3>
                    <div className="h-4 w-full bg-base-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "98%" }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 divide-y sm:divide-y-0 divide-base-content/5">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center"
                      >
                        <p className="text-4xl sm:text-3xl lg:text-3xl font-black text-primary mb-2 mt-4 sm:mt-0">
                          {stat.value}
                        </p>
                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ExamPreparationSection.displayName = "ExamPreparationSection";
