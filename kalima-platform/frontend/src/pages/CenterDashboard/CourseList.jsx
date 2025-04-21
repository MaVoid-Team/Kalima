// CourseList.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CourseCard from "./CourseCard";
import CourseFilters from "./CourseFilters";
import { getCenterTimetable } from "../../routes/center";

const CourseList = () => {
  const { t, i18n } = useTranslation("center");
  const isRTL = i18n.language === "ar";
  const [filters, setFilters] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const centerId = "67e84251abdebb74dd28df2c";
        const response = await getCenterTimetable(centerId);
        
        if (response.status === "success") {
          // Transform API data
          const formattedCourses = response.data.timetable.map((item, index) => ({
            id: item.lessonId || index,
            subject: item.subject,
            session: (index + 1).toString(),
            type: isRTL ? "محاضرة" : "Lecture",
            room: "N/A",
            time: `${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}`,
            teacher: {
              name: item.lecturer || (isRTL ? "غير معروف" : "Unknown"),
              email: "",
              group: item.level
            },
          }));

          // Extract unique teachers and groups
          const teacherMap = new Map();
          const groupSet = new Set();
          
          response.data.timetable.forEach(item => {
            if (!teacherMap.has(item.lecturer)) {
              teacherMap.set(item.lecturer, {
                name: item.lecturer,
                group: item.level
              });
            }
            groupSet.add(item.level);
          });

          setTeachers(Array.from(teacherMap.values()));
          setGroups(Array.from(groupSet));
          setCourses(formattedCourses);
          setError(null);
        } else {
          throw new Error(response.message || t("error.fetch_courses"));
        }
      } catch (err) {
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t, isRTL]);

  const filteredCourses = courses.filter(course => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'teacher') return course.teacher.name.includes(value);
      if (key === 'group') return course.teacher.group === value;
      return true;
    });
  });

  if (loading) return <div className="text-center py-4">{t("loading")}...</div>;
  if (error) return <div className="text-center text-error py-4">{error}</div>;

  return (
    <div dir={isRTL ? "ltr" : "rtl"}>
      <CourseFilters 
        teachers={teachers}
        groups={groups}
        onFilterChange={setFilters}
        isRTL={isRTL}
      />

      <div className="space-y-6 mt-8">
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} isRTL={isRTL} />
        ))}
      </div>
    </div>
  );
};

export default CourseList;