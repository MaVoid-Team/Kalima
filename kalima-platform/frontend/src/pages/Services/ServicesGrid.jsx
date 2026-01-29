"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, GraduationCap, BookOpen, Medal } from "lucide-react";
import { useTranslation } from "react-i18next";

const ServicesGrid = React.memo(() => {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const services = useMemo(
    () => [
      {
        icon: Clock,
        title: t("services.learnAnytime.title"),
        description: t("services.learnAnytime.description"),
      },
      {
        icon: GraduationCap,
        title: t("services.teachers.title"),
        description: t("services.teachers.description"),
      },
      {
        icon: Medal,
        title: t("services.curriculum.title"),
        description: t("services.curriculum.description"),
      },
      {
        icon: BookOpen,
        title: t("services.certificates.title"),
        description: t("services.certificates.description"),
      },
    ],
    [t],
  );

  return (
    <section
      className="relative py-16 sm:py-24 lg:py-40 bg-white overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12">
        {/* Header - Same style as About & App sections */}
        <div className={`mb-12 sm:mb-20 ${isRTL ? "text-right" : "text-left"}`}>
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex items-center gap-6 mb-10 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-16 h-px bg-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
              {isRTL ? "خدماتنا المتميزة" : "Our Services"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-base-content leading-[0.9] tracking-tighter mb-6 sm:mb-10"
          >
            {isRTL ? (
              <>
                نصنع لك <span className="text-secondary italic">بيئة</span>{" "}
                <br /> تعلم عالمية
              </>
            ) : (
              <>
                Crafting a <span className="text-secondary italic">Global</span>{" "}
                <br /> Learning Hub
              </>
            )}
          </motion.h2>

          <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-2xl italic border-quote-primary">
            {isRTL
              ? "نحن نضع معايير جديدة للتعليم الرقمي، حيث الجودة هي الأساس."
              : "Setting new benchmarks in digital education where quality is our foundational pulse."}
          </p>
        </div>

        {/* Services Grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group"
            >
              <div
                className={`flex items-start gap-8 p-10 rounded-3xl bg-base-100 border border-base-content/5 shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  isRTL ? "flex-row-reverse text-right" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:-rotate-12">
                    <service.icon className="w-8 h-8" strokeWidth={1} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black text-base-content tracking-tight group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-base text-base-content/40 leading-relaxed font-medium group-hover:text-base-content/60 transition-colors">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesGrid.displayName = "ServicesGrid";

export default ServicesGrid;
