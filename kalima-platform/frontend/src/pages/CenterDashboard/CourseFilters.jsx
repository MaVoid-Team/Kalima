"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { useTranslation } from 'react-i18next';

const CourseFilters = ({ onFilterChange }) => {
  const [activeTab, setActiveTab] = useState("department")
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const teachers = [
    {
      id: 1,
      name: isRTL ? "أ/ عماد عبدالعزيز" : "Mr. Emad Abdulaziz",
      email: "Keegan_Mraz@gmail.com",
      group: isRTL ? "١٢٢ المجموعة" : "Group 122",
    },
    {
      id: 2,
      name: isRTL ? "أ/ إيهاب سعيد" : "Mr. Ehab Said",
      email: "Olaf_Hegmann40@hotmail.com",
      group: isRTL ? "١٠٢ المجموعة" : "Group 102",
    },
    {
      id: 3,
      name: isRTL ? "أ/ علي حسن" : "Mr. Ali Hassan",
      email: "Bennett.Nolan@gmail.com",
      group: isRTL ? "١٤٠ المجموعة" : "Group 140",
    },
    {
      id: 4,
      name: isRTL ? "أ/ مالك حسام" : "Mr. Malek Hossam",
      email: "Felipe.Kulas@gmail.com",
      group: isRTL ? "١٦٠ المجموعة" : "Group 160",
    },
  ]

  const groups = isRTL 
    ? ["المجموعة الأولى", "المجموعة الثانية", "المجموعة الثالثة"]
    : ["Group 1", "Group 2", "Group 3"]

  const semesters = isRTL 
    ? ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"] 
    : ["First Semester", "Second Semester", "Summer Semester"]
  return (
    <div className="rounded-lg p-4 shadow-sm">
    <h2 className={`${isRTL ? "text-end" : "text-start"} text-xl font-bold text-base-content mb-4 text-right`}>
    {isRTL ? 'جدول الحصص' : 'Class Schedule'}
  </h2>

{/* Enhanced Responsive Filter Tabs */}
<div className={`w-full flex flex-col sm:flex-row ${isRTL ? 'sm:justify-end' : 'sm:justify-start'} mb-6`}>
  <div className={`flex flex-wrap gap-1 sm:gap-3 ${isRTL ? 'sm:flex-row-reverse justify-end' : 'sm:flex-row justify-start'}`}>
    <button
      className={`min-w-[120px] sm:min-w-[140px] px-3 py-2.5 text-xs sm:text-sm md:text-base transition-all duration-200 ease-in-out ${
        activeTab === 'department'
          ? 'bg-primary/10 text-primary font-bold rounded-lg border-2 border-primary shadow-sm'
          : 'text-base-content/70 hover:text-primary hover:bg-base-200/50 border-2 border-transparent'
      } active:scale-95`}
      onClick={() => handleTabChange('department')}
    >
      {isRTL ? 'حسب القسم' : 'By Section'}
    </button>
    <button
      className={`min-w-[120px] sm:min-w-[140px] px-3 py-2.5 text-xs sm:text-sm md:text-base transition-all duration-200 ease-in-out ${
        activeTab === 'group'
          ? 'bg-primary/10 text-primary font-bold rounded-lg border-2 border-primary shadow-sm'
          : 'text-base-content/70 hover:text-primary hover:bg-base-200/50 border-2 border-transparent'
      } active:scale-95`}
      onClick={() => handleTabChange('group')}
    >
      {isRTL ? 'حسب المجموعة' : 'By Group'}
    </button>
    <button
      className={`min-w-[120px] sm:min-w-[140px] px-3 py-2.5 text-xs sm:text-sm md:text-base transition-all duration-200 ease-in-out ${
        activeTab === 'semester'
          ? 'bg-primary/10 text-primary font-bold rounded-lg border-2 border-primary shadow-sm'
          : 'text-base-content/70 hover:text-primary hover:bg-base-200/50 border-2 border-transparent'
      } active:scale-95`}
      onClick={() => handleTabChange('semester')}
    >
      {isRTL ? 'حسب الفصل' : 'By Class'}
    </button>
    <button
      className={`min-w-[120px] sm:min-w-[140px] px-3 py-2.5 text-xs sm:text-sm md:text-base transition-all duration-200 ease-in-out ${
        activeTab === 'teacher'
          ? 'bg-primary/10 text-primary font-bold rounded-lg border-2 border-primary shadow-sm'
          : 'text-base-content/70 hover:text-primary hover:bg-base-200/50 border-2 border-transparent'
      } active:scale-95`}
      onClick={() => handleTabChange('teacher')}
    >
      {isRTL ? 'حسب المعلم' : 'By Teacher'}
    </button>
  </div>
</div>
  {activeTab === 'department' && (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div>
        <label className="block mb-2 font-medium text-base-content">
          {isRTL ? 'القسم' : 'Section'}
        </label>
        <select
          className="select select-bordered w-full bg-base-200 text-base-content"
          onChange={(e) => onFilterChange('department', e.target.value)}
        >
          <option value="" disabled selected>
            {isRTL ? 'اختر القسم' : 'Select Section'}
          </option>
          <option value="math">{isRTL ? 'الرياضيات' : 'Math'}</option>
          <option value="science">{isRTL ? 'العلوم' : 'Science'}</option>
          <option value="language">{isRTL ? 'اللغة العربية' : 'Arabic'}</option>
          <option value="social">{isRTL ? 'الدراسات الاجتماعية' : 'Social Studies'}</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium text-base-content">
          {isRTL ? 'المجموعة' : 'Group'}
        </label>
        <select
          className="select select-bordered w-full bg-base-200 text-base-content"
          onChange={(e) => onFilterChange('group', e.target.value)}
        >
          <option value="" disabled selected>
            {isRTL ? 'اختر المجموعة' : 'Select Group'}
          </option>
          <option value="group1">{isRTL ? 'المجموعة الأولى' : 'Group 1'}</option>
          <option value="group2">{isRTL ? 'المجموعة الثانية' : 'Group 2'}</option>
          <option value="group3">{isRTL ? 'المجموعة الثالثة' : 'Group 3'}</option>
        </select>
      </div>
    </div>
  )}
     {/* Group Filter */}
     {activeTab === 'group' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group}
            className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center transition-colors duration-200"
            onClick={() => onFilterChange('group', group)}
          >
            <h3 className="font-medium text-base-content">{group}</h3>
          </div>
        ))}
      </div>
    )}

    {/* Semester Filter */}
    {activeTab === 'semester' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {semesters.map((semester) => (
          <div
            key={semester}
            className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center transition-colors duration-200"
            onClick={() => onFilterChange('semester', semester)}
          >
            <h3 className="font-medium text-base-content">{semester}</h3>
          </div>
        ))}
      </div>
    )}
      {/* Teacher Filter */}
      {activeTab === 'teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-base-200 p-4 rounded-md cursor-pointer hover:bg-base-300 transition-colors duration-200"
              onClick={() => onFilterChange('teacher', teacher.name)}
            >
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-medium text-lg text-base-content">{teacher.name}</h3>
                <p className="text-sm text-base-content/70">{teacher.email}</p>
                <div className={`flex items-center mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-sm text-base-content">{teacher.group}</span>
                  <Users className={`w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'} text-base-content/70`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseFilters
