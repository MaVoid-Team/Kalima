import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";

const LanguageCourseCard = React.memo(
  ({
    isRTL,
    title,
    subtitle,
    rating = 0,
    imageUrl = "/languagedetails.png",
  }) => {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`group flex items-stretch bg-white rounded-[2rem] overflow-hidden border border-base-content/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-500 w-full max-w-3xl ${
          isRTL ? "flex-row-reverse text-right" : "text-left"
        }`}
      >
        <div className="w-1/3 sm:w-2/5 relative overflow-hidden bg-base-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
        </div>

        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div
              className={`flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">
                Language Excellence
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tighter group-hover:text-primary transition-colors">
              {title}
            </h2>

            <p className="text-sm text-base-content/40 font-medium leading-relaxed">
              {subtitle}
            </p>

            <div
              className={`flex items-center gap-4 pt-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rating
                        ? "fill-accent text-accent"
                        : "text-base-content/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-base-content/20 uppercase tracking-widest">
                {rating}.0 Rating
              </span>
            </div>
          </div>

          <div
            className={`mt-6 pt-6 border-t border-base-content/5 flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 group/btn">
              <span>Explore</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  },
);

LanguageCourseCard.displayName = "LanguageCourseCard";
export default LanguageCourseCard;
