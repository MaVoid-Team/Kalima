"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GraduationCap, Award } from "lucide-react";

const AboutSection = React.memo(() => {
  const { i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";

  const features = [
    {
      icon: GraduationCap,
      title: isRTL ? "محاضرات تفاعلية" : "Interactive Lectures",
      arDesc: "محتوى تعليمي متطور يواكب احدث المناهج.",
      enDesc: "Modern educational content with latest curricula.",
    },
    {
      icon: Award,
      title: isRTL ? "جودة تعليمية" : "Educational Quality",
      arDesc: "نضمن لك اعلى معايير الجودة في التدريس.",
      enDesc: "Ensuring the highest pedagogical standards.",
    },
  ];

  return (
    <section
      className="relative py-6 sm:py-16 lg:py-40 bg-base-100 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12">
        <div
          className={`flex flex-col lg:flex-row items-stretch gap-24 ${isRTL ? "lg:flex-row-reverse" : ""
            }`}
        >
          {/* Editorial Side - The Narrative */}
          <div className="flex-1 flex flex-col justify-center">
            <div className={`space-y-12 ${isRTL ? "text-right" : "text-left"}`}>
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="w-16 h-px bg-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
                  {isRTL ? "قصة التميز" : "The Legacy"}
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
                    نتجاوز <span className="text-secondary italic">آفاق</span>{" "}
                    <br /> التعلم التقليدي
                  </>
                ) : (
                  <>
                    Beyond <br />{" "}
                    <span className="text-secondary italic">Boundaries</span>
                  </>
                )}
              </motion.h2>

              <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-xl italic border-quote-primary">
                {isRTL
                  ? "نحن هنا لنضع بين يديك تجربة تعليمية لا تُنسى، تمزج بين الابتكار والاحترافية والذكاء الإصطناعي."
                  : "We provide an unforgettable educational experience, blending innovation, professionalism, and AI."}
              </p>

              {/* Bespoke Feature Grid */}
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
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-all duration-500 transform group-hover:-rotate-12">
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

          {/* Visual Side - The Artistic Frame */}
          <div className="flex-1 relative min-h-[600px] lg:min-h-0">
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-[4/5]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                  viewport={{ once: true }}
                  className="relative h-full w-full rounded-[4rem] overflow-hidden border-[16px] border-base-100 shadow-2xl group bg-base-200"
                >
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=1000&fit=crop&q=80"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Students Learning Together"
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

AboutSection.displayName = "AboutSection";

export default AboutSection;
