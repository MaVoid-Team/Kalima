import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getSubjectById } from "../routes/courses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { FaDoorOpen, FaSearch, FaRegStickyNote, FaRegCalendarCheck } from "react-icons/fa";

const DetailItem = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-center"
  >
    <span className="text-sm text-base-content/70">{value}</span>
    <span className="font-semibold text-sm text-base-content">: {label}</span>
  </motion.div>
);

const PlanSection = ({ month, items, isLastMonth, isRTL }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="mb-6"
    style={{ direction: isRTL ? "rtl" : "ltr" }}
  >
    <div className="flex items-center gap-2 mb-2">
      <FaRegCalendarCheck className="text-base-content w-5 h-5" />
      <h3 className="text-lg font-bold text-base-content">{month}</h3>
    </div>
    <ul className="list-none text-xs text-base-content space-y-2">
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <FaRegStickyNote className="text-base-content w-4 h-4 flex-shrink-0" />
            <span className="break-words font-semibold">{item.lesson}</span>
          </div>
          <span className="font-semibold text-base-content/70 sm:text-base-content/70 sm:bg-transparent sm:px-0 sm:py-0 bg-primary text-white rounded-full px-3 py-1 whitespace-nowrap">
            {item.time} {isRTL ? "دقيقة" : "min"}
          </span>
        </motion.li>
      ))}
    </ul>
    {!isLastMonth && <div className="w-full h-px bg-base-300 my-4"></div>}
  </motion.div>
);

const PlanList = ({ months, isRTL }) => (
  <div>
    {months.map((monthData, index) => (
      <PlanSection
        key={index}
        month={monthData.month}
        items={monthData.items}
        isLastMonth={index === months.length - 1}
        isRTL={isRTL}
      />
    ))}
  </div>
);

export default function CourseDetails() {
  const { t, i18n } = useTranslation("courseDetails");
  const isRTL = i18n.language === 'ar';
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const months = t('plan.months', { returnObjects: true });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const result = await getSubjectById(courseId);
        if (result.success) {
          setCourse(result.data);
        } else {
          setError(result.error || t('errors.fetchError'));
        }
      } catch (err) {
        setError(t('errors.unexpected'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, t]);

  const courseDetailsContent = useMemo(() => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="bg-base-100 shadow-lg rounded-lg p-6 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-sm"
      dir={isRTL ? 'ltr' : 'rtl'}
    >
      <h2 className="text-xl font-bold text-base-content text-center mb-4">
        {t('details.title')}
      </h2>
      <div className="w-full h-px bg-base-300 mb-4" />
      <div className="space-y-4">
        <DetailItem label={t('details.teacher')} value={t('details.teacherName')} />
        <DetailItem label={t('details.lectures')} value={t('details.lecturesCount')} />
        <DetailItem label={t('details.grade')} value={t('details.gradeLevel')} />
        <DetailItem label={t('details.views')} value={t('details.viewsCount')} />
      </div>
    </motion.div>
  ), [t]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} onRetry={() => window.location.reload()} />;

  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen w-full bg-base-200"
    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
  >
    <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="container mx-auto px-4 pt-4 mb-8"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
        >
          <div className="relative inline-block">
            <p className="flex items-center gap-x-4 text-3xl font-bold text-base-content md:mx-40 relative z-10">
              <FaSearch />
              {t('header.title')}
            </p>
            <img src="/underline.png" alt="underline" className="absolute bottom-0 left-0 w-full h-auto object-contain z-0" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="flex flex-col items-center"
  >
    {courseDetailsContent}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-6"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        className={`flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-focus transition duration-300 text-sm ${
          isRTL ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        <FaDoorOpen size={16} className="text-white" />
        {t('buttons.subscribe')}
      </motion.button>
    </motion.div>
  </motion.div>

  <motion.div
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="flex items-center justify-center"
  >
    <motion.div
      whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--b2))", color: "hsl(var(--s2))" }}
      className="rounded-lg shadow-sm w-full h-[300px] md:h-[400px] hover:bg-secondary hover:text-secondary-content transition-colors duration-300 overflow-hidden flex items-center justify-center"
      style={{ aspectRatio: "1/1" }}
    >
      <img
        src="/CourseDetails1.png"
        alt={t('courseDescription.imageAlt')}
        className="rounded-lg max-w-full max-h-full object-contain"
      />
    </motion.div>
  </motion.div>
</div>

<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.6, duration: 0.5 }}
  className="mb-12"
>
  <h4 className={`text-lg mb-2 font-semibold text-base-content ${isRTL ? 'text-right' : 'text-left'}`}>
    <span className="font-bold">{t('courseDescription.title')}</span> {t('courseDescription.name')}
  </h4>
  <h4 className={`text-lg font-bold text-base-content ${isRTL ? 'text-right' : 'text-left'}`}>
    {t('courseDescription.descriptionTitle')}
  </h4>
  <p className={`text-sm font-semibold text-base-content mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
    {t('courseDescription.description')}
    <span className="text-sm font-normal inline-block text-base-content block mt-2">
      {t('courseDescription.level')}
    </span>
  </p>
  <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} mb-4`}>
    <span className="text-lg font-semibold text-base-content">
      {t('courseDescription.duration')}
    </span>
  </div>
  <div className="space-y-2" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
    <h4 className="text-lg font-bold text-base-content">
      {t('courseDescription.objectivesTitle')}
    </h4>
    <ul className={`list-disc ${
      isRTL ? 'pr-4 list-inside' : 'pl-4 list-outside'
    } text-sm font-semibold text-base-content`}>
      {t('courseDescription.objectives', { returnObjects: true }).map((obj, index) => (
        <li key={index}>{obj}</li>
      ))}
    </ul>
  </div>
</motion.div>

<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.6, duration: 0.5 }}
  className="mb-12"
>
  <h3 className={`text-xl font-bold text-base-content mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
    {t('plan.title')}
  </h3>
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-base-100 text-primary shadow-lg rounded-lg px-6 py-2 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-2xl ${
      isRTL ? 'ml-auto' : 'mr-auto'
    } relative`}
  >
    <div className={`absolute top-4 ${isRTL ? 'left-2' : 'right-2'} w-[100px] h-[100px] rounded-tl-lg`}>
      <img 
        src="/CourseDetails2.png" 
        alt={t('plan.decorationAlt')} 
        className="w-full h-full object-cover" 
      />
    </div>
    <div className="flex justify-end">
      <div className={`w-full md:w-4/6 ${isRTL ? 'pl-4' : 'pr-4'}`}>
        <PlanList months={months} isRTL={isRTL} />
      </div>
    </div>
  </motion.div>
</motion.div>
</div>
</motion.div>
  );
}

