"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Clock,
  GraduationCap,
  BookOpen,
  HeadphonesIcon,
  Award,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const BenefitsSection = React.memo(() => {
  const { i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const benefits = [
    {
      id: "01",
      icon: Clock,
      title: isRTL ? "تعلم مرن" : "Flexible Learning",
      description: isRTL
        ? "تعلم في أي وقت ومن أي مكان مع إمكانية الوصول الكامل."
        : "Learn anytime, anywhere with full access to all materials.",
      accent: "primary",
    },
    {
      id: "02",
      icon: GraduationCap,
      title: isRTL ? "معلمون خبراء" : "Expert Teachers",
      description: isRTL
        ? "نخبة من المعلمين المتميزين في مختلف المناهج."
        : "Elite selection of teachers across various curricula.",
      accent: "secondary",
    },
    {
      id: "03",
      icon: BookOpen,
      title: isRTL ? "محتوى مميز" : "Premium Content",
      description: isRTL
        ? "مناهج مصممة بعناية لتغطية جميع احتياجات الطلاب."
        : "Carefully designed curriculum covering all student needs.",
      accent: "primary",
    },
    {
      id: "04",
      icon: HeadphonesIcon,
      title: isRTL ? "متابعة مستمرة" : "Support",
      description: isRTL
        ? "دعم فني وتعليمي متواصل لضمان رحلة تعلم ناجحة."
        : "Continuous technical and educational support.",
      accent: "secondary",
    },
    {
      id: "05",
      icon: Award,
      title: isRTL ? "شهادات معتمدة" : "Certificates",
      description: isRTL
        ? "شهادات معتمدة توثق إنجازاتك الأكاديمية."
        : "Certified certificates documenting your achievements.",
      accent: "primary",
    },
    {
      id: "06",
      icon: TrendingUp,
      title: isRTL ? "تقييم ذكي" : "Smart Assessment",
      description: isRTL
        ? "نظام تقييم متطور لمتابعة تطور مستواك الأكاديمي."
        : "Advanced system to track your academic progress.",
      accent: "secondary",
    },
  ];

  return (
    <section
      className="relative py-16 sm:py-16 lg:py-40 overflow-hidden bg-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Elite Gallery Header */}
        <div
          className={`mb-12 sm:mb-20 lg:mb-32 ${isRTL ? "text-right" : "text-left"}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10"
          >
            <div className="flex -space-x-1.5 rtl:space-x-reverse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 border-2 border-white shadow-sm"
                />
              ))}
            </div>
            <span className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] text-primary uppercase">
              {isRTL ? "لماذا كلمة الفائقة؟" : "The Kalima Standard"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl lg:text-6xl xl:text-[5.5rem] font-black text-base-content leading-none tracking-tighter mb-6 sm:mb-10"
          >
            {isRTL ? (
              <>
                نحن <span className="text-secondary italic">نصيغ</span> <br />{" "}
                عهد التعليم الجديد
              </>
            ) : (
              <>
                Crafting The <br />{" "}
                <span className="text-secondary italic">Elite</span> Standard
              </>
            )}
          </motion.h2>

          <p className="text-base sm:text-lg lg:text-xl text-base-content/30 font-medium max-w-2xl leading-relaxed italic">
            {isRTL
              ? "منظومة تعليمية صُممت لتتجاوز التوقعات، حيث يلتقي عمق المعرفة مع رفاهية التجربة الرقمية."
              : "An educational ecosystem designed to exceed expectations, where deep knowledge meets a luxurious digital experience."}
          </p>
        </div>

        {/* The Boutique Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="relative group"
            >
              <div className="relative p-5 sm:p-6 lg:p-8 h-full rounded-2xl sm:rounded-3xl bg-white border border-base-content/5 shadow-xl transition-all duration-500 hover:shadow-2xl hover-shadow-primary hover:-translate-y-2 overflow-hidden">
                {/* Animated Material Icon */}
                <div className="relative mb-8 sm:mb-10 lg:mb-14">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] bg-base-100 border border-base-content/5 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <benefit.icon
                      className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-base-content/60 group-hover:text-primary transition-colors"
                      strokeWidth={1}
                    />
                  </div>
                </div>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-base-content mb-3 sm:mb-4 lg:mb-6 tracking-tight group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-base-content/40 font-medium leading-relaxed mb-6 sm:mb-8 lg:mb-12 group-hover:text-base-content/60 transition-colors">
                    {benefit.description}
                  </p>

                  {/* Boutique CTA */}
                  <div
                    className={`flex items-center gap-3 sm:gap-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-secondary opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>
                      {isRTL ? "اكتشف الفلسفة" : "Discover Philosophy"}
                    </span>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

BenefitsSection.displayName = "BenefitsSection";

export default BenefitsSection;
