import React, {  useMemo } from "react";

import { motion } from "framer-motion";

import {
 
  FaCertificate,
  FaClock,
  FaGraduationCap,
  FaMedal,
} from "react-icons/fa";

const ServicesGrid = React.memo(({ isRTL }) => {
  const services = useMemo(
    () => [
      {
        icon: <FaClock className="text-4xl mb-4 text-blue-300" />,
        title: isRTL ? "التعلم في أي وقت" : "Learn Anytime",
        desc: isRTL
          ? "الوصول إلى الدروس 24/7 مع إمكانية التكرار والمشاهدة في الوقت الذي يناسبك"
          : "24/7 access to lessons with replay options whenever it suits you",
        highlight: true
      },
      {
        icon: <FaGraduationCap className="text-4xl mb-4 text-blue-300" />,
        title: isRTL ? "معلمين خبراء معتمدين" : "Certified Expert Teachers",
        desc: isRTL
          ? "فريق من المعلمين المؤهلين ذوي الخبرة الطويلة في المناهج التعليمية"
          : "Team of qualified teachers with extensive experience in educational curricula",
        highlight: true
      },
      {
        icon: <FaMedal className="text-4xl mb-4 text-blue-300" />,
        title: isRTL ? "مناهج عالية الجودة" : "Premium Curriculum",
        desc: isRTL
          ? "مناهج مصممة بعناية لتغطية جميع احتياجات الطلاب مع ضمان الجودة العالية"
          : "Carefully designed curriculum covering all student needs with guaranteed high quality",
        highlight: true
      },
      {
        icon: <FaCertificate className="text-4xl mb-4 text-blue-300" />,
        title: isRTL ? "شهادات معتمدة" : "Certified Certificates",
        desc: isRTL
          ? "حصول الطلاب على شهادات معتمدة بعد إتمام كل مستوى تعليمي"
          : "Students receive certified certificates upon completion of each educational level",
        highlight: true
      }
    ],
    [isRTL]
  );

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 py-16 px-4 sm:px-6 lg:px-8 rounded-xl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative text-center mb-8 sm:mb-12"
        >
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary relative z-10 pb-2">
              {isRTL ? "خدماتنا" : "Our Services"}
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
              className={`inline-flex items-center ${isRTL ? "mr-2" : "ml-2"}`}
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
        </motion.div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${
            isRTL ? "rtl" : "ltr"
          }`}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                borderColor: "var(--p)",
              }}
              className="bg-base-100 rounded-2xl shadow-sm overflow-hidden border-2 border-base-200 relative"
            >
              <div className="p-6 flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-primary/10 text-primary relative">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-base-content mb-3">
                  {service.title}
                </h3>
                <p className="text-base-content/70 mb-4">{service.desc}</p>
                <div className="mt-auto w-full">
                  <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-80"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default ServicesGrid;