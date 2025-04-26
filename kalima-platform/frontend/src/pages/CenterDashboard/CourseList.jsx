import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle } from 'lucide-react';
import CourseCard from "./CourseCard";
import { getAllLevels} from "../../routes/levels";
import { getAllSubjects } from "../../routes/courses";

const CourseList = ({ lessons, isLoading, error, onAddCourse, lecturers }) => {
  const { t, i18n } = useTranslation("center");
  const isRTL = i18n.language === "ar";
  
  const [filters, setFilters] = useState({
    subject: "",
    lecturer: "",
    level: ""
  });
  
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [mappedLessons, setMappedLessons] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch subjects and levels for name mapping
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch subjects
        const subjectsResponse = await getAllSubjects();
        if (subjectsResponse.success) {
          setSubjects(subjectsResponse.data.subjects || []);
        }
        
        // Fetch levels
        const levelsResponse = await getAllLevels();
        if (levelsResponse.success) {
          setLevels(levelsResponse.data.levels || []);
        }
      } catch (err) {
        console.error("Error fetching data for mapping:", err);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Map IDs to names when data is available
  useEffect(() => {
    if (!lessons || dataLoading || isLoading) return;
    
    // Create lookup maps for faster access
    const subjectMap = new Map(subjects.map(subject => [subject._id, subject.name]));
    const levelMap = new Map(levels.map(level => [level._id, level.name]));
    const lecturerMap = new Map(lecturers.map(lecturer => [lecturer._id, lecturer.name]));
    
    // Map lessons with names instead of IDs
    const mapped = lessons.map((lesson, index) => {
      const startTime = new Date(lesson.startTime);
      let endTime;
      
      if (lesson.duration) {
        endTime = new Date(startTime.getTime() + lesson.duration * 60000);
      } else {
        // Default duration of 60 minutes if not specified
        endTime = new Date(startTime.getTime() + 60 * 60000);
      }
      
      return {
        id: lesson._id,
        subject: subjectMap.get(lesson.subject) || lesson.subject,
        subjectId: lesson.subject,
        session: (index + 1).toString(),
        type: isRTL ? "محاضرة" : "Lecture",
        room: "N/A",
        time: `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: startTime.toLocaleDateString(),
        teacher: {
          name: lecturerMap.get(lesson.lecturer) || lesson.lecturer,
          id: lesson.lecturer,
          group: levelMap.get(lesson.level) || lesson.level,
          levelId: lesson.level
        },
      };
    });
    
    setMappedLessons(mapped);
  }, [lessons, subjects, levels, lecturers, dataLoading, isLoading, isRTL]);

  // Extract unique subjects, lecturers, and levels for filters from the mapped data
  const uniqueSubjects = [...new Set(mappedLessons.map(lesson => lesson.subject))];
  const uniqueLecturers = [...new Set(mappedLessons.map(lesson => lesson.teacher.name))];
  const uniqueLevels = [...new Set(mappedLessons.map(lesson => lesson.teacher.group))];

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredLessons = mappedLessons.filter(lesson => {
    const matchesSubject = !filters.subject || lesson.subject === filters.subject;
    const matchesLecturer = !filters.lecturer || lesson.teacher.name === filters.lecturer;
    const matchesLevel = !filters.level || lesson.teacher.group === filters.level;

    return matchesSubject && matchesLecturer && matchesLevel;
  });

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">
          {isRTL ? "الدورات والمحاضرات" : "Courses & Lectures"}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="select select-bordered"
            value={filters.level}
            onChange={(e) => handleFilterChange("level", e.target.value)}
          >
            <option value="">{isRTL ? "جميع المستويات" : "All Levels"}</option>
            {uniqueLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select 
            className="select select-bordered"
            value={filters.lecturer}
            onChange={(e) => handleFilterChange("lecturer", e.target.value)}
          >
            <option value="">{isRTL ? "جميع المحاضرين" : "All Lecturers"}</option>
            {uniqueLecturers.map(lecturer => (
              <option key={lecturer} value={lecturer}>{lecturer}</option>
            ))}
          </select>
          
          <button 
            className="btn btn-primary"
            onClick={onAddCourse}
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            {isRTL ? "إضافة محاضرة" : "Add Lecture"}
          </button>
        </div>
      </div>
      
      {isLoading || dataLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="space-y-4">
          {filteredLessons.map(lesson => (
            <CourseCard key={lesson.id} course={lesson} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-base-content/70">
          {isRTL ? "لا توجد محاضرات" : "No lessons found"}
        </div>
      )}
    </div>
  );
};

export default CourseList;