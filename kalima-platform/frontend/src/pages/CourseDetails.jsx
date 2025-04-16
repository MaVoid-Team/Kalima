import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getContainerById } from "../routes/lectures";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { FaRegCalendarCheck, FaRegStickyNote } from "react-icons/fa";

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-b-0 text-right">
    <span className="text-sm font-medium text-gray-800">{value}</span>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

const PlanSection = ({ month, items, isLastMonth }) => (
  <div className="mb-6 text-right">
    <div className="flex items-center gap-2 mb-2">
      <FaRegCalendarCheck className="text-gray-800 w-5 h-5" />
      <h3 className="text-lg font-bold text-gray-800">{month}</h3>
    </div>
    <ul className="text-sm text-gray-700 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaRegStickyNote className="text-gray-800 w-4 h-4" />
            <span className="font-medium">{item.lesson}</span>
          </div>
          <span className="bg-gray-100 border px-3 py-1 rounded-full">
            {item.time} دقيقة
          </span>
        </li>
      ))}
    </ul>
    {!isLastMonth && <div className="w-full h-px bg-gray-200 my-4"></div>}
  </div>
);

const PlanList = ({ months }) => (
  <div>
    {months.map((m, i) => (
      <PlanSection key={i} {...m} isLastMonth={i === months.length - 1} />
    ))}
  </div>
);

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await getContainerById(courseId);
        if (result) {
          setCourse(result.data);
        } else {
          setError("فشل في جلب بيانات الدورة");
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const fallbackPlan = [
    {
      month: "شهر أكتوبر",
      items: [
        { lesson: "الدرس الأول: مقدمة", time: 24 },
        { lesson: "الدرس الثاني: المفاهيم", time: 16 },
      ],
    },
    {
      month: "شهر نوفمبر",
      items: [{ lesson: "الدرس الثالث: التطبيقات", time: 30 }],
    },
  ];

  const detailsBox = useMemo(() => (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cyan-500 w-full max-w-sm">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">تفاصيل الكورس</h2>
      <div className="space-y-3">
        <DetailItem label="المدرس" value={course?.teacher || "أ. يوسف عثمان"} />
        <DetailItem label="عدد المحاضرات" value={course?.lecturesCount || 10} />
        <DetailItem
          label="الصف الدراسي"
          value={
            course?.level?.length
              ? course.level.map((l) => l.name).join("، ")
              : "الصف الثانوي"
          }
        />
        <DetailItem label="المشاهدات" value={`${course?.views || 1240} مشاهدة`} />
      </div>
      <button className="mt-6 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg">
        اشترك الآن
      </button>
    </div>
  ), [course]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-cyan-50 to-white py-10 px-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Sidebar with Course Details */}
        <div className="lg:col-span-1 flex flex-col items-center space-y-8">
          {detailsBox}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row-reverse items-center gap-6">
            <img
              src="/CourseDetails1.png"
              alt="Course Illustration"
              className="w-72 h-auto object-contain"
            />
            <div className="text-right w-full">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {course?.title || "دورة تعلم اللغة الإنجليزية"}
              </h1>
              <h2 className="text-md text-gray-700 mb-4">
                {course?.description || "تهدف الدورة لتطوير مهارات اللغة باستخدام الأنشطة والتمارين العملية."}
              </h2>
              <ul className="list-none text-sm text-gray-700 pr-4 space-y-2">
                {course?.objectives?.length ? (
                  course.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-teal-600">✔</span> {obj}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">✔</span> تنمية المفردات وتحسين استخدام القواعد
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">✔</span> تعزيز مهارات التحدث والاستماع
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">✔</span> تحسين مهارات القراءة والكتابة
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Plan Section */}
          <div className="bg-white shadow-md border-2 border-cyan-500 rounded-xl p-6 max-w-2xl ml-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">خطة الكورس</h3>
            <PlanList months={course?.plan?.length ? course.plan : fallbackPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}