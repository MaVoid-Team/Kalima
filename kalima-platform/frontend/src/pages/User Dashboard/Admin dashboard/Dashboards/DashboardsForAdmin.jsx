import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaUserTie, 
  FaUserShield 
} from "react-icons/fa";

const DashboardsForAdmins = () => {
  const navigate = useNavigate();

  const dashboardOptions = [
    {
      id: "admin",
      title: "Admin Dashboard",
      description: "Manage users, view system statistics, and configure platform settings.",
      icon: <FaUserShield className="w-12 h-12" />,
      path: "/dashboard/admin-dashboard",
      isDefault: true
    },
    {
      id: "lecturer",
      title: "Lecturer Dashboard",
      description: "Manage courses, view student progress, and create educational content.",
      icon: <FaChalkboardTeacher className="w-12 h-12" />,
      path: "/dashboard/lecturer-dashboard",
      isDefault: false
    },
    {
      id: "assistant",
      title: "Assistant Dashboard",
      description: "Help manage courses, support students, and assist lecturers.",
      icon: <FaUserTie className="w-12 h-12" />,
      path: "/dashboard/assistant-page",
      isDefault: false
    },
    {
      id: "student",
      title: "Student Dashboard",
      description: "View courses, track progress, and access learning materials.",
      icon: <FaUserGraduate className="w-12 h-12" />,
      path: "/dashboard/promo-codes",
      isDefault: false
    }
  ];

  const handleDashboardSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-lg">اختر لوحة التحكم التي تريد الوصول إليها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardOptions.map((option) => (
          <div 
            key={option.id} 
            className={`card ${option.isDefault ? 'border-2 border-primary' : 'border'} shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="card-body items-center text-center">
              <div className={`${option.isDefault ? 'text-primary' : ''}`}>
                {option.icon}
              </div>
              <h2 className="card-title mt-4">{option.title}</h2>
              <p className="mb-4">{option.description}</p>
              <div className="card-actions">
                <button 
                  className={`btn ${option.isDefault ? 'btn-primary' : 'btn-secondary'} w-full`}
                  onClick={() => handleDashboardSelect(option.path)}
                >
                  {option.isDefault ? 'متابعة إلى لوحة التحكم الرئيسية' : 'الذهاب إلى لوحة التحكم'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm opacity-70">يمكنك تغيير لوحة التحكم الافتراضية من إعدادات الحساب</p>
      </div>
    </div>
  );
};

export default DashboardsForAdmins;