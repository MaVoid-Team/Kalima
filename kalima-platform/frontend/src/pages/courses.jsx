"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import { getAllContainers } from "../routes/lectures";
import { FilterDropdown } from "../../src/components/FilterDropdown";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { CourseCard } from "../components/CourseCard";
import { getAllLecturers } from "../routes/fetch-users";

export default function CoursesPage() {
  const [containers, setContainers] = useState([]);
  const [filteredContainers, setFilteredContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { t, i18n } = useTranslation("courses");
  const isRTL = i18n.language === "ar";

  // Filter states
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [selectedCourseStatus, setSelectedCourseStatus] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [lecturers, setLecturers] = useState([]);

useEffect(() => {
  fetchContainers();
  fetchLecturers();
}, []);

const fetchLecturers = async () => {
  try {
    const result = await getAllLecturers();
    if (result.success) {
      setLecturers(result.data);
    } else {
      console.error("Failed to fetch lecturers:", result.error);
    }
  } catch (err) {
    console.error("Error fetching lecturers:", err);
  }
};

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllContainers();
      console.log("API Response:", result);
      if (result.status === "success") {
        setContainers(result.data.containers);
        setFilteredContainers(result.data.containers);
      } else {
        setError(result.error || "Failed to fetch containers");
      }
    } catch (err) {
      console.error("Error fetching containers:", err);
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const generateCourseData = (containersData) =>
    containersData.map((container, index) => {
      const levelName = container.level?.name || "";
  
      let stage = "المرحلة الثانوية";
      switch (levelName) {
        case "Primary":
          stage = "المرحلة الابتدائية";
          break;
        case "Middle":
          stage = "المرحلة الإعدادية";
          break;
        case "Upper Primary":
          stage = "المرحلة الابتدائية العليا";
          break;
        case "Higher Secondary":
          stage = "المرحلة الثانوية";
          break;
      }
  
      const isFree = container.price === 0;
      const status = isFree ? "مجاني" : "مدفوع";
  
      let type = "شرح";
      switch (container.type) {
        case "course":
          type = "شرح";
          break;
        case "year":
          type = "سنة كاملة";
          break;
        case "term":
          type = "فصل دراسي";
          break;
        case "month":
          type = "شهر";
          break;
        default:
          type = container.type || "شرح";
      }
  
      const teacherId = container.createdBy?._id || container.createdBy;
      const matchedLecturer = lecturers.find((lecturer) => lecturer._id === teacherId);
  
      return {
        id: container._id,
        image: `/course-${(index % 6) + 1}.png`,
        title: container.name,
        subject: container.subject?.name || "",
        teacher: matchedLecturer?.name || "مدرس غير محدد",
        teacherRole: matchedLecturer?.role || "محاضر",
        grade: levelName,
        rating: 4 + (index % 2) * 0.5,
        stage,
        type,
        status,
        price: container.price || 0,
        childrenCount: container.children?.length || 0,
        containerType: container.type || "lecture",
      };
    });

  const applyFilters = useCallback(() => {
    let filtered = [...containers];

    if (selectedSubject) {
      filtered = filtered.filter((c) => c.subject?.name === selectedSubject);
    }

    if (selectedGrade) {
      filtered = filtered.filter((c) => c.level?.name === selectedGrade);
    }

    if (selectedCourseType) {
      let apiType = "course";
      switch (selectedCourseType) {
        case "شرح":
          apiType = "course";
          break;
        case "سنة كاملة":
          apiType = "year";
          break;
        case "فصل دراسي":
          apiType = "term";
          break;
        case "شهر":
          apiType = "month";
          break;
        default:
          apiType = selectedCourseType;
      }
      filtered = filtered.filter((c) => c.type === apiType);
    }

    if (selectedCourseStatus) {
      filtered = filtered.filter((c) =>
        selectedCourseStatus === "مجاني" ? c.price === 0 : c.price > 0
      );
    }

    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      filtered = filtered.filter((c) => c.price >= min && c.price <= max);
    }

    setFilteredContainers(filtered);
  }, [
    selectedGrade,
    selectedSubject,
    selectedCourseType,
    selectedCourseStatus,
    selectedPrice,
    containers,
  ]);

  const resetFilters = useCallback(() => {
    setSelectedStage("");
    setSelectedGrade("");
    setSelectedTerm("");
    setSelectedSubject("");
    setSelectedCourseType("");
    setSelectedCourseStatus("");
    setSelectedPrice("");
    setFilteredContainers(containers);
  }, [containers]);

  const memoizedFilteredCourses = useMemo(
    () => generateCourseData(filteredContainers),
    [filteredContainers]
  );

  const subjectOptions = useMemo(() => {
    const unique = new Set();
    containers.forEach((c) => c.subject?.name && unique.add(c.subject.name));
    return [...unique].map((s) => ({ label: s, value: s }));
  }, [containers]);

  const levelOptions = useMemo(() => {
    const unique = new Set();
    containers.forEach((c) => c.level?.name && unique.add(c.level.name));
    return [...unique].map((l) => ({ label: l, value: l }));
  }, [containers]);

  const typeOptions = useMemo(() => {
    const unique = new Set();
    containers.forEach((c) => c.type && unique.add(c.type));
    return [...unique].map((type) => {
      let label = type;
      switch (type) {
        case "course":
          label = "شرح";
          break;
        case "year":
          label = "سنة كاملة";
          break;
        case "term":
          label = "فصل دراسي";
          break;
        case "month":
          label = "شهر";
          break;
      }
      return { label, value: label };
    });
  }, [containers]);

  const priceOptions = [
    { label: "مجاني", value: "0-0" },
    { label: "أقل من 500 جنيه", value: "1-500" },
    { label: "500-1000 جنيه", value: "500-1000" },
    { label: "أكثر من 1000 جنيه", value: "1000-10000" },
  ];

  const filterOptions = [
    {
      label: t("filters.stage"),
      value: selectedStage,
      options: [
        { label: "المرحلة الابتدائية", value: "المرحلة الابتدائية" },
        { label: "المرحلة الإعدادية", value: "المرحلة الإعدادية" },
        { label: "المرحلة الثانوية", value: "المرحلة الثانوية" },
        { label: "المرحلة الابتدائية العليا", value: "المرحلة الابتدائية العليا" },
      ],
      onSelect: setSelectedStage,
    },
    {
      label: t("filters.grade"),
      value: selectedGrade,
      options: levelOptions,
      onSelect: setSelectedGrade,
    },
    {
      label: t("filters.subject"),
      value: selectedSubject,
      options: subjectOptions,
      onSelect: setSelectedSubject,
    },
    {
      label: t("filters.type"),
      value: selectedCourseType,
      options: typeOptions,
      onSelect: setSelectedCourseType,
    },
    {
      label: t("filters.status"),
      value: selectedCourseStatus,
      options: [
        { label: "مجاني", value: "مجاني" },
        { label: "مدفوع", value: "مدفوع" },
      ],
      onSelect: setSelectedCourseStatus,
    },
    {
      label: t("filters.price") || "السعر",
      value: selectedPrice,
      options: priceOptions,
      onSelect: setSelectedPrice,
    },
  ];

  return (
    <div className="relative min-h-screen w-full" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} w-2/3 h-screen pointer-events-none z-0`}>
        <div className="relative w-full h-full">
          <img
            src="/background-courses.png"
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-top opacity-50"
            style={{ maxWidth: "600px" }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <div className={`container mx-auto px-4 pt-8 pb-4 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">{t("title")}</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className={`flex justify-start`}>
            <button className="btn btn-outline btn-sm rounded-md mx-2" onClick={resetFilters}>
              {t("filters.reset")}
            </button>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button className="btn btn-primary btn-sm rounded-md">{t("search.options")}</button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl ${isRTL ? "ml-auto" : "mr-auto"} mt-4`}>
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
              className={`btn btn-accent btn-md rounded-full px-8 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={applyFilters}
            >
              <Search className="h-5 w-5 ml-2" />
              {t("showCourses")}
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold text-center mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            {t("discover")}
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} onRetry={fetchContainers} />
          ) : memoizedFilteredCourses.length === 0 ? (
            <div className={`text-center py-12 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-lg">{t("noCourses")}</p>
              {(selectedStage || selectedGrade || selectedTerm || selectedSubject || selectedCourseType || selectedCourseStatus || selectedPrice) && (
                <button className="btn btn-outline btn-sm mt-4" onClick={resetFilters}>
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
                    <Link to={`/courses/${course.id}`}>
                      <CourseCard {...course} isRTL={isRTL} />
                    </Link>
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
