import { useTranslation } from "react-i18next";
import { MapPin, Users, Calendar, BookOpen } from 'lucide-react';

const CenterOverview = ({ center, lecturersCount, studentsCount, lessonsCount }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{center.name}</h1>
          <div className="flex items-center mt-2 text-base-content/70">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{center.location}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="stat bg-base-200 rounded-lg p-4 min-w-[120px]">
            <div className="stat-figure text-primary">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">{isRTL ? "المحاضرين" : "Lecturers"}</div>
            <div className="stat-value">{lecturersCount}</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4 min-w-[120px]">
            <div className="stat-figure text-primary">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">{isRTL ? "الطلاب" : "Students"}</div>
            <div className="stat-value">{studentsCount}</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4 min-w-[120px]">
            <div className="stat-figure text-primary">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="stat-title">{isRTL ? "الدروس" : "Lessons"}</div>
            <div className="stat-value">{lessonsCount}</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4 min-w-[120px]">
            <div className="stat-figure text-primary">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="stat-title">{isRTL ? "تاريخ الإنشاء" : "Created"}</div>
            <div className="stat-desc text-base font-medium">{formatDate(center.createdAt)}</div>
          </div>
        </div>
      </div>
      
      <div className="divider"></div>
      
      <div className="flex justify-end gap-2">
        <button className="btn btn-outline btn-sm">
          {isRTL ? "تعديل المركز" : "Edit Center"}
        </button>
        <button className="btn btn-primary btn-sm">
          {isRTL ? "إضافة محاضر" : "Add Lecturer"}
        </button>
      </div>
    </div>
  );
};

export default CenterOverview;