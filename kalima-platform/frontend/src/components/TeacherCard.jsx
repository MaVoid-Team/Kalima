import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, ChevronRight, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";

function TeacherCard({ id, image, name, subject, grade, rating }) {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => navigate(`/teacher-details/${id}`)}
      className="group relative cursor-pointer"
    >
      {/* Card Frame */}
      <div className="card bg-base-100 p-4 pb-8 transition-all duration-500 shadow-sm hover:shadow-xl border border-base-content/5 overflow-hidden">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-base-200">
          <img
            src={image || "/placeholder.svg"}
            alt={`${t("alts.teacherProfile")} ${name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Top Indicators */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10">
            <button className="w-10 h-10 rounded-xl backdrop-blur-md bg-base-100/20 border border-base-100/20 flex items-center justify-center text-base-content hover:bg-base-100 hover:text-base-content transition-all">
              <Bookmark className="w-5 h-5" />
            </button>
            <div className="backdrop-blur-md bg-neutral/60 border border-base-100/20 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-neutral-content">{rating}</span>
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`mt-6 px-2 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Name */}
          <h4 className="text-xl font-black text-base-content tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 mb-6 line-clamp-1">
            {name}
          </h4>

          {/* Stats Bar */}
          <div
            className={`flex items-center justify-between pt-4 border-t border-base-content/5 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div
              className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""
                }`}
            >
              <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-wider">
                  {isRTL ? "المادة" : "Subject"}
                </span>
                <span className="text-xs font-black text-base-content mt-0.5 line-clamp-1 max-w-[80px]">
                  {subject || (isRTL ? "عام" : "General")}
                </span>
              </div>
              <div className="h-8 w-px bg-base-content/10" />
              <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-wider">
                  {isRTL ? "المرحلة" : "Grade"}
                </span>
                <span className="text-xs font-black text-base-content mt-0.5 line-clamp-1 max-w-[80px]">
                  {grade}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="w-10 h-10 rounded-full border border-base-content/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-content transition-all duration-500">
              <ChevronRight
                className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TeacherCard;
