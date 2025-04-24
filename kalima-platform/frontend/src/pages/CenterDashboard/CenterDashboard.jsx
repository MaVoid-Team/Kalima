import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CenterSelector from "./CenterSelector";
import CenterOverview from "./CenterOverview";
import LecturersList from "./LecturersList";
import CourseList from "./CourseList";
import ActivityTracker from "./ActivityTracker";
import AddCourseForm from "./AddCourseForm";
import PromoBanner from "./PromoBanner";
import { getAllCenters, getCenterDataByType } from "../../routes/center";

const CenterDashboard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [loading, setLoading] = useState({
    centers: true,
    lecturers: false,
    students: false,
    lessons: false
  });
  const [error, setError] = useState({
    centers: null,
    lecturers: null,
    students: null,
    lessons: null
  });
  
  // Fetch all centers
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(prev => ({ ...prev, centers: true }));
        const response = await getAllCenters();
        if (response.status === "success") {
          setCenters(response.data.data.centers);
          // Auto-select first center if available
          if (response.data.data.centers.length > 0) {
            setSelectedCenter(response.data.data.centers[0]);
          }
          setError(prev => ({ ...prev, centers: null }));
        } else {
          throw new Error(response.message || "Failed to fetch centers");
        }
      } catch (err) {
        setError(prev => ({ ...prev, centers: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, centers: false }));
      }
    };
    
    fetchCenters();
  }, []);
  
  // Fetch center data when a center is selected
  useEffect(() => {
    if (!selectedCenter) return;
    
    const fetchCenterData = async () => {
      // Fetch lecturers
      try {
        setLoading(prev => ({ ...prev, lecturers: true }));
        const lecturersResponse = await getCenterDataByType(selectedCenter._id, "lecturers");
        if (lecturersResponse.status === "success") {
          setLecturers(lecturersResponse.data);
          setError(prev => ({ ...prev, lecturers: null }));
        } else {
          throw new Error(lecturersResponse.message || "Failed to fetch lecturers");
        }
      } catch (err) {
        setError(prev => ({ ...prev, lecturers: err.message }));
        setLecturers([]);
      } finally {
        setLoading(prev => ({ ...prev, lecturers: false }));
      }
      
      // Fetch students
      try {
        setLoading(prev => ({ ...prev, students: true }));
        const studentsResponse = await getCenterDataByType(selectedCenter._id, "students");
        if (studentsResponse.status === "success") {
          setStudents(studentsResponse.data);
          setError(prev => ({ ...prev, students: null }));
        } else {
          throw new Error(studentsResponse.message || "Failed to fetch students");
        }
      } catch (err) {
        setError(prev => ({ ...prev, students: err.message }));
        setStudents([]);
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
      
      // Fetch lessons
      try {
        setLoading(prev => ({ ...prev, lessons: true }));
        const lessonsResponse = await getCenterDataByType(selectedCenter._id, "lessons");
        if (lessonsResponse.status === "success") {
          setLessons(lessonsResponse.data);
          setError(prev => ({ ...prev, lessons: null }));
        } else {
          throw new Error(lessonsResponse.message || "Failed to fetch lessons");
        }
      } catch (err) {
        setError(prev => ({ ...prev, lessons: err.message }));
        setLessons([]);
      } finally {
        setLoading(prev => ({ ...prev, lessons: false }));
      }
    };
    
    fetchCenterData();
  }, [selectedCenter]);
  
  const handleCenterChange = (center) => {
    setSelectedCenter(center);
  };
  
  const handleAddCourse = () => {
    setIsAddCourseModalOpen(true);
  };
  
  const handleCourseAdded = () => {
    // Refresh lessons data after a new course is added
    if (selectedCenter) {
      const fetchLessons = async () => {
        try {
          setLoading(prev => ({ ...prev, lessons: true }));
          const lessonsResponse = await getCenterDataByType(selectedCenter._id, "lessons");
          if (lessonsResponse.status === "success") {
            setLessons(lessonsResponse.data);
            setError(prev => ({ ...prev, lessons: null }));
          } else {
            throw new Error(lessonsResponse.message || "Failed to fetch lessons");
          }
        } catch (err) {
          setError(prev => ({ ...prev, lessons: err.message }));
        } finally {
          setLoading(prev => ({ ...prev, lessons: false }));
        }
      };
      
      fetchLessons();
    }
  };
  
  if (loading.centers && !selectedCenter) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }
  
  if (error.centers && !selectedCenter) {
    return (
      <div className="alert alert-error shadow-lg max-w-md mx-auto mt-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.centers}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Center Selector */}
      <div className="mb-6">
        <CenterSelector 
          centers={centers} 
          selectedCenter={selectedCenter} 
          onCenterChange={handleCenterChange} 
        />
      </div>
      
      {selectedCenter && (
        <>
          {/* Center Overview */}
          <div className="mb-8">
            <CenterOverview 
              center={selectedCenter} 
              lecturersCount={lecturers.length}
              studentsCount={students.length}
              lessonsCount={lessons.length}
            />
          </div>
          
          {/* Lecturers List */}
          <div className="mb-8">
            <LecturersList 
              lecturers={lecturers} 
              isLoading={loading.lecturers}
              error={error.lecturers}
            />
          </div>
          
          {/* Course List */}
          <div className="mb-8">
            <CourseList 
              lessons={lessons}
              lecturers={lecturers} // Pass lecturers to CourseList
              isLoading={loading.lessons}
              error={error.lessons}
              onAddCourse={handleAddCourse}
            />
          </div>
          <div className="mb-8">
            <PromoBanner />
          </div>
          
          {/* Activity Tracker */}
          <div className="mb-8">
            <ActivityTracker 
              students={students}
              isLoading={loading.students}
              error={error.students}
            />
          </div>
          
          {/* Add Course Modal */}
          <AddCourseForm 
            isOpen={isAddCourseModalOpen}
            onClose={() => setIsAddCourseModalOpen(false)}
            selectedCenter={selectedCenter}
            lecturers={lecturers}
            onCourseAdded={handleCourseAdded}
          />
        </>
      )}
    </div>
  );
};

export default CenterDashboard;