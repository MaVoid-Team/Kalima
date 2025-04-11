"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllSubjects } from "../routes/courses";
import { FilterDropdown } from "../../src/components/FilterDropdown";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { CourseCard } from "../components/CourseCard";
import { motion, AnimatePresence } from "framer-motion";


// Fake data for courses
const fakeCourses = [
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
  const { t, i18n } = useTranslation("courses");
  const isRTL = i18n.language === 'ar';
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

      if (result.success && result.data?.data?.subjects?.length > 0) {
        const subjectsData = result.data.data.subjects;
        setSubjects(subjectsData);
        setFilteredCourses(generateCourseData(subjectsData));
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

    return subjectsData.map((subject, index) => {
      // Determine stage based on subject's level array if available
      let stage = "المرحلة الثانوية"; // Default
      if (subject.level && subject.level.length > 0) {
        const levelName = subject.level[0].name;
        if (levelName === "Primary" || levelName === "Upper Primary") {
          stage = "المرحلة الابتدائية";
        } else if (levelName === "Middle") {
          stage = "المرحلة الإعدادية";
        }
      } else {
        // Fallback to the original logic if level is not available
        stage =
          index % 3 === 0
            ? "المرحلة الابتدائية"
            : index % 3 === 1
            ? "المرحلة الإعدادية"
            : "المرحلة الثانوية";
      }

      return {
        id: subject._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: subject.name,
        subject: subject.name,
        teacher: `أستاذ ${subject.name}`,
        grade: "الصف الأول",
        rating: 4 + (index % 2) * 0.5,
        stage: stage,
        type: index % 3 === 0 ? "شرح" : index % 3 === 1 ? "مراجعة" : "تدريبات",
        status: index % 2 === 0 ? "مجاني" : "مدفوع",
      };
    });
  };

  // Apply filters to courses
  const applyFilters = useCallback(() => {
    let filtered =
      subjects.length > 0 ? generateCourseData(subjects) : fakeCourses;

    if (selectedStage) {
      filtered = filtered.filter((course) => course.stage === selectedStage);
    }

    if (selectedGrade) {
      filtered = filtered.filter((course) => course.grade === selectedGrade);
    }

    if (selectedTerm) {
      // Mock filter for term (not implemented in data)
      filtered = filtered.filter(
        (course) => course.term === selectedTerm || !course.term
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (course) => course.subject === selectedSubject
      );
    }

    if (selectedCourseType) {
      filtered = filtered.filter(
        (course) => course.type === selectedCourseType
      );
    }

    if (selectedCourseStatus) {
      filtered = filtered.filter(
        (course) => course.status === selectedCourseStatus
      );
    }

    setFilteredCourses(filtered);
  }, [
    selectedStage,
    selectedGrade,
    selectedTerm,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    subjects,
  ]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedStage("");
    setSelectedGrade("");
    setSelectedTerm("");
    setSelectedSubject("");
    setSelectedCourseType("");
    setSelectedCourseStatus("");
    setFilteredCourses(
      subjects.length > 0 ? generateCourseData(subjects) : fakeCourses
    );
  }, [subjects]);

  // Memoize filtered courses to avoid recalculating on every render
  const memoizedFilteredCourses = useMemo(
    () => filteredCourses,
    [filteredCourses]
  );

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: t("stages.primary"), value: "primary" },
        { label: t("stages.middle"), value: "middle" },
        { label: t("stages.secondary"), value: "secondary" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: t("filters.grade"),
      value: selectedGrade,
      options: [
        { label: t("grades.first"), value: "first" },
        { label: t("grades.second"), value: "second" },
        { label: t("grades.third"), value: "third" },
      ],
      onSelect: setSelectedGrade,
    },
    {
      label: t("filters.term"),
      value: selectedTerm,
      options: [
        { label: t("terms.first"), value: "first" },
        { label: t("terms.second"), value: "second" },
      ],
      onSelect: setSelectedTerm,
    },
    {
      label: t("filters.type"),
      value: selectedCourseType,
      options: [
        { label: t("types.explanation"), value: "explanation" },
        { label: t("types.review"), value: "review" },
        { label: t("types.exercises"), value: "exercises" },
      ],
      onSelect: setSelectedCourseType,
    },
    {
      label: t("filters.status"),
      value: selectedCourseStatus,
      options: [
        { label: t("status.free"), value: "free" },
        { label: t("status.paid"), value: "paid" },
      ],
      onSelect: setSelectedCourseStatus,
    },
  ];

  return (
    <div className="relative min-h-screen w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Pattern */}
      <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-2/3 h-screen pointer-events-none z-0`}>
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
        <div className={`container mx-auto px-4 pt-8 pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">{t("title")}</p>
            <img
              src="/underline.png"
              alt="underline"
              className="object-contain"
            />
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="container mx-auto px-4 py-4">
          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'} mb-4`}>
            <button
              className="btn btn-outline btn-sm rounded-md mx-2"
              onClick={resetFilters}
            >
              {t("filters.reset")}
            </button>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="btn btn-primary btn-sm rounded-md">
                {t("search.options")}
              </button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
            {filterOptions.map((filter) => (
              <FilterDropdown
                key={filter.label}
                label={filter.label}
                options={filter.options}
                selectedValue={filter.value}
                onSelect={filter.onSelect}
                isRTL={isRTL}
              />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              className={`btn btn-accent btn-md rounded-full px-8 ${isRTL ? 'flex-row-reverse' : ''}`}
              onClick={applyFilters}
            >
              <Search className="h-5 w-5 ml-2" />
              {t("showCourses")}
            </button>
          </div>
        </div>

        {/* Courses Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold text-center mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("discover")}
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} onRetry={fetchSubjects} />
          ) : memoizedFilteredCourses.length === 0 ? (
            <div className={`text-center py-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-lg">{t("noCourses")}</p>
              {(selectedStage || selectedGrade || selectedTerm || selectedSubject || selectedCourseType || selectedCourseStatus) && (
                <button
                  className="btn btn-outline btn-sm mt-4"
                  onClick={resetFilters}
                >
                  {t("filters.reset")}
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
                      {...course}
                      isRTL={isRTL}
                      type={t(`types.${course.type}`)}
                      status={t(`status.${course.status}`)}
                      stage={t(`stages.${course.stage}`)}
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