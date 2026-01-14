import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Award, Star, Bookmark, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState } from "react";

function TeacherCard({ teacher }) {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />

      <div className="relative bg-base-100 rounded-3xl overflow-hidden border-2 border-base-300/50 group-hover:border-secondary/50 transition-colors shadow-lg">
        {/* Image Section with Overlay Content */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={teacher.image || "/placeholder.svg"}
            alt={`${t('alts.teacherProfile')} ${teacher.name}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-base-content/90 via-base-content/40 to-transparent" />

          {/* Subject Badge */}
          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
            <div className="px-3 py-1.5 bg-secondary/90 backdrop-blur-sm text-white rounded-full border border-white/20 shadow-lg">
              <span className="text-xs font-bold font-[family-name:var(--font-malmoom)]">
                {t(`${teacher.subject}`)}
              </span>
            </div>
          </div>

          {/* Bookmark Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 bg-base-100/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-base-300/50 hover:border-secondary/50 transition-colors`}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-secondary text-secondary' : 'text-base-content'}`}
            />
          </motion.button>

          {/* Rating Badge */}
          <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'}`}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-sm font-bold text-white font-[family-name:var(--font-bigx)]">
                {teacher.rating}
              </span>
            </div>
          </div>

          {/* Teacher Name & Experience - Overlaid on Image */}
          <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} max-w-[60%] ${isRTL ? 'text-left' : 'text-right'}`}>
            <h4 className="text-white font-bold text-xl mb-1 font-[family-name:var(--font-headline)] drop-shadow-lg">
              {teacher.name}
            </h4>
            <p className="text-white/90 text-xs font-[family-name:var(--font-malmoom)] drop-shadow-md">
              {t(`${teacher.experience}`)}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Grade Info */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-base-content/60 font-[family-name:var(--font-malmoom)]">
                  {isRTL ? "المرحلة" : "Grade"}
                </p>
                <p className="text-sm font-semibold font-[family-name:var(--font-body)] truncate">
                  {teacher.grade}
                </p>
              </div>
            </div>

            {/* Expertise Badge */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/teacher-details/${teacher.id}`)}
            className={`w-full btn btn-secondary rounded-xl gap-2 font-[family-name:var(--font-handicrafts)] relative overflow-hidden group/btn ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative">{t('buttons.viewDetails')}</span>
            <ArrowRight className={`w-4 h-4 relative ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
}

export default TeacherCard;