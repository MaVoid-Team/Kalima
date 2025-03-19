"use client";

import { useState, useEffect } from "react";
import { FileText, Clock, ChevronLeft, Star, Loader } from 'lucide-react';
import { getAllUsers } from "../../routes/fetch-users";

export function TeachersSection() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleTeachers, setVisibleTeachers] = useState(3); // Number of teachers to display initially

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();

      if (result.success) {
        // Filter users with role "Lecturer" and map to the expected format
        const lecturers = result.data
          .filter((user) => user.role === "Lecturer")
          .map((lecturer) => ({
            id: lecturer._id,
            image: "/course-1.png", // You can add a default image or use a field from API if available
            name: lecturer.name,
            subject: lecturer.expertise || "معلم", // Use expertise as subject
            experience: lecturer.bio || "معلم خبير", // Use bio or a default text
            grade: "جميع المراحل", // Default value since API doesn't provide this
            rating: 5, // Default rating
          }));

        setTeachers(lecturers);
      } else {
        setError("فشل في تحميل بيانات المعلمين");
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTeachers = () => {
    // Show all teachers when button is clicked
    setVisibleTeachers(teachers.length);
  };

  return (
    <section className="md:p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">معلمينا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          شوف كل معلمين{" "}
          <span className="text-primary border-b-2 border-primary pb-1">
            منصتنا
          </span>
        </h3>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchTeachers}>
              إعادة المحاولة
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg">لا يوجد معلمين متاحين حالياً</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teachers.slice(0, visibleTeachers).map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>

            {visibleTeachers < teachers.length && (
              <div className="flex justify-center mt-8">
                <button
                  className="btn btn-primary rounded-full"
                  onClick={loadMoreTeachers}
                >
                  عرض المزيد من المعلمين
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div className="rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl shadow-lg duration-500">
      <div className="relative">
        <img
          src={teacher.image || "/placeholder.svg"}
          alt={teacher.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {teacher.subject}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2 text-right">{teacher.name}</h4>
        <div className="flex justify-end items-center gap-2 mb-2">
          <span className="text-sm">{teacher.experience}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mb-4">
          <span className="text-sm">{teacher.grade}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <FileText className="h-3 w-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex">
            {[...Array(teacher.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <button className="btn btn-sm btn-primary rounded-full">
            عرض الملف
          </button>
        </div>
      </div>
    </div>
  );
}