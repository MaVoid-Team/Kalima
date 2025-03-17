"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Book, ChevronDown, Star, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllSubjects, getSubjectById } from "../routes/courses";
import { FilterDropdown } from "../../src/components/FilterDropdown";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { CourseCard } from "../components/CourseCard";
import { motion, AnimatePresence } from "framer-motion";

// Fake data for courses
const fakeCourses = [
  {
    id: 1,
    image: "/course-1.png",
    title: "كيمياء عامة",
    subject: "كيمياء",
    teacher: "أستاذ محمد",
    grade: "الصف الثالث الثانوي",
    rating: 5,
    stage: "المرحلة الثانوية",
    type: "شرح",
    status: "مجاني",
  },
  {
    id: 2,
    image: "/course-2.png",
    title: "أحب أن أتعلم",
    subject: "لغة إنجليزية",
    teacher: "أستاذ أحمد",
    grade: "الصف الثاني الثانوي",
    rating: 5,
    stage: "المرحلة الثانوية",
    type: "مراجعة",
    status: "مدفوع",
  },
  {
    id: 3,
    image: "/course-3.png",
    title: "أساسيات الفيزياء",
    subject: "فيزياء",
    teacher: "أستاذة سارة",
    grade: "الصف الأول الثانوي",
    rating: 5,
    stage: "المرحلة الثانوية",
    type: "تدريبات",
    status: "مجاني",
  },
];

export default function CoursesPage() {
  const [subjects, setSubjects] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [selectedCourseStatus, setSelectedCourseStatus] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch subjects from the API
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const result = await getAllSubjects();

      if (result.success && result.data.length > 0) {
        setSubjects(result.data);
        setFilteredCourses(generateCourseData(result.data));
      } else {
        // If no data is fetched, use fake data
        setFilteredCourses(fakeCourses);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("حدث خطأ أثناء تحميل البيانات");
      // If there's an error, use fake data
      setFilteredCourses(fakeCourses);
    } finally {
      setLoading(false);
    }
  };

  // Generate course data based on subjects from API
  const generateCourseData = (subjectsData) => {
    if (!subjectsData || subjectsData.length === 0) return fakeCourses;

    return subjectsData.map((subject, index) => ({
      id: subject._id,
      image: `/course-${(index % 6) + 1}.png`,
      title: subject.name,
      subject: subject.name,
      teacher: `أستاذ ${subject.name}`,
      grade: "الصف الأول",
      rating: 4 + (index % 2) * 0.5,
      stage: index % 3 === 0 ? "المرحلة الابتدائية" : index % 3 === 1 ? "المرحلة الإعدادية" : "المرحلة الثانوية",
      type: index % 3 === 0 ? "شرح" : index % 3 === 1 ? "مراجعة" : "تدريبات",
      status: index % 2 === 0 ? "مجاني" : "مدفوع",
    }));
  };

  // Apply filters to courses
  const applyFilters = useCallback(() => {
    let filtered = subjects.length > 0 ? generateCourseData(subjects) : fakeCourses;

    if (selectedStage) {
      filtered = filtered.filter((course) => course.stage === selectedStage);
    }

    if (selectedGrade) {
      filtered = filtered.filter((course) => course.grade === selectedGrade);
    }

    if (selectedTerm) {
      // Mock filter for term (not implemented in data)
      filtered = filtered.filter((course) => course.term === selectedTerm || !course.term);
    }

    if (selectedSubject) {
      filtered = filtered.filter((course) => course.subject === selectedSubject);
    }

    if (selectedCourseType) {
      filtered = filtered.filter((course) => course.type === selectedCourseType);
    }

    if (selectedCourseStatus) {
      filtered = filtered.filter((course) => course.status === selectedCourseStatus);
    }

    setFilteredCourses(filtered);
  }, [selectedStage, selectedGrade, selectedTerm, selectedSubject, selectedCourseType, selectedCourseStatus, subjects]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedStage("");
    setSelectedGrade("");
    setSelectedTerm("");
    setSelectedSubject("");
    setSelectedCourseType("");
    setSelectedCourseStatus("");
    setFilteredCourses(subjects.length > 0 ? generateCourseData(subjects) : fakeCourses);
  }, [subjects]);

  // Memoize filtered courses to avoid recalculating on every render
  const memoizedFilteredCourses = useMemo(() => filteredCourses, [filteredCourses]);

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
      label: "الصف الدراسي",
      value: selectedGrade,
      options: [
        { label: "الصف الأول", value: "الصف الأول" },
        { label: "الصف الثاني", value: "الصف الثاني" },
        { label: "الصف الثالث", value: "الصف الثالث" },
      ],
      onSelect: setSelectedGrade,
    },
    {
      label: "الترم الدراسي",
      value: selectedTerm,
      options: [
        { label: "الترم الأول", value: "الترم الأول" },
        { label: "الترم الثاني", value: "الترم الثاني" },
      ],
      onSelect: setSelectedTerm,
    },
    {
      label: "نوع الكورس",
      value: selectedCourseType,
      options: [
        { label: "شرح", value: "شرح" },
        { label: "مراجعة", value: "مراجعة" },
        { label: "تدريبات", value: "تدريبات" },
      ],
      onSelect: setSelectedCourseType,
    },
    {
      label: "حالة الكورس",
      value: selectedCourseStatus,
      options: [
        { label: "مجاني", value: "مجاني" },
        { label: "مدفوع", value: "مدفوع" },
      ],
      onSelect: setSelectedCourseStatus,
    },
  ];

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Pattern */}
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
        {/* Title Section */}
        <div className="container mx-auto px-4 pt-8 pb-4 text-end">
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">كورساتي</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between mb-4">
            <button className="btn btn-outline btn-sm rounded-md" onClick={resetFilters}>
              إعادة ضبط الفلاتر
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-primary btn-sm rounded-md">اختيارات البحث</button>
              <Search className="h-6 w-6" />
            </div>
          </div>

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

          <div className="flex justify-center mt-6">
            <button className="btn btn-accent btn-md rounded-full px-8" onClick={applyFilters}>
              <Search className="h-5 w-5 ml-2" />
              لعرض الكورسات
            </button>
          </div>
        </div>

        {/* Courses Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">اكتشف كورساتك المفضلة الآن!</h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} onRetry={fetchSubjects} />
          ) : memoizedFilteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">لا توجد كورسات متاحة حالياً</p>
              {(selectedStage || selectedGrade || selectedTerm || selectedSubject || selectedCourseType || selectedCourseStatus) && (
                <button className="btn btn-outline btn-sm mt-4" onClick={resetFilters}>
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {memoizedFilteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CourseCard
                      id={course.id}
                      image={course.image}
                      title={course.title}
                      subject={course.subject}
                      teacher={course.teacher}
                      grade={course.grade}
                      rating={course.rating}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}