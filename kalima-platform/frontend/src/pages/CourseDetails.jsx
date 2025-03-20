import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getSubjectById } from "../routes/courses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { FaArrowRight, FaDoorOpen, FaSearch } from "react-icons/fa";

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const result = await getSubjectById(courseId);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert error={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gray-50"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="container mx-auto px-4 pt-8 pb-4 text-end">
          <div className="relative inline-block">
            <p className="flex items-center gap-x-4 text-3xl font-bold text-gray-800 md:mx-40">

              <FaSearch />
              كورساتي
            </p>
            <img
              src="/underline.png"
              alt="underline"
              className="object-contain"
            />
          </div>
        </div>

        {/* Course Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Course Info */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-l-4 border-r-2 border-b-2 border-primary w-full max-w-sm">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-bold text-gray-800 text-center mb-4"
              >
                تفاصيل الكورس
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full h-px bg-gray-300 mb-4"
              />
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-4"
              >
                <DetailItem label="المدرس" value="أ.يوسف عثمان" />
                <DetailItem label="عدد المحاضرات" value="10" />
                <DetailItem label="الصف الدراسي" value="الصف الثانوي" />
                <DetailItem label="المشاهدات" value="1240 مشاهدة" />
              </motion.div>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6"
            >
              <button className="flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition duration-300 text-sm">
              <FaDoorOpen size={16} className="text-white" />
              اشترك الآن
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Course Image */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center"
          >
            <img
              src="/photo_2025-03-20_22-52-46.png"
              alt="Teacher with books"
              className="rounded-lg shadow-lg w-full h-auto max-w-md"
            />
          </motion.div>
        </div>

        {/* Course Description Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-right">
            اسم الدورة: اللغة الإنجليزية
          </h2>
          <p className="text-sm text-gray-800 mb-4 text-right">
            تهدف هذه الدورة إلى تطوير مهارات المتعلمين في اللغة الإنجليزية من
            حيث القراءة، الكتابة، الاستماع، والتحدث. تشمل الدورة قواعد اللغة
            الأساسية، المفردات، والنطق، مع التركيز على استخدام اللغة في المواقف
            اليومية.
          </p>
          <div className="flex flex-col items-end mb-4 text-right">
            <span className="text-sm text-gray-800">
              المستوى: مبتدئ / متوسط / متقدم
            </span>
            <span className="text-sm text-gray-800">المدة: 10 أسابيع</span>
          </div>
          <div className="space-y-2" style={{ direction: "rtl" }}>
            <h3 className="text-lg font-semibold text-gray-800">
              أهداف الدورة:
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-800 pr-4">
              <li>تنمية المفردات وتحسين استخدام القواعد</li>
              <li>تعزيز مهارات التحدث والاستماع بثقة</li>
              <li>تحسين مهارات القراءة والكتابة</li>
            </ul>
          </div>
        </motion.div>

        {/* Course Plan Section - Right Aligned */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-gray-800 text-right mb-6">
            خطة الكورس
          </h2>
          <div className="bg-white text-primary shadow-lg rounded-lg p-6 border-t-4 border-l-4 border-r-2 border-b-2 border-primary w-full max-w-2xl ml-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-6 text-right"
            >
              <PlanSection
                month="أكتوبر"
                items={[
                  "24 دقيقة - الدرس: النجاح والتقريب بالنفس",
                  "16 دقيقة - الدرس: الأرقام والأوطن",
                ]}
              />
              <PlanSection
                month="نوفمبر"
                items={["30 دقيقة - الدرس: المدخلات اليومية في السوق"]}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Reusable DetailItem Component
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{value}</span>
    <span className="font-semibold text-sm text-gray-800">: {label}</span>
  </div>
);

// Reusable PlanSection Component
const PlanSection = ({ month, items }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800">{month}</h3>
    <ul
      className="list-disc list-inside text-sm text-gray-600 pr-4"
      style={{ direction: "rtl" }}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);
