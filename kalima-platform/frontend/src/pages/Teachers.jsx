"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, Loader, Search } from "lucide-react";
import { getAllUsers } from "../routes/fetch-users";
import { motion, AnimatePresence } from "framer-motion";
import TeacherCard from "../components/TeacherCard";
import { FilterDropdown } from "../../src/components/FilterDropdown";

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleTeachers, setVisibleTeachers] = useState(3);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(""); // Filter by name
  const [selectedSubject, setSelectedSubject] = useState(""); // Filter by subject
  const [selectedStage, setSelectedStage] = useState(""); // Filter by المرحلة الدراسية

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
        setFilteredTeachers(lecturers);
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
    setVisibleTeachers(filteredTeachers.length);
  };

  // Apply filters to teachers
  const applyFilters = useCallback(() => {
    let filtered = teachers;

    // Filter by name (search term)
    if (searchTerm) {
      filtered = filtered.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter((teacher) => teacher.subject === selectedSubject);
    }

    // Filter by المرحلة الدراسية
    if (selectedStage) {
      filtered = filtered.filter((teacher) => teacher.grade === selectedStage);
    }

    setFilteredTeachers(filtered);
  }, [searchTerm, selectedSubject, selectedStage, teachers]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSubject("");
    setSelectedStage("");
    setFilteredTeachers(teachers);
  }, [teachers]);

  // Memoize filtered teachers to avoid recalculating on every render
  const sortedTeachers = useMemo(() => {
    return [...filteredTeachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTeachers]);

  // Filter options for المرحلة الدراسية and المادة
  const filterOptions = [
    {
      label: "المرحلة الدراسية",
      value: selectedStage,
      options: [
        { label: "المرحلة الابتدائية", value: "المرحلة الابتدائية" },
        { label: "المرحلة الإعدادية", value: "المرحلة الإعدادية" },
        { label: "المرحلة الثانوية", value: "المرحلة الثانوية" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: "المادة",
      value: selectedSubject,
      options: [
        { label: "رياضيات", value: "رياضيات" },
        { label: "فيزياء", value: "فيزياء" },
        { label: "كيمياء", value: "كيمياء" },
      ],
      onSelect: setSelectedSubject,
    },
  ];

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

        {/* Search and Filters Section */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end mb-4">
            <button
              className="btn btn-outline btn-sm rounded-md mx-2"
              onClick={resetFilters}
            >
              إعادة ضبط الفلاتر
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-primary btn-sm rounded-md">
                اختيارات البحث
              </button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          {/* Search by Name Input */}
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="ابحث بالاسم"
              className="input input-bordered w-full max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl ml-auto">
            {filterOptions.map((filter) => (
              <FilterDropdown
                key={filter.label}
                label={filter.label}
                options={filter.options}
                selectedValue={filter.value}
                onSelect={filter.onSelect}
              />
            ))}
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-center mt-6">
            <button
              className="btn btn-accent btn-md rounded-full px-8"
              onClick={applyFilters}
            >
              <Search className="h-5 w-5 ml-2" />
              لعرض المدرسين
            </button>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            اكتشف مدرسيك المفضلين الآن!
          </h2>

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
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">لا يوجد مدرسين متاحين حالياً</p>
              {(searchTerm || selectedSubject || selectedStage) && (
                <button
                  className="btn btn-outline btn-sm mt-4"
                  onClick={resetFilters}
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
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

              {visibleTeachers < filteredTeachers.length && (
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