"use client"

import { useState } from "react"
import { Users } from "lucide-react"

const CourseFilters = ({ onFilterChange }) => {
  const [activeTab, setActiveTab] = useState("department")

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const teachers = [
    {
      id: 1,
      name: "أ/ عماد عبدالعزيز",
      email: "Keegan_Mraz@gmail.com",
      group: "١٢٢ المجموعة",
    },
    {
      id: 2,
      name: "أ/ إيهاب سعيد",
      email: "Olaf_Hegmann40@hotmail.com",
      group: "١٠٢ المجموعة",
    },
    {
      id: 3,
      name: "أ/ علي حسن",
      email: "Bennett.Nolan@gmail.com",
      group: "١٤٠ المجموعة",
    },
    {
      id: 4,
      name: "أ/ مالك حسام",
      email: "Felipe.Kulas@gmail.com",
      group: "١٦٠ المجموعة",
    },
  ]

  return (
    <div className="bg-base-100 rounded-lg p-4 shadow-sm">
      <div className="tabs tabs-boxed justify-end mb-4">
        <a
          className={`tab ${activeTab === "teacher" ? "bg-primary text-primary-content" : ""}`}
          onClick={() => handleTabChange("teacher")}
        >
          حسب المعلم
        </a>
        <a
          className={`tab ${activeTab === "semester" ? "bg-primary text-primary-content" : ""}`}
          onClick={() => handleTabChange("semester")}
        >
          حسب الفصل
        </a>
        <a
          className={`tab ${activeTab === "group" ? "bg-primary text-primary-content" : ""}`}
          onClick={() => handleTabChange("group")}
        >
          حسب المجموعة
        </a>
        <a
          className={`tab ${activeTab === "department" ? "bg-primary text-primary-content" : ""}`}
          onClick={() => handleTabChange("department")}
        >
          حسب القسم
        </a>
      </div>

      {activeTab === "department" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-right mb-2 font-medium">القسم</label>
            <select
              className="select select-bordered w-full"
              onChange={(e) => onFilterChange("department", e.target.value)}
            >
              <option value="" disabled selected>
                اختر القسم
              </option>
              <option value="math">الرياضيات</option>
              <option value="science">العلوم</option>
              <option value="language">اللغة العربية</option>
              <option value="social">ا��دراسات الاجتماعية</option>
            </select>
          </div>

          <div>
            <label className="block text-right mb-2 font-medium">المجموعة</label>
            <select className="select select-bordered w-full" onChange={(e) => onFilterChange("group", e.target.value)}>
              <option value="" disabled selected>
                اختر المجموعة
              </option>
              <option value="group1">المجموعة الأولى</option>
              <option value="group2">المجموعة الثانية</option>
              <option value="group3">المجموعة الثالثة</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === "group" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["المجموعة الأولى", "المجموعة الثانية", "المجموعة الثالثة"].map((group) => (
            <div
              key={group}
              className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center"
              onClick={() => onFilterChange("group", group)}
            >
              <h3 className="font-medium">{group}</h3>
            </div>
          ))}
        </div>
      )}

      {activeTab === "semester" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"].map((semester) => (
            <div
              key={semester}
              className="card bg-base-200 hover:bg-base-300 cursor-pointer p-4 text-center"
              onClick={() => onFilterChange("semester", semester)}
            >
              <h3 className="font-medium">{semester}</h3>
            </div>
          ))}
        </div>
      )}

      {activeTab === "teacher" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-base-200 p-4 rounded-md cursor-pointer hover:bg-base-300"
              onClick={() => onFilterChange("teacher", teacher.name)}
            >
              <div className="text-right">
                <h3 className="font-medium text-lg">{teacher.name}</h3>
                <p className="text-sm text-base-content/70">{teacher.email}</p>
                <div className="flex items-center justify-end mt-2">
                  <span className="text-sm">{teacher.group}</span>
                  <Users className="w-4 h-4 mr-1" />
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
