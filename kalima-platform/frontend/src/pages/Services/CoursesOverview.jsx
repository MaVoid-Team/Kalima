import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowUpRight } from "lucide-react";

const CoursesOverviews = React.memo(
  ({ isRTL = false, imageUrl = "/education-banner.png" }) => {
    return (
      <div className={`py-12 px-4 sm:px-6`} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-[3rem] p-8 sm:p-12 border border-base-content/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 overflow-hidden"
          >
            {/* Background Decoration */}
            <div
              className={`absolute top-0 ${
                isRTL ? "left-0" : "right-0"
              } w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-1`}
            />

            <div
              className={`flex flex-col md:flex-row items-center gap-12 ${
                isRTL ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full md:w-2/5 relative">
                <div className="relative aspect-[16/9] md:aspect-square overflow-hidden rounded-[2.5rem] bg-base-100 shadow-inner">
                  <img
                    src={imageUrl}
                    alt="Education Banner"
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>

              <div
                className={`flex-1 space-y-6 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-[10px] font-black text-secondary uppercase tracking-[0.5em]">
                    {isRTL ? "الأكاديمية" : "Academy"}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-base-content tracking-tighter leading-tight group-hover:text-primary transition-colors">
                  {isRTL ? "تصفح جميع الكورسات" : "Browse All Courses"}
                </h2>

                <p className="text-xl text-primary/60 font-medium italic border-l-4 border-primary/20 pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-6">
                  {isRTL ? "لجميع المراحل الدراسية" : "For All Academic Levels"}
                </p>

                <div
                  className={`pt-6 flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3">
                    <span>{isRTL ? "استكشف الآن" : "Explore Now"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
);

CoursesOverviews.displayName = "CoursesOverviews";
export default CoursesOverviews;
