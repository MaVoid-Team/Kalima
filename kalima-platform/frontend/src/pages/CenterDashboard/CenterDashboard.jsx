import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import CenterSelector from "./CenterSelector";
import CenterOverview from "./CenterOverview";
import LecturersList from "./LecturersList";
import CourseList from "./CourseList";
// import ActivityTracker from "./ActivityTracker";
import AddCourseForm from "./AddCourseForm";
// import ReportsSection from "./Reports";

import { getAllCenters, getCenterDataByType } from "../../routes/center";
import RevenueGenerator from "./Revenue";

const CenterDashboard = () => {
  const { t, i18n } = useTranslation("centerDashboard");
  const isRTL = i18n.language === 'ar';

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

  // Determine if running on Android native platform

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(prev => ({ ...prev, centers: true }));
        const response = await getAllCenters();
        if (response.status === "success") {
          setCenters(response.data.data.centers);
          if (response.data.data.centers.length > 0) {
            setSelectedCenter(response.data.data.centers[0]);
          }
          setError(prev => ({ ...prev, centers: null }));
        } else {
          // Use response.message if available, otherwise fallback
          throw new Error(response.message || t('errors.fetchCentersFailed'));
        }
      } catch (err) {
        console.error("Error fetching centers:", err);
        setError(prev => ({ ...prev, centers: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, centers: false }));
      }
    };

    fetchCenters();
  }, [t]);

  const fetchDataByType = useCallback(async (type, setter, errorKey) => {
    if (!selectedCenter) return;

    setLoading(prev => ({ ...prev, [errorKey]: true }));
    try {
      const response = await getCenterDataByType(selectedCenter._id, type);
      if (response.status === "success") {
        setter(response.data);
        setError(prev => ({ ...prev, [errorKey]: null }));
      } else {
        const capitalizedKey = errorKey.charAt(0).toUpperCase() + errorKey.slice(1);
        throw new Error(response.message || t(`errors.fetch${capitalizedKey}Failed`));
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(prev => ({ ...prev, [errorKey]: err.message }));
      setter([]); // Clear data on error
    } finally {
      setLoading(prev => ({ ...prev, [errorKey]: false }));
    }
  }, [selectedCenter, t]);

  // Fetch center data when a center is selected
  useEffect(() => {
    if (!selectedCenter) return;

    // Reset data and loading/error states for the new center
    setLecturers([]);
    setStudents([]);
    setLessons([]);
    setLoading(prev => ({ ...prev, lecturers: true, students: true, lessons: true }));
    setError(prev => ({ ...prev, lecturers: null, students: null, lessons: null }));

    fetchDataByType("lecturers", setLecturers, "lecturers");
    fetchDataByType("students", setStudents, "students");
    fetchDataByType("lessons", setLessons, "lessons");

  }, [selectedCenter, fetchDataByType]);

  const handleCenterChange = (center) => {
    setSelectedCenter(center);
  };

  const handleAddCourse = () => {
    setIsAddCourseModalOpen(true);
  };

  const handleCourseAdded = () => {
    // Refresh lessons data after a new course is added
    if (selectedCenter) {
      fetchDataByType("lessons", setLessons, "lessons");
    }
  };

  // You might want to add a handler here for when a barcode is scanned by either component
 


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
          <span>{error.centers}</span> {/* Display actual error message */}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <CenterSelector
          centers={centers}
          selectedCenter={selectedCenter}
          onCenterChange={handleCenterChange}
          label={t('centerSelector.selectCenter')}
        />
      </div>

      {selectedCenter && (
        <>
          <div className="mb-8">
            <CenterOverview
              center={selectedCenter}
              lecturersCount={lecturers.length}
              studentsCount={students.length}
              lessonsCount={lessons.length}
              translations={{
                title: t('centerOverview.title'),
                lecturers: t('centerOverview.lecturers'),
                students: t('centerOverview.students'),
                courses: t('centerOverview.courses')
              }}
            />
          </div>
          <div className="mb-8">
              <RevenueGenerator />
          </div>


          <div className="mb-8">
            <LecturersList
              lecturers={lecturers}
              isLoading={loading.lecturers}
              error={error.lecturers && t(error.lecturers)}
              translations={{
                title: t('lecturersList.title'),
                noLecturers: t('lecturersList.noLecturers')
              }}
            />
          </div>

          <div className="mb-8">
            <CourseList
              lessons={lessons}
              lecturers={lecturers}
              isLoading={loading.lessons}
              error={error.lessons && t(error.lessons)}
              translations={{
                title: t('courseList.title'),
                addCourse: t('courseList.addCourse'),
                noCourses: t('courseList.noCourses')
              }}
              onAddCourse={handleAddCourse}
            />
          </div>
          {/* <div className="mb-8">
            <ReportsSection
              students={students}
              lessons={lessons}
              selectedCenter={selectedCenter}
              translations={{
                title: t('reportsSection.title'),
                generateReport: t('reportsSection.generateReport'),
                noReports: t('reportsSection.noReports')
              }} />
          </div> */}

          {/* <div className="mb-8">
            <ActivityTracker
              students={students}
              isLoading={loading.students}
              error={error.students && t(error.students)}
              translations={{
                title: t('activityTracker.title'),
                columns: {
                  student: t('activityTracker.columns.student'),
                  lastActivity: t('activityTracker.columns.lastActivity'),
                  status: t('activityTracker.columns.status')
                }
              }}
            />
          </div> */}

          <AddCourseForm
            isOpen={isAddCourseModalOpen}
            onClose={() => setIsAddCourseModalOpen(false)}
            selectedCenter={selectedCenter}
            lecturers={lecturers}
            onCourseAdded={handleCourseAdded}
            translations={{
              title: t('addCourseForm.title'),
              courseName: t('addCourseForm.courseName'),
              selectLecturer: t('addCourseForm.selectLecturer'),
              submit: t('addCourseForm.submit'),
              cancel: t('addCourseForm.cancel'),
              validation: {
                courseNameRequired: t('addCourseForm.validation.courseNameRequired'),
                lecturerRequired: t('addCourseForm.validation.lecturerRequired')
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default CenterDashboard;
