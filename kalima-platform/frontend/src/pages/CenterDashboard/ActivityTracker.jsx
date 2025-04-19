import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const ActivityTracker = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Sample data
  const allStudents = [
    {
      id: 1,
      name: { ar: "منى سالم", en: "Mona Salem" },
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      status: { ar: "ناجح", en: "Pass" },
      statusValue: "present",
      score: "45/50",
      grade: { ar: "ممتاز", en: "Excellent" },
      gradeValue: "excellent",
      timeSpent: { ar: "22 دقيقة", en: "22 minutes" },
      timeValue: "short",
      submissionTime: { ar: "4 إبريل 2025 9:00AM", en: "Apr 4, 2025 9:00AM" },
      dateValue: "today",
    },
    {
      id: 2,
      name: { ar: "أحمد عادل", en: "Ahmed Adel" },
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      status: { ar: "ناجح", en: "Pass" },
      statusValue: "present",
      score: "35/50",
      grade: { ar: "متوسط", en: "Average" },
      gradeValue: "average",
      timeSpent: { ar: "30 دقيقة", en: "30 minutes" },
      timeValue: "medium",
      submissionTime: { ar: "4 إبريل 2025 9:15AM", en: "Apr 4, 2025 9:15AM" },
      dateValue: "today",
    },
    {
      id: 3,
      name: { ar: "داليا أحمد", en: "Dalia Ahmed" },
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      status: { ar: "راسب", en: "Fail" },
      statusValue: "absent",
      score: "15/50",
      grade: { ar: "ضعيف", en: "Poor" },
      gradeValue: "poor",
      timeSpent: { ar: "10 دقيقة", en: "10 minutes" },
      timeValue: "short",
      submissionTime: { ar: "4 إبريل 2025 9:30AM", en: "Apr 4, 2025 9:30AM" },
      dateValue: "today",
    },
    {
      id: 4,
      name: { ar: "محمود وجيه", en: "Mahmoud Wajih" },
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      status: { ar: "ناجح", en: "Pass" },
      statusValue: "present",
      score: "45/50",
      grade: { ar: "ممتاز", en: "Excellent" },
      gradeValue: "excellent",
      timeSpent: { ar: "25 دقيقة", en: "25 minutes" },
      timeValue: "medium",
      submissionTime: { ar: "4 إبريل 2025 9:45AM", en: "Apr 4, 2025 9:45AM" },
      dateValue: "today",
    },
  ];

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filter students based on search and filters
  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch = isRTL
      ? student.name.ar.toLowerCase().includes(searchTerm.toLowerCase())
      : student.name.en.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter
      ? student.statusValue === statusFilter
      : true;
    const matchesGrade = gradeFilter
      ? student.gradeValue === gradeFilter
      : true;
    const matchesTime = timeFilter ? student.timeValue === timeFilter : true;
    const matchesDate = dateFilter ? student.dateValue === dateFilter : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesGrade &&
      matchesTime &&
      matchesDate
    );
  });

  return (
    <div
      className="bg-base-100 rounded-lg shadow-lg p-4 md:p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className=" bg-secondary p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <p className="text-xl text-base-content">
              {isRTL
                ? "نتائج الامتحان لم تُنشر بعد"
                : "Exam results not published yet"}
            </p>
         
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary">
            {isRTL ? "إرسال الإشعارات" : "Send Notifications"}
          </button>
          <button className="btn btn-sm btn-primary">
            {isRTL ? "نشر النتائج" : "Publish Results"}
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
      
          <div className="flex items-center gap-x-2 mt-1">
          <span className="text-xl font-bold text-base-content">
            {isRTL
              ? `الحاضر(${allStudents.filter((s) => s.statusValue === "present").length})`
              : `Present(${allStudents.filter((s) => s.statusValue === "present").length})`}
          </span>
          <span className="text-sm text-base-content">
            {isRTL
              ? `الغائب(${allStudents.filter((s) => s.statusValue === "absent").length})`
              : `Absent(${allStudents.filter((s) => s.statusValue === "absent").length})`}
          </span>
        </div>
        
          </div>
        </div>
      </div>

  {/* Search and Filters */}
<div className="w-full flex flex-col lg:flex-row gap-4 mb-6">
{/* Search Input - Takes full width on mobile, 1/3 on desktop */}
<div className="w-full lg:w-1/3 relative">
  <div className="relative">
    <input
      type="text"
      placeholder={isRTL ? "البحث عن اسم الطالب" : "Search student name"}
      className="input input-bordered w-full pl-10 pr-10 h-12 transition-all duration-300 focus:ring-2 focus:ring-primary/50"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <span className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
    </span>
  </div>
</div>

{/* Filter Dropdowns - Takes full width on mobile, 2/3 on desktop */}
<div className="w-full lg:w-2/3">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {/* Status Filter */}
    <div className="relative">
      <select 
        className="select select-bordered w-full h-12 pl-3 pr-8 appearance-none transition-all duration-300 focus:ring-2 focus:ring-primary/50"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">{isRTL ? "الحالة" : "Status"}</option>
        <option value="present">{isRTL ? "حاضر" : "Present"}</option>
        <option value="absent">{isRTL ? "غائب" : "Absent"}</option>
      </select>
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none text-gray-400`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>

    {/* Grade Filter */}
    <div className="relative">
      <select 
        className="select select-bordered w-full h-12 pl-3 pr-8 appearance-none transition-all duration-300 focus:ring-2 focus:ring-primary/50"
        value={gradeFilter}
        onChange={(e) => setGradeFilter(e.target.value)}
      >
        <option value="">{isRTL ? "التقدير" : "Grade"}</option>
        <option value="excellent">{isRTL ? "ممتاز" : "Excellent"}</option>
        <option value="average">{isRTL ? "متوسط" : "Average"}</option>
        <option value="poor">{isRTL ? "ضعيف" : "Poor"}</option>
      </select>
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none text-gray-400`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>

    {/* Time Filter */}
    <div className="relative">
      <select 
        className="select select-bordered w-full h-12 pl-3 pr-8 appearance-none transition-all duration-300 focus:ring-2 focus:ring-primary/50"
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
      >
        <option value="">{isRTL ? "الوقت" : "Time"}</option>
        <option value="short">{isRTL ? "قصير" : "Short"}</option>
        <option value="medium">{isRTL ? "متوسط" : "Medium"}</option>
        <option value="long">{isRTL ? "طويل" : "Long"}</option>
      </select>
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none text-gray-400`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>

    {/* Date Filter */}
    <div className="relative">
      <select 
        className="select select-bordered w-full h-12 pl-3 pr-8 appearance-none transition-all duration-300 focus:ring-2 focus:ring-primary/50"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        <option value="">{isRTL ? "التاريخ" : "Date"}</option>
        <option value="today">{isRTL ? "اليوم" : "Today"}</option>
        <option value="week">{isRTL ? "هذا الأسبوع" : "This Week"}</option>
        <option value="month">{isRTL ? "هذا الشهر" : "This Month"}</option>
      </select>
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none text-gray-400`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>
  </div>
</div>
</div>
      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-base-200">
              <th className={isRTL ? "text-right" : "text-left"}>
                {isRTL ? "اسم الطالب" : "Student Name"}
              </th>
              <th className={isRTL ? "text-right" : "text-left"}>
                {isRTL ? "ناجح/راسب" : "Pass/Fail"}
              </th>
              <th className={isRTL ? "text-right" : "text-left"}>{isRTL ? "الدرجة" : "Score"}</th>
              <th className={isRTL ? "text-right" : "text-left"}>{isRTL ? "التقدير" : "Grade"}</th>
              <th className={isRTL ? "text-right" : "text-left"}>
                {isRTL ? "الوقت المستغرق" : "Time Spent"}
              </th>
              <th className={isRTL ? "text-right" : "text-left"}>
                {isRTL ? "وقت التسليم" : "Submission Time"}
              </th>
              <th className={isRTL ? "text-right" : "text-left"}>
                <button className="btn btn-sm btn-primary">
                  {isRTL ? "عرض تفاصيل" : "Show Details"}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-base-200 border-b border-base-200"
                >
                  <td>
                    <div className="flex items-center gap-2 ">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={student.avatar}
                            alt={isRTL ? student.name.ar : student.name.en}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://www.gravatar.com/avatar/?d=mp";
                            }}
                          />
                        </div>
                      </div>
                      <span>{isRTL ? student.name.ar : student.name.en}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        student.status.ar === "ناجح"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {isRTL ? student.status.ar : student.status.en}
                    </span>
                  </td>
                  <td>{student.score}</td>
                  <td
                    className={`font-medium ${
                      student.grade.ar === "ممتاز"
                        ? "text-success"
                        : student.grade.ar === "متوسط"
                        ? "text-info"
                        : "text-error"
                    }`}
                  >
                    {isRTL ? student.grade.ar : student.grade.en}
                  </td>
                  <td>{isRTL ? student.timeSpent.ar : student.timeSpent.en}</td>
                  <td>
                    {isRTL
                      ? student.submissionTime.ar
                      : student.submissionTime.en}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-link">
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {isRTL ? "لا توجد نتائج مطابقة" : "No matching results found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTracker;
