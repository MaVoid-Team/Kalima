import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getSubjectById } from "../routes/courses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import {
  FaDoorOpen,
  FaSearch,
  FaRegStickyNote,
  FaRegCalendarCheck,
} from "react-icons/fa";

// Placeholder values and functions to avoid runtime errors (you need to implement these)
const t = (key) => key; // Replace with i18n
const lectures = []; // Replace with actual lectures
const handleLectureClick = () => {};
const LecturesList = () => <></>;
const isRTL = true;

const months = [
  {
    month: "يناير",
    items: [
      { lesson: "الدرس الأول: مقدمة إلى React", time: 30 },
      { lesson: "الدرس الثاني: مكونات React", time: 45 },
    ],
  },
  {
    month: "فبراير",
    items: [
      { lesson: "الدرس الأول: حالة المكونات", time: 30 },
      { lesson: "الدرس الثاني: الأحداث في React", time: 45 },
    ],
  },
];

const DetailItem = ({ label, value, isRTL }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-center gap-4 py-2 border-b border-base-300 last:border-b-0"
  >
    <span className="text-sm text-base-content">{value}</span>
    <span className={`font-semibold text-sm text-base-content/70 ${isRTL ? "text-left" : "text-right"}`}>
      {label}
    </span>
  </motion.div>
);

const PlanSection = ({ month, items, isLastMonth }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.8, duration: 0.5 }}
    className="mb-6"
    style={{ direction: "rtl" }}
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
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <FaRegStickyNote className="text-base-content w-4 h-4 flex-shrink-0" />
            <span className="break-words font-semibold">{item.lesson}</span>
          </div>
          <span className="font-semibold text-base-content/70 sm:bg-transparent bg-primary text-white rounded-full px-3 py-1 whitespace-nowrap">
            {item.time} دقيقة
          </span>
        </motion.li>
      ))}
    </ul>
    {!isLastMonth && <div className="w-full h-px bg-base-300 my-4"></div>}
  </motion.div>
);

const PlanList = ({ months }) => (
  <div>
    {months.map((monthData, index) => (
      <PlanSection
        key={index}
        month={monthData.month}
        items={monthData.items}
        isLastMonth={index === months.length - 1}
      />
    ))}
  </div>
);

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const result = await getSubjectById(courseId);
        console.log("Full API response:", result);
        if (result.success) {
          setCourse(result.data);
        } else {
          setError(result.error || "Failed to fetch course details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const courseDetailsContent = useMemo(() => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="bg-base-100 shadow-lg rounded-lg p-6 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-sm"
    >
      <h2 className="text-xl font-bold text-base-content text-center mb-4">تفاصيل الكورس</h2>
      <div className="w-full h-px bg-base-300 mb-4" />
      <div className="space-y-4">
        <DetailItem label="المدرس" value={course?.teacher || "أ.يوسف عثمان"} isRTL={isRTL} />
        <DetailItem label="عدد المحاضرات" value={`${course?.lecturesCount || 10}`} isRTL={isRTL} />
        <DetailItem
          label="الصف الدراسي"
          value={course?.level?.map((l) => l.name).join("، ") || "الصف الثانوي"}
          isRTL={isRTL}
        />
        <DetailItem label="المشاهدات" value={`${course?.views || 1240} مشاهدة`} isRTL={isRTL} />
      </div>
    </motion.div>
  ), [course]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-base-200"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="container mx-auto px-4 pt-4 mb-8 text-end"
        >
          <div className="relative inline-block">
            <p className="flex items-center gap-x-4 text-3xl font-bold text-base-content md:mx-40 relative z-10">
              <FaSearch />
              كورساتي
            </p>
            <img
              src="/underline.png"
              alt="underline"
              className="absolute bottom-0 left-0 w-full h-auto object-contain z-0"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t("courseContent")}</h2>
                <span className="badge badge-primary">{lectures.length} {t("lectures")}</span>
              </div>
              <LecturesList lectures={lectures} onLectureClick={handleLectureClick} isRTL={isRTL} />
            </motion.div>
          </div>

          <div className="space-y-6">
            {courseDetailsContent}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-base-100 p-6 rounded-lg shadow-md border border-primary"
            >
              <h3 className="text-lg font-bold mb-4 text-center">{t("enrollNow")}</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary w-full"
              >
                <FaDoorOpen className={isRTL ? "ml-2" : "mr-2"} />
                {t("exploreCourses")}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-lg shadow-sm w-full h-[300px] md:h-[400px] hover:bg-secondary hover:text-secondary-content transition-colors duration-300 overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: "1/1" }}
              >
                <img
                  src={course?.image || "/CourseDetails1.png"}
                  alt="Course cover"
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
            <h4 className="text-lg mb-2 font-semibold text-base-content text-right">
              <span className="font-bold">اسم الدورة:</span> {course?.subject?.name || "اللغة الإنجليزية"}
            </h4>
            <h4 className="text-lg font-bold text-base-content text-right">: وصف الدورة</h4>
            <p className="text-sm font-semibold text-base-content mb-4 text-right">
              {course?.description || "تهدف هذه الدورة إلى تطوير مهارات المتعلمين..."}
              <br />
              <span className="text-sm font-normal inline-block text-base-content">
                المستوى: {course?.subject?.level?.map((l) => l.name).join(" / ") || "مبتدئ / متوسط / متقدم"}
              </span>
            </p>
            <div className="flex flex-col items-end mb-4 text-right">
              <span className="text-lg font-semibold text-base-content">
                المدة: {course?.duration || "10 أسابيع"}
              </span>
            </div>

            <div className="space-y-2 text-right">
              <h4 className="text-lg font-bold text-base-content">أهداف الدورة:</h4>
              <ul className="list-disc list-inside text-sm font-semibold text-base-content pr-4">
                {course?.objectives?.length > 0 ? (
                  course.objectives.map((obj, index) => <li key={index}>{obj}</li>)
                ) : (
                  <>
                    <li>تنمية المفردات وتحسين استخدام القواعد</li>
                    <li>تعزيز مهارات التحدث والاستماع بثقة</li>
                    <li>تحسين مهارات القراءة والكتابة</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="text-xl font-bold text-base-content text-right mb-6">خطة الكورس</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-base-100 text-primary shadow-lg rounded-lg px-6 py-2 border-t-[3px] border-l-[3px] border-r-[1px] border-b-[1px] border-primary w-full max-w-2xl ml-auto relative"
            >
              <div className="absolute top-4 left-2 w-[100px] h-[100px] rounded-tl-lg">
                <img src="/CourseDetails2.png" alt="Decorative" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-end">
                <div className="w-full md:w-4/6 pl-4">
                  <PlanList months={course?.plan || months} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
