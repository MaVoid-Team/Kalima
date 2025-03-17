"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Loader } from "lucide-react";
import { getAllUsers } from "../routes/fetch-users";
import { motion, AnimatePresence } from "framer-motion";
import TeacherCard from "../components/TeacherCard";

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleTeachers, setVisibleTeachers] = useState(3);
  const [sortBy, setSortBy] = useState("name"); // Default sort by name

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();

      if (result.success) {
        const lecturers = result.data
          .filter((user) => user.role === "Lecturer")
          .map((lecturer) => ({
            id: lecturer._id,
            image: "/course-1.png",
            name: lecturer.name,
            subject: lecturer.expertise || "مدرس",
            experience: lecturer.bio || "خبرة واسعة في التدريس",
            grade: "كل المراحل الدراسية",
            rating: 5,
          }));

        setTeachers(lecturers);
      } else {
        setError("تعذر تحميل بيانات المدرسين");
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTeachers = () => {
    setVisibleTeachers(teachers.length);
  };

  // Memoize sorted teachers to avoid recalculating on every render
  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "subject") {
        return a.subject.localeCompare(b.subject);
      } else if (sortBy === "rating") {
        return b.rating - a.rating; // Higher rating first
      }
      return 0;
    });
  }, [teachers, sortBy]);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Pattern - Positioned on the left */}
      <div className="absolute top-0 left-0 w-2/3 h-screen pointer-events-none z-0">
        <div className="relative w-full h-full">
          <img
            src="/background-courses.png"
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-top opacity-50"
            style={{ maxWidth: "600px" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Title Section - Centered */}
        <div className="container mx-auto px-4 pt-8 pb-4 text-end">
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">معلمينا</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end mb-6">
            <select
              className="select select-bordered w-full max-w-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">الاسم</option>
              <option value="subject">المادة</option>
              <option value="rating">التقييم</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
              <button className="btn btn-sm btn-outline" onClick={fetchTeachers}>
                حاول مرة أخرى
              </button>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">لا يوجد مدرسين متاحين في الوقت الحالي</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence>
                  {sortedTeachers.slice(0, visibleTeachers).map((teacher) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TeacherCard teacher={teacher} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {visibleTeachers < teachers.length && (
                <div className="flex justify-center mt-8">
                  <button
                    className="btn btn-primary rounded-full"
                    onClick={loadMoreTeachers}
                  >
                    عرض المزيد من المدرسين
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}