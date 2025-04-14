"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getSubjectById, getLecturesBySubject } from "../routes/courses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import { FaDoorOpen, FaSearch, FaRegStickyNote, FaArrowLeft } from "react-icons/fa";

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

const LectureItem = ({ lecture, onClick, isRTL }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:bg-base-200 p-3 rounded-md transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <FaRegStickyNote className="text-primary w-4 h-4 flex-shrink-0" />
      <span className="break-words font-medium text-base-content">{lecture.name}</span>
    </div>
    <span className="badge badge-primary badge-sm">
      {lecture.type || "Lecture"}
    </span>
  </motion.li>
);

const LecturesList = ({ lectures, onLectureClick, isRTL }) => (
  <div className="w-full">
    <ul className="list-none space-y-2">
      {lectures.map((lecture) => (
        <LectureItem
          key={lecture._id}
          lecture={lecture}
          onClick={() => onLectureClick(lecture._id)}
          isRTL={isRTL}
        />
      ))}
    </ul>
  </div>
);

export default function CourseDetails() {
  const { t, i18n } = useTranslation("courseDetails");
  const isRTL = i18n.language === "ar";
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const subjectResult = await getSubjectById(subjectId);
        if (!subjectResult.success || !subjectResult.data?.subject) {
          throw new Error(subjectResult.error || "Failed to fetch subject details");
        }
        setSubject(subjectResult.data.subject);

        const lecturesResult = await getLecturesBySubject(subjectId);
        if (lecturesResult.success) {
          setLectures(lecturesResult.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchData();
    }
  }, [subjectId]);

  const handleLectureClick = (lectureId) => {
    navigate(`/course-details/${subjectId}/lectures/${lectureId}`);
  };

  const levelName = useMemo(() => {
    if (!subject?.level || subject.level.length === 0) return t("unknown");

    const levels = subject.level.map((level) => {
      switch (level.name) {
        case "Primary":
          return t("levels.primary");
        case "Middle":
          return t("levels.middle");
        case "Upper Primary":
          return t("levels.upperPrimary");
        default:
          return level.name;
      }
    });

    return levels.join(", ");
  }, [subject, t]);

  const courseDetailsContent = useMemo(() => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-base-100 shadow-lg rounded-lg p-6 border border-base-300 w-full"
    >
      <h2 className="text-xl font-bold text-base-content text-center mb-4">{t("courseDetails")}</h2>
      <div className="w-full h-px bg-base-300 mb-4" />
      <div className="space-y-2">
        <DetailItem label={t("labels.subject")} value={subject?.name || t("unknown")} isRTL={isRTL} />
        <DetailItem label={t("labels.levels")} value={levelName} isRTL={isRTL} />
        <DetailItem
          label={t("labels.lecturesCount")}
          value={lectures.length}
          isRTL={isRTL}
        />
        <DetailItem
          label={t("labels.teacherCount")}
          value={subject?.teachers?.length || t("unknown")}
          isRTL={isRTL}
        />
      </div>
    </motion.div>
  ), [subject, lectures, isRTL, t, levelName]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorAlert error={error} onRetry={() => window.location.reload()} />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-base-200"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-base-content text-center">
            {subject?.name || t("courseDetails")}
          </h1>
          <Link to="/courses" className="btn btn-outline">
            <FaArrowLeft className={isRTL ? "ml-2" : "mr-2"} />
            {t("backToCourses")}
          </Link>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-base-100 p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-bold mb-4">{t("description")}</h2>
              <p className="text-base-content/90">
                {subject?.description || t("noDescription")}
              </p>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">{t("objectives")}</h3>
                <ul className={`list-disc ${isRTL ? "pr-5" : "pl-5"} space-y-2`}>
                  <li>{t("objectivesList.1", { subject: subject?.name || t("subject") })}</li>
                  <li>{t("objectivesList.2")}</li>
                  <li>{t("objectivesList.3")}</li>
                  <li>{t("objectivesList.4")}</li>
                </ul>
              </div>
            </motion.div>

            {/* Course Content */}
            {lectures.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-base-100 p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{t("courseContent")}</h2>
                  <span className="badge badge-primary">
                    {lectures.length} {t("lectures")}
                  </span>
                </div>
                <LecturesList lectures={lectures} onLectureClick={handleLectureClick} isRTL={isRTL} />
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}