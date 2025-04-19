import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ArrowUp, Star, Book } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

const RecommendedCourses = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const reports = [
    {
      id: 1,
      name: { ar: "هدى أحمد", en: "Hoda Ahmed" },
      class: { ar: "الصف الثاني الثانوي", en: "Grade 11" },
      section: { ar: "القسم: علمي رياضة", en: "Section: Science - Math" },
      improvements: [
        {
          text: {
            ar: "تحسنت في الرياضيات بنسبة 12% !",
            en: "Improved in Math by 12%!",
          },
          icon: <ArrowUp className="h-4 w-4 text-success" />,
        },
        {
          text: {
            ar: "سلوك ممتاز في المحاضرة الأخيرة",
            en: "Excellent behavior in last lecture",
          },
          icon: <Star className="h-4 w-4 text-warning" />,
        },
        {
          text: { ar: "تحتاج دعم في القراءة", en: "Needs support in Reading" },
          icon: <Book className="h-4 w-4 text-warning" />,
        },
      ],
    },
    {
      id: 2,
      name: { ar: "زياد محمد", en: "Ziad Mohamed" },
      class: { ar: "الصف الثاني الثانوي", en: "Grade 11" },
      section: { ar: "القسم: علمي رياضة", en: "Section: Science - Math" },
      improvements: [
        {
          text: {
            ar: "تحسن في الأحياء بنسبة 12% !",
            en: "Improved in Biology by 12%!",
          },
          icon: <ArrowUp className="h-4 w-4 text-success" />,
        },
        {
          text: {
            ar: "سلوك ممتاز في المحاضرة الأخيرة",
            en: "Excellent behavior in last lecture",
          },
          icon: <Star className="h-4 w-4 text-warning" />,
        },
        {
          text: {
            ar: "يحتاج دعم في الكيمياء",
            en: "Needs support in Chemistry",
          },
          icon: <Book className="h-4 w-4 text-warning" />,
        },
      ],
    },
    {
      id: 3,
      name: { ar: "هدى أحمد", en: "Hoda Ahmed" },
      class: { ar: "الصف الثاني الثانوي", en: "Grade 11" },
      section: { ar: "القسم: علمي رياضة", en: "Section: Science - Math" },
      improvements: [
        {
          text: {
            ar: "تحسنت في الرياضيات بنسبة 12% !",
            en: "Improved in Math by 12%!",
          },
          icon: <ArrowUp className="h-4 w-4 text-success" />,
        },
        {
          text: {
            ar: "سلوك ممتاز في المحاضرة الأخيرة",
            en: "Excellent behavior in last lecture",
          },
          icon: <Star className="h-4 w-4 text-warning" />,
        },
        {
          text: { ar: "تحتاج دعم في القراءة", en: "Needs support in Reading" },
          icon: <Book className="h-4 w-4 text-warning" />,
        },
      ],
    },
  ];

  const gradeOptions = [
    { ar: "الصف الثاني الثانوي", en: "Grade 11" },
    { ar: "الصف الأول الثانوي", en: "Grade 10" },
    { ar: "الصف الثالث الثانوي", en: "Grade 12" },
  ];

  const sectionOptions = [
    { ar: "قسم علمي رياضة", en: "Science - Math" },
    { ar: "قسم علمي علوم", en: "Science - Biology" },
    { ar: "قسم أدبي", en: "Literature" },
  ];

  const filteredReports = reports.filter((report) => {
    const gradeMatch =
      !gradeFilter || report.class[isRTL ? "ar" : "en"] === gradeFilter;
    const sectionMatch =
      !sectionFilter ||
      report.section[isRTL ? "ar" : "en"].includes(sectionFilter);
    return gradeMatch && sectionMatch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="bg-base-100 p-6 min-h-screen"
      dir={dir}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Title */}
      <motion.h1
        className="text-2xl font-bold  text-base-content mb-6"
        variants={itemVariants}
      >
        {isRTL
          ? "إرسال تقارير الطلبة إلى الواتساب"
          : "Send Student Reports via WhatsApp"}
      </motion.h1>

      {/* Filters */}
      <motion.div
        className={`flex flex-wrap  gap-4 mb-8 `}
        variants={itemVariants}
      >
        <div className="relative w-full md:w-56">
          <select
            className={`select select-bordered w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } appearance-none  text-secondery focus:text-secondery/20`}
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">{isRTL ? "اختر الصف" : "Select Grade"}</option>
            {gradeOptions.map((option, index) => (
              <option key={index} value={option[isRTL ? "ar" : "en"]}>
                {option[isRTL ? "ar" : "en"]}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute ${
              isRTL ? "left-3" : "right-3"
            } top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70`}
          />
        </div>

        <div className="relative w-full md:w-56">
          <select
            className={`select select-bordered w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } appearance-none  text-secondery focus:text-secondery/20`}
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="">{isRTL ? "اختر القسم" : "Select Section"}</option>
            {sectionOptions.map((option, index) => (
              <option key={index} value={option[isRTL ? "ar" : "en"]}>
                {option[isRTL ? "ar" : "en"]}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute ${
              isRTL ? "left-3" : "right-3"
            } top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70`}
          />
        </div>
      </motion.div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            className="card bg-base-200 border border-primary-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="card-body p-6">
              <h2 className="card-title text-lg font-bold text-base-content mb-4">
                {isRTL ? "تقارير الطالب الأسبوعي" : "Weekly Student Report"}
              </h2>

              <div className="space-y-3 mb-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-base-content rounded-full mr-2"></span>
                  <p className="text-base-content font-medium">
                    {report.name[isRTL ? "ar" : "en"]}
                  </p>
                </div>
                <p className="text-base-content/80">
                  {report.class[isRTL ? "ar" : "en"]}
                </p>
                <p className="text-base-content/80">
                  {report.section[isRTL ? "ar" : "en"]}
                </p>
              </div>


              <div className="space-y-3 mb-2">
                {report.improvements.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-start gap-2 ${
                      isRTL ? "flex-row-reverse" : "flex-row"
                    }`}
                    whileHover={{ x: isRTL ? -5 : 5 }}
                  >
                    {item.icon}
                    <p className="text-sm text-base-content/80">
                      {item.text[isRTL ? "ar" : "en"]}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="btn btn-primary w-full mt-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaWhatsapp className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {isRTL ? "إرسال إلي واتساب" : "Send via WhatsApp"}
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filteredReports.length === 0 && (
          <motion.div
            className="col-span-full text-center py-4 text-base-content/70"
            variants={itemVariants}
          >
            {isRTL ? "لا توجد تقارير مطابقة" : "No matching reports found"}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendedCourses;
