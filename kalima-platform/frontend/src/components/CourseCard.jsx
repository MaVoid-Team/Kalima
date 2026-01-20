import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BookOpen, Star, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export const CourseCard = ({
  image,
  title,
  subject,
  teacher,
  teacherRole,
  grade,
  type,
  status,
  price,
  childrenCount,
  isRTL,
  containerImage,
}) => {
  const { t, i18n } = useTranslation("home");
  const [imageError, setImageError] = useState(false);

  const formatPrice = () => {
    if (typeof price !== "number") return t("priceUnavailable");
    if (price === 0) return t("free");
    const formattedNumber = price.toLocaleString(
      i18n.language === "ar" ? "ar-EG" : "en-US",
    );
    return i18n.language === "ar"
      ? `${formattedNumber} ${t("currency")}`
      : `${t("currency")} ${formattedNumber}`;
  };

  const statusText =
    status === "مجاني" || status === "free" ? t("free") : t("paid");

  const imageToDisplay =
    !imageError && containerImage
      ? containerImage
      : !imageError && image
        ? image
        : "/course1.png";

  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="group relative cursor-pointer h-full"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* The Gallery Frame */}
      <div className="relative bg-white rounded-[2.5rem] p-4 flex flex-col h-full transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.03)] group-hover:shadow-[0_22px_70px_rgba(0,0,0,0.1)] border border-base-content/5 group-hover:border-primary/30 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-1" />

        {/* Media Window */}
        <div className="relative overflow-hidden rounded-[2rem] aspect-[16/10] bg-base-200">
          <img
            src={imageToDisplay || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />

          {/* Status Badge */}
          <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}>
            <div
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg ${
                status === "مجاني" || status === "free"
                  ? "bg-emerald-500/80 text-white"
                  : "bg-white/30 text-white"
              }`}
            >
              {statusText}
            </div>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
              <ArrowUpRight className="w-5 h-5 text-base-content" />
            </div>
          </div>
        </div>

        {/* Text Details - Editorial Style */}
        <div className="mt-8 px-4 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">
                {subject} • {type}
              </span>
            </div>

            <h2 className="text-2xl font-black text-base-content tracking-tighter leading-[1.1] group-hover:text-primary transition-colors duration-300">
              {title}
            </h2>

            {/* Teacher Row */}
            <div
              className={`flex items-center gap-3 pt-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-[10px] font-black opacity-30">
                {teacher?.[0]}
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-xs font-black text-base-content/80 leading-none mb-1">
                  {teacher}
                </p>
                <p className="text-[9px] font-bold text-base-content/30 uppercase tracking-widest">
                  {teacherRole}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div
            className={`mt-8 pt-6 border-t border-base-content/5 flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-6 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-base-content/30 uppercase tracking-widest">
                  {isRTL ? "الدروس" : "Lessons"}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <BookOpen className="w-3 h-3 text-primary" />
                  <span className="text-xs font-black text-base-content">
                    {childrenCount}
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-base-content/5" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-base-content/30 uppercase tracking-widest">
                  {isRTL ? "التقييم" : "Rating"}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-base-content">
                    5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xl font-black text-base-content tracking-tighter">
              {formatPrice()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
