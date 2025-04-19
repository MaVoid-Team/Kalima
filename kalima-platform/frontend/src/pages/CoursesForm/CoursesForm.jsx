import React from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  Image,
  Video,
  ChevronDown,
  Plus,
  PlusCircle,
  Edit,
  Trash2,
  Edit2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";


const CurriculumSection = () => {
  const [expandedCards, setExpandedCards] = useState({
    curriculum1: false,
    curriculum2: false,
    curriculum3: false,
  });
  const [expandedMonths, setExpandedMonths] = useState({
    card1: null,
    card2: null,
    card3: null,
  });

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const toggleCard = (card) => {
    setExpandedCards((prev) => ({
      ...prev,
      [card]: !prev[card],
    }));
  };

  const toggleMonth = (card, month) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [card]: prev[card] === month ? null : month,
    }));
  };

  return (
    <div className="flex justify-center w-full px-4 sm:px-6 lg:px-8">
      <div
        className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-sm w-full max-w-4xl space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* First Curriculum Card */}
        <div className="space-y-4">
          <h2 className="text-center text-lg font-semibold text-primary">
            {isRTL ? "المنهج الدراسي" : "Curriculum"}
          </h2>
          <div className="border-2 border-secondary rounded-xl bg-primary/30 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-medium text-base-content text-center sm:text-start">
              {isRTL ? "اضف حاوية لمحتوايات الكورس" : "Add Course Content Container"}
            </h3>
            <button
              className="btn btn-primary gap-2 w-full sm:w-auto"
              onClick={() => toggleCard("curriculum1")}
            >
              {isRTL ? "اضف حاوية" : "Add to Container"}
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {expandedCards.curriculum1 && (
            <div className="bg-base-100 p-3 sm:p-4 rounded-lg shadow-inner space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <h4 className="font-medium text-base-content text-center sm:text-start">
                  {isRTL ? "حاوية الترم الاول" : "First Term Container"}
                </h4>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Edit2 className="w-4 h-4 text-primary" />
                  </button>
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                {[1, 2, 3, 4].map((month) => (
                  <li
                    key={`card1-${month}`}
                    className="bg-base-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-2 sm:p-3 cursor-pointer hover:bg-base-300"
                      onClick={() => toggleMonth("card1", month)}
                    >
                      <span className="text-sm sm:text-base text-base-content/80">
                        {isRTL
                          ? `الشهر ${
                              month === 1
                                ? "الاول"
                                : month === 2
                                ? "الثاني"
                                : month === 3
                                ? "الثالث"
                                : "الرابع"
                            }`
                          : `Month ${month}`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedMonths.card1 === month ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {expandedMonths.card1 === month && (
                      <div className="p-2 sm:p-3 bg-base-100 border-t border-base-300">
                        <p className="text-xs sm:text-sm text-base-content/70">
                          {isRTL ? "محتويات الشهر..." : "Month contents..."}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Second Curriculum Card */}
        <div className="space-y-4">
          <h2 className="text-center text-lg font-semibold text-primary">
            {isRTL ? "الملحقات" : "Attachments"}
          </h2>
          <div className="border-2 border-secondary rounded-xl bg-primary/30 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-medium text-base-content text-center sm:text-start">
              {isRTL ? "اضف ملحقات الكورس" : "Add Course Attachments"}
            </h3>
            <button
              className="btn btn-primary gap-2 w-full sm:w-auto"
              onClick={() => toggleCard("curriculum2")}
            >
              {isRTL ? "اضف ملحق" : "Add Attachment"}
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {expandedCards.curriculum2 && (
            <div className="bg-base-100 p-3 sm:p-4 rounded-lg shadow-inner space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <h4 className="font-medium text-base-content text-center sm:text-start">
                  {isRTL ? "ملحقات الكورس" : "Course Attachments"}
                </h4>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Edit2 className="w-4 h-4 text-primary" />
                  </button>
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                {["PDF", "Video", "Audio", "Document"].map((type, index) => (
                  <li
                    key={`card2-${index}`}
                    className="bg-base-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-2 sm:p-3 cursor-pointer hover:bg-base-300"
                      onClick={() => toggleMonth("card2", index)}
                    >
                      <span className="text-sm sm:text-base text-base-content/80">
                        {isRTL
                          ? `ملحق ${index + 1} (${type})`
                          : `Attachment ${index + 1} (${type})`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedMonths.card2 === index ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {expandedMonths.card2 === index && (
                      <div className="p-2 sm:p-3 bg-base-100 border-t border-base-300">
                        <p className="text-xs sm:text-sm text-base-content/70">
                          {isRTL ? "تفاصيل المرفق..." : "Attachment details..."}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Third Curriculum Card */}
        <div className="space-y-4">
          <h2 className="text-center text-lg font-semibold text-primary">
            {isRTL ? "الامتحانات" : "Exams"}
          </h2>
          <div className="border-2 border-secondary rounded-xl bg-primary/30 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-medium text-base-content text-center sm:text-start">
              {isRTL ? "اضف امتحانات الكورس" : "Add Course Exams"}
            </h3>
            <button
              className="btn btn-primary gap-2 w-full sm:w-auto"
              onClick={() => toggleCard("curriculum3")}
            >
              {isRTL ? "اضف امتحان" : "Add Exam"}
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {expandedCards.curriculum3 && (
            <div className="bg-base-100 p-3 sm:p-4 rounded-lg shadow-inner space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <h4 className="font-medium text-base-content text-center sm:text-start">
                  {isRTL ? "امتحانات الكورس" : "Course Exams"}
                </h4>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Edit2 className="w-4 h-4 text-primary" />
                  </button>
                  <button className="btn btn-ghost btn-square btn-sm">
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                {["Midterm", "Final", "Quiz 1", "Quiz 2"].map((exam, index) => (
                  <li
                    key={`card3-${index}`}
                    className="bg-base-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-2 sm:p-3 cursor-pointer hover:bg-base-300"
                      onClick={() => toggleMonth("card3", index)}
                    >
                      <span className="text-sm sm:text-base text-base-content/80">
                        {isRTL
                          ? `امتحان ${index + 1} (${exam})`
                          : `Exam ${index + 1} (${exam})`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedMonths.card3 === index ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {expandedMonths.card3 === index && (
                      <div className="p-2 sm:p-3 bg-base-100 border-t border-base-300">
                        <p className="text-xs sm:text-sm text-base-content/70">
                          {isRTL ? "تفاصيل الامتحان..." : "Exam details..."}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
function CourseCreationForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Form state
  const [formData, setFormData] = React.useState({
    courseName: "",
    teacherName: "",
    gradeLevel: "",
    subject: "",
    duration: "",
    description: "",
    objectives: "",
    courseType: "paid",
    priceFull: "",
    priceMonthly: "",
    priceSession: "",
    accessType: "both",
    privacy: "student",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? (checked ? value : prev[name]) : value,
    }));
  };

  return (
    <div
      className="min-h-screen bg-base-100 text-base-content py-8 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8 relative"
        >
          {/* Back link */}
          <a
            href="#"
            className="flex items-center text-primary hover:text-primary-600 text-sm"
          >
            {isRTL ? (
              <>
                <ChevronRight className="h-4 w-4 mr-1" />
                <span>{t("الخروج")}</span>
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 ml-1" />
                <span>{t("back")}</span>
              </>
            )}
          </a>

          {/* Title with line */}
          <div className="absolute inset-x-0 flex justify-center">
            <div className="flex items-center">
              <div className="w-16 h-px bg-secondary"></div>
              <h1 className="mx-4 text-2xl font-bold text-primary">
                {isRTL ? "انشئ كورس" : "Create Course"}
              </h1>
              <div className="w-16 h-px bg-secondary"></div>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-base-100 rounded-xl shadow-md p-6"
        >
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-6 text-primary">
              {isRTL ? "البيانات الاساسية" : "Basic Information"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "اسم الكورس" : "Course Name"}
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder={
                      isRTL
                        ? "مثل: دوره تقديم اللغة الإنجليزية"
                        : "e.g., English Language Course"
                    }
                    className="w-full input input-bordered bg-base-200 placeholder-base-content/50"
                  />
                </div>

                {/* Teacher Name */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "اسم المعلم" : "Teacher Name"}
                  </label>
                  <select
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    className="w-full select select-bordered bg-base-200 appearance-none"
                  >
                    <option value="" disabled>
                      {isRTL ? "مثل: بوسف عثمان" : "e.g., Youssef Othman"}
                    </option>
                    <option value="teacher1">Teacher 1</option>
                    <option value="teacher2">Teacher 2</option>
                  </select>
                  <ChevronDown
                    className={`h-4 w-4 absolute top-10 ${
                      isRTL ? "left-3" : "right-3"
                    } pointer-events-none`}
                  />
                </div>

                {/* Grade Level */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "المرحلة الدراسية" : "Grade Level"}
                  </label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className="w-full select select-bordered bg-base-200 appearance-none"
                  >
                    <option value="" disabled>
                      {isRTL
                        ? "مثل: الصف الرابع الابتدائي"
                        : "e.g., 4th Grade Elementary"}
                    </option>
                    <option value="elementary">Elementary</option>
                    <option value="middle">Middle School</option>
                    <option value="high">High School</option>
                  </select>
                  <ChevronDown
                    className={`h-4 w-4 absolute top-10 ${
                      isRTL ? "left-3" : "right-3"
                    } pointer-events-none`}
                  />
                </div>

                {/* Subject */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "المادة الدراسية" : "Subject"}
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full select select-bordered bg-base-200 appearance-none"
                  >
                    <option value="" disabled>
                      {isRTL
                        ? "مثل: اللغة الإنجليزية"
                        : "e.g., English Language"}
                    </option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                  </select>
                  <ChevronDown
                    className={`h-4 w-4 absolute top-10 ${
                      isRTL ? "left-3" : "right-3"
                    } pointer-events-none`}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "مدة الكورس" : "Course Duration"}
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder={
                      isRTL
                        ? "مثل: عدد الأسبوع أو الساعات"
                        : "e.g., Number of weeks or hours"
                    }
                    className="w-full input input-bordered bg-base-200 placeholder-base-content/50"
                  />
                </div>
                {/* Course Description */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "وصف الكورس" : "Course Description"}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={
                      isRTL
                        ? "مثل: تهدف صف الدورة إلى تحسين مهارات المتعلمين في اللغة الإنجليزية من حيث القراءة والمحادثة. تشمل الدورة قواعد اللغة الإنجليزية والمفردات، والعمل على استخدام اللغة في المواقف اليومية."
                        : "e.g., The course aims to improve learners' English language skills in reading and speaking. The course includes English grammar, vocabulary, and practice using the language in daily situations."
                    }
                    rows="4"
                    className="w-full textarea textarea-bordered bg-base-200 placeholder-base-content/50"
                  ></textarea>
                </div>

                {/* Course Objectives */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-1">
                    {isRTL ? "اهداف الكورس" : "Course Objectives"}
                  </label>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleChange}
                    placeholder={
                      isRTL
                        ? "مثل: تحسين مهارات القراءة والكتابة والمحادثة، تعلم قواعد اللغة الأساسية، زيادة الثقة في استخدام اللغة الإنجليزية في الحياة اليومية."
                        : "e.g., Improve reading, writing and speaking skills, learn basic grammar rules, increase confidence in using English in daily life."
                    }
                    rows="4"
                    className="w-full textarea textarea-bordered bg-base-200 placeholder-base-content/50"
                  ></textarea>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Course Image Upload */}
                <div>
                  <h2 className="block text-lg text-primary font-medium mb-2">
                    {isRTL ? "صورة الكورس" : "Course Image"}
                  </h2>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 flex flex-col items-center justify-center  h-48">
                    <Image className="w-10 h-10 mb-2 text-primary" />
                    <button className="btn text-primary btn-sm btn-ghost border border-primary border-2 mb-2">
                      {isRTL ? "اضف صورة" : "Add Image"}
                    </button>
                    <p className="text-xs text-base-content/50">
                      {isRTL ? "المساحة القصوى 1 Gb" : "Max size 1 Gb"}
                    </p>
                  </div>
                </div>

                {/* Course Video Upload */}
                <div>
                  <h2 className="block text-lg text-primary font-medium mb-2">
                    {isRTL ? "فيديو مقدمة الكورس" : "Course Introduction Video"}
                  </h2>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 flex flex-col items-center justify-center  h-48">
                    <Video className="w-10 h-10 mb-2 text-primary" />
                    <button className="btn text-primary btn-sm btn-ghost border border-primary border-2 mb-2">
                      {isRTL ? "اضف فيديو" : "Add Video"}
                    </button>
                    <p className="text-xs text-base-content/50">
                      {isRTL ? "المساحة القصوى 1 Gb" : "Max size 1 Gb"}
                    </p>
                  </div>
                </div>

                {/* Course Type and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h2 className="block text-lg text-primary font-medium mb-2">
                      {isRTL ? "نوع الكورس" : "Course Type"}
                    </h2>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="courseType"
                          value="paid"
                          checked={formData.courseType === "paid"}
                          onChange={handleChange}
                          className="radio radio-primary"
                        />
                        <span>{isRTL ? "مدفوع" : "Paid"}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="courseType"
                          value="free"
                          checked={formData.courseType === "free"}
                          onChange={handleChange}
                          className="radio radio-primary"
                        />
                        <span>{isRTL ? "مجاني" : "Free"}</span>
                      </label>
                    </div>

                    {formData.courseType === "paid" && (
                      <div className="mt-6 space-y-4 mb-6">
                        <h2 className="block text-lg text-primary font-medium">
                          {isRTL ? "سعر الكورس" : "Course Price"}
                        </h2>
                        {/* Full Course Price */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            {isRTL ? "الكورس كامل" : "Full Course"}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="priceFull"
                              value={formData.priceFull}
                              onChange={handleChange}
                              placeholder={
                                isRTL ? "الكورس كامل" : "Full Course"
                              }
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                        </div>

                        {/* Monthly Price */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            {isRTL ? "سعر الشهر" : "Monthly Price"}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="priceMonthly"
                              value={formData.priceMonthly}
                              onChange={handleChange}
                              placeholder={
                                isRTL ? "سعر الشهر" : "Monthly Price"
                              }
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                        </div>

                        {/* Session Price */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            {isRTL ? "سعر الحصة" : "Session Price"}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="priceSession"
                              value={formData.priceSession}
                              onChange={handleChange}
                              placeholder={
                                isRTL ? "سعر الحصة" : "Session Price"
                              }
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Access Validity */}
                    <div className="mb-6">
                      <h2 className="block text-primary text-lg font-medium mb-2">
                        {isRTL ? "صلاحية الوصول" : "Access Validity"}
                      </h2>
                      <div className="flex gap-8  ">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="accessType"
                            value="both"
                            checked={formData.accessType === "both"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>
                            {isRTL ? "التطبيق و المنصة" : "App and Platform"}
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="accessType"
                            value="app"
                            checked={formData.accessType === "app"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>{isRTL ? "التطبيق" : "App"}</span>
                        </label>
                      </div>
                    </div>

                    {/* Course Privacy */}
                    <div>
                      <h2 className="block text-primary text-lg font-medium mb-3">
                        {isRTL ? "خصوصية الكورس" : "Course Privacy"}
                      </h2>
                      <div className="flex gap-8 ">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="privacy"
                            value="student"
                            checked={formData.privacy === "student"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>
                            {isRTL ? "طالب / ولی امر" : "Student / Guardian"}
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="privacy"
                            value="teacher"
                            checked={formData.privacy === "teacher"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>{isRTL ? "المعلم" : "Teacher"}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CoursesForm() {
  return (
    <div className="w-full overflow-x-hidden p-4 sm:p-8 md:p-14">
      <CourseCreationForm />
      <CurriculumSection />
    </div>
  );
}

export default CoursesForm;
