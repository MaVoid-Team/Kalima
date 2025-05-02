import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Capacitor } from '@capacitor/core'; // Import Capacitor

import CenterSelector from "./CenterSelector";
import CenterOverview from "./CenterOverview";
import LecturersList from "./LecturersList";
import CourseList from "./CourseList";
// import ActivityTracker from "./ActivityTracker";
import AddCourseForm from "./AddCourseForm";
import BarcodeScannerAndroid from "./BarcodeScannerMobile";
import QrScannerCard from "./QrScannerCard";
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
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

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

  // Fetch center data when a center is selected
  useEffect(() => {
    if (!selectedCenter) return;

    const fetchCenterData = async () => {
      // Reset data and loading/error states for the new center
      setLecturers([]);
      setStudents([]);
      setLessons([]);
      setLoading(prev => ({ ...prev, lecturers: true, students: true, lessons: true }));
      setError(prev => ({ ...prev, lecturers: null, students: null, lessons: null }));


      // Fetch lecturers
      try {
        const lecturersResponse = await getCenterDataByType(selectedCenter._id, "lecturers");
        if (lecturersResponse.status === "success") {
          setLecturers(lecturersResponse.data);
          setError(prev => ({ ...prev, lecturers: null }));
        } else {
          throw new Error(lecturersResponse.message || t('errors.fetchLecturersFailed'));
        }
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setError(prev => ({ ...prev, lecturers: err.message }));
        setLecturers([]); // Clear lecturers on error
      } finally {
        setLoading(prev => ({ ...prev, lecturers: false }));
      }

      // Fetch students
      try {
        const studentsResponse = await getCenterDataByType(selectedCenter._id, "students");
        if (studentsResponse.status === "success") {
          setStudents(studentsResponse.data);
          setError(prev => ({ ...prev, students: null }));
        } else {
          throw new Error(studentsResponse.message || t('errors.fetchStudentsFailed'));
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(prev => ({ ...prev, students: err.message }));
        setStudents([]); // Clear students on error
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }

      // Fetch lessons
      try {
        const lessonsResponse = await getCenterDataByType(selectedCenter._id, "lessons");
        if (lessonsResponse.status === "success") {
          setLessons(lessonsResponse.data);
          setError(prev => ({ ...prev, lessons: null }));
        } else {
          throw new Error(lessonsResponse.message || t('errors.fetchLessonsFailed'));
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError(prev => ({ ...prev, lessons: err.message }));
        setLessons([]); // Clear lessons on error
      } finally {
        setLoading(prev => ({ ...prev, lessons: false }));
      }
    };

    fetchCenterData();
  }, [selectedCenter, t]); // Depend on selectedCenter and t

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
            throw new Error(lessonsResponse.message || t('errors.fetchLessonsFailed'));
          }
        } catch (err) {
          console.error("Error fetching lessons after adding course:", err);
          setError(prev => ({ ...prev, lessons: err.message }));
          setLessons([]); // Clear lessons on error
        } finally {
          setLoading(prev => ({ ...prev, lessons: false }));
        }
      };

      fetchLessons();
    }
  };

  // You might want to add a handler here for when a barcode is scanned by either component
  const handleBarcodeScanned = (barcodeData) => {
      console.log("Barcode Scanned in Dashboard:", barcodeData);
      // Implement your logic here, e.g.,
      // - Validate the barcode data
      // - Find the corresponding student/entity
      // - Record attendance or perform other actions
      // You'll likely need selectedCenter._id here
      if (selectedCenter) {
          console.log(`Processing barcode ${barcodeData} for center ${selectedCenter._id}`);
          // Add your API call or state update logic
      } else {
          console.warn("Barcode scanned but no center is selected.");
      }
      // Potentially show a success/error message to the user
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

          {/* Conditional Rendering for Barcode Scanner */}
          {selectedCenter && (
            <div className="mb-8">
              {isAndroidNative ? (
                <BarcodeScannerAndroid
                  centerId={selectedCenter._id}
                  centerName={selectedCenter.name}
                  // Pass translations specific to the barcode scanner
                  translations={{
                    title: t('barCodeScanner.title'),
                    startButton: t('barCodeScanner.startButton'), // Add specific keys if needed
                    scanning: t('barCodeScanner.scanning'),
                    resultLabel: t('barCodeScanner.resultLabel'),
                    noBarcodeDetected: t('barCodeScanner.noBarcodeDetected'),
                    permissionWarning: t('barCodeScanner.permissionWarning'),
                    grantPermission: t('barCodeScanner.grantPermission'),
                    scanError: t('barCodeScanner.scanError'),
                    scanInstructions: t('barCodeScanner.scanInstructions')
                    // Add other scanner-specific translation keys
                  }}
                   // You might want to add an onScanSuccess prop to handle the result in the dashboard
                   // onScanSuccess={handleBarcodeScanned}
                />
              ) : (
                // Render the existing QrScannerCard for desktop/web
                <QrScannerCard
                  centerId={selectedCenter._id}
                  centerName={selectedCenter.name}
                  // Pass relevant props to QrScannerCard
                  isLoading={loading.lessons} // Still passing lessons loading as per original, consider if needed
                  error={error.lessons && t(error.lessons)} // Still passing lessons error as per original
                  translations={{
                     title: t('qrScannerCard.title'), // Assuming different keys for QR scanner
                     instructions: t('qrScannerCard.instructions'),
                     // Add other QR scanner-specific translation keys
                  }}
                  // Assuming QrScannerCard also has an onScanSuccess prop
                  // onScanSuccess={handleBarcodeScanned}
                />
              )}
            </div>
          )}
           {/* End Conditional Rendering */}


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