import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getLessonById } from "../../routes/center";

const CourseCard = ({ course }) => {
  const { t, i18n } = useTranslation("centerDashboard");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const handleShowDetails = async () => {
    // Check if course has a valid ID (try both _id and id)
    const lessonId =  course.id;
    if (!lessonId) {
      console.error("Course ID is undefined:", course);
      alert(t('courseCard.errors.invalidLessonId')); // Show user-friendly error
      return;
    }

    try {
      const response = await getLessonById(lessonId);
      if (response.status === "success") {
        navigate(`/dashboard/center-dashboard/lesson-details/${lessonId}`, { state: { lesson: response.data } });
      } else {
        throw new Error(response.message || "Failed to fetch lesson details");
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      alert(t('courseCard.errors.fetchLessonFailed', { message: error.message }));
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-r-4 border-primary">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-base-content/70">
            {t('courseCard.session', { session: course.session })}
          </span>
          <h3 className="text-lg font-bold">{course.subject}</h3>
        </div>
        <span className="text-sm text-base-content/70">
          {t(`courseCard.types.${course.type}`)}
        </span>
        <div className="mt-1 text-sm">
          {course.time}
          {course.date && <span className="ml-2">{course.date}</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {t('courseCard.lecturer')}
          </span>
          <span className="text-base font-bold">{course.teacher.name}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {t('courseCard.level')}
          </span>
          <span className="text-base font-bold">{course.teacher.group}</span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleShowDetails}
      >
        {t('courseCard.showDetails')}
      </button>
    </div>
  );
};

export default CourseCard;