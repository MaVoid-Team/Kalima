import { useTranslation } from "react-i18next";

const CourseCard = ({ course }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  return (
    <div className="bg-base-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-r-4 border-primary">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-base-content/70">
            {isRTL ? `الحصة ${course.session}` : `Session ${course.session}`}
          </span>
          <h3 className="text-lg font-bold">{course.subject}</h3>
        </div>
        <span className="text-sm text-base-content/70">
          {isRTL ? "محاضرة" : course.type}
        </span>
        <div className="mt-1 text-sm">
          {course.time}
          {course.date && <span className="ml-2">{course.date}</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isRTL ? "المحاضر" : "Lecturer"}
          </span>
          <span className="text-base font-bold">{course.teacher.name}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isRTL ? "المستوى" : "Level"}
          </span>
          <span className="text-base font-bold">{course.teacher.group}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;