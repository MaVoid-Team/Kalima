"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AppDownloadSection = React.memo(() => {
  const { i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const features = [
    {
      icon: Smartphone,
      title: isRTL ? "تعلم في أي مكان" : "Learn Anywhere",
      arDesc: "تابع دروسك من هاتفك في أي وقت.",
      enDesc: "Access your lessons from your phone anytime.",
    },
    {
      icon: Download,
      title: isRTL ? "محتوى للتحميل" : "Offline Content",
      arDesc: "حمّل الدروس وشاهدها بدون إنترنت.",
      enDesc: "Download lessons and watch offline.",
    },
  ];

  return (
    <section
      className="relative py-40 bg-white overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`flex flex-col lg:flex-row items-stretch gap-24 ${
            isRTL ? "" : "lg:flex-row-reverse"
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
                  {isRTL ? "تطبيق كلمة" : "Kalima App"}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl lg:text-7xl font-black text-base-content leading-[0.9] tracking-tighter"
              >
                {isRTL ? (
                  <>
                    تعلم بلا <span className="text-secondary italic">حدود</span>{" "}
                    <br /> في راحة يدك
                  </>
                ) : (
                  <>
                    Learn Without <br />{" "}
                    <span className="text-secondary italic">Boundaries</span>
                  </>
                )}
              </motion.h2>

              <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-xl italic border-l-4 border-primary/20 pl-8 rtl:border-l-0 rtl:border-r-4 rtl:pr-8 rtl:pl-0">
                {isRTL
                  ? "مع تطبيق كلمة، نأخذك في رحلة تعليمية متكاملة تتخطى قيود المكان والزمان."
                  : "With Kalima app, we take you on an integrated educational journey that transcends limits."}
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-8">
                {features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-4">
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

              {/* Download Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-base-content text-white rounded-2xl font-bold hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  <span>{isRTL ? "تحميل التطبيق" : "Download App"}</span>
                </a>
              </motion.div>
            </div>
          </div>

          {/* Visual Side - The Artistic Frame */}
          <div className="flex-1 relative min-h-[600px] lg:min-h-0">
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-[4/5]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                  viewport={{ once: true }}
                  className="relative h-full w-full rounded-[4rem] overflow-hidden border-[16px] border-white shadow-2xl group bg-base-200"
                >
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=1000&fit=crop&q=80"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Mobile Learning"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AppDownloadSection.displayName = "AppDownloadSection";
