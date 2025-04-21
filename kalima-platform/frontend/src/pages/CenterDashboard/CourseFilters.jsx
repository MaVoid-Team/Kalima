// CourseFilters.jsx
"use client"
import { useState } from "react";
import { Users } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CourseFilters = ({ teachers = [], groups = [], onFilterChange, isRTL }) => {
  const [activeTab, setActiveTab] = useState("department");
  const { t } = useTranslation("center");

  const semesters = isRTL 
    ? ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"] 
    : ["First Semester", "Second Semester", "Summer Semester"];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onFilterChange(); // Reset filters when changing tabs
  };

  return (
    <div className="rounded-lg p-4 shadow-sm bg-base-100">
      <h2 className={`${isRTL ? "text-end" : "text-start"} text-xl font-bold text-base-content mb-4`}>
        {isRTL ? 'جدول الحصص' : 'Class Schedule'}
      </h2>

      {/* Filter Tabs */}
      <div className={`w-full flex flex-col sm:flex-row ${isRTL ? 'sm:justify-end' : 'sm:justify-start'} mb-6`}>
        <div className={`flex flex-wrap gap-1 sm:gap-3 ${isRTL ? 'sm:flex-row-reverse justify-end' : 'sm:flex-row justify-start'}`}>
          {["department", "group", "semester", "teacher"].map((tab) => (
            <button
              key={tab}
              className={`min-w-[120px] px-3 py-2.5 text-sm transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary font-bold rounded-lg border-2 border-primary'
                  : 'text-base-content/70 hover:text-primary hover:bg-base-200/50 border-2 border-transparent'
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {t(`filters.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter */}
      {activeTab === 'department' && (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <label className="block mb-2 font-medium text-base-content">
              {t('filters.section')}
            </label>
            <select
              className="select select-bordered w-full bg-base-200"
              onChange={(e) => onFilterChange('department', e.target.value)}
            >
              <option value="">{t('filters.select_section')}</option>
              <option value="math">{t('subjects.math')}</option>
              <option value="science">{t('subjects.science')}</option>
              <option value="arabic">{t('subjects.arabic')}</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-base-content">
              {t('filters.group')}
            </label>
            <select
              className="select select-bordered w-full bg-base-200"
              onChange={(e) => onFilterChange('group', e.target.value)}
            >
              <option value="">{t('filters.select_group')}</option>
              {groups.map(group => (
                <option key={group} value={group}>
                  {isRTL ? `المجموعة ${group}` : `Group ${group}`}
                </option>
              ))}
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
              className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center"
              onClick={() => onFilterChange('group', group)}
            >
              <h3 className="font-medium">
                {isRTL ? `المجموعة ${group}` : `Group ${group}`}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Filter */}
      {activeTab === 'teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.name}
              className="bg-base-200 p-4 rounded-md cursor-pointer hover:bg-base-300"
              onClick={() => onFilterChange('teacher', teacher.name)}
            >
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-medium text-lg">
                  {isRTL ? `أ/ ${teacher.name}` : `${teacher.name}`}
                </h3>
                <div className={`flex items-center mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-sm">
                    {isRTL ? `المجموعة ${teacher.group}` : `Group ${teacher.group}`}
                  </span>
                  <Users className={`w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                </div>
              </div>
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
              className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center"
              onClick={() => onFilterChange('semester', semester)}
            >
              <h3 className="font-medium">{semester}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseFilters;