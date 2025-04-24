"use client"

import { Suspense, lazy, useEffect, useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import NavBar from "./components/navbar"
import { LoadingSpinner } from "./components/LoadingSpinner"
import { isMobile } from "./utils/isMobile"
import MobileOnly from "./pages/User Dashboard/Lecture Page/mobileOnly"
import UnifiedSidebar from "./components/UnifiedSidebar"
import AssistantPage from "./pages/User Dashboard/assistantPage/assistantPage"


// Lazy load components
const Home = lazy(() => import("./pages/Home/Home"))
const AuditLog = lazy(() => import("./pages/User Dashboard/Admin dashboard/auditLog"))
const AdminDashboard = lazy(() => import("./pages/User Dashboard/Admin dashboard/home/adminDashboard"))
const CourseDetails = lazy(() => import("./pages/CourseDetails"))
const LecturesPage = lazy(() => import("./pages/lectures"))
const TeacherLogin = lazy(() => import("./pages/Login/login"))
const Footer = lazy(() => import("./components/footer"))
const CoursesPage = lazy(() => import("./pages/courses"))
const RegisterStudent = lazy(() => import("./pages/signup/StudentRegistration"))
const Teachers = lazy(() => import("./pages/Teachers"))
const TeacherDetails = lazy(() => import("./pages/teacher details/Teacher-details"))
const PromoCodes = lazy(() => import("./pages/User Dashboard/promoCodes"))
const SettingsPage = lazy(() => import("./pages/Settings/SettingsPage"))
const Services = lazy(() => import("./pages/Services/Services"))
const DashboardPage = lazy(() => import("./pages/Lecturer Dashboard/LecturerDashboard"))
// const LecturePage = lazy(() => import("./pages/User Dashboard/Lecture Page/LecturePage"))
const ContainersPage = lazy(() => import("./pages/User Dashboard/Lecture Page/ContainerPage"))
const ContainerDetails = lazy(() => import("./pages/User Dashboard/Lecture Page/ContainerDetails"))
const LectureDisplay = lazy(() => import("./pages/User Dashboard/Lecture Page/LectureDisplay"))
const UserDashboard = lazy(() => import("./pages/User Dashboard/assistantPage/assistantPage"))
const CoursesDashboard = lazy(() => import("./pages/CoursesDashboard/CoursesDashboard"))
const CenterDashboard = lazy(() => import("./pages/CenterDashboard/CenterDashboard"))
const PackagesPage = lazy(() => import("./pages/Packages Page/packagesPage"))
const PackageDetails = lazy(() => import("./pages/Packages Page/packageDetails"))
const CoursesForm = lazy(() => import("./pages/CoursesForm/CoursesForm"))

function App() {
  const location = useLocation()
  const [showUserNavbar, setShowUserNavbar] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // useEffect(() => {
  //   const handleContextMenu = (e) => e.preventDefault();
  //   const disableDrag = () => {
  //     document.querySelectorAll("img").forEach((img) => {
  //       img.setAttribute("draggable", "false");
  //     });
  //   };

  //   document.addEventListener("contextmenu", handleContextMenu);
  //   disableDrag(); // On mount

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //   };
  // }, []);

  useEffect(() => {
    // Show sidebar on any route that starts with "/dashboard/"
    const isDashboardRoute = location.pathname.startsWith('/dashboard/')
    setShowSidebar(isDashboardRoute)
    // You can keep or modify this based on your needs
    setShowUserNavbar(isDashboardRoute)
  }, [location.pathname])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="App">
       <NavBar />

      {/* Render the unified sidebar on dashboard routes */}
      {showSidebar && (
        <UnifiedSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
      )}

      <div 
        className={`transition-all duration-300 ${
          showSidebar && sidebarOpen ? 'md:mr-52' : 'ml-0'
        }`}
      >
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/services" element={<Services />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<TeacherLogin />} />
            <Route path="/register" element={<RegisterStudent />} />
            
            {/* Content Routes */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/lectures" element={<LecturesPage />} />
            {/* <Route path="/lectures/:lectureId" element={<LecturePage />} /> */}
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teacher-details/:userId" element={<TeacherDetails />} />
            <Route path="package-details/:packageId" element={<PackageDetails />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages" element={<PackagesPage />} /> 
            <Route path="/package-details/:packageId" element={<PackageDetails />} />


            {/* User Dashboard Routes */}
            <Route path="/dashboard/student-dashboard/lecture-page" element={<ContainersPage />} />
            <Route path="/dashboard/student-dashboard/promo-codes" element={<PromoCodes />} />
            <Route path="/dashboard/student-dashboard/container-details/:containerId" element={<ContainerDetails />} />
            <Route path="/dashboard/student-dashboard/lecture-display/:lectureId" element={<LectureDisplay />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />

            {/* Assistant Routes */}
            <Route path="/dashboard/assistant-page" element={<AssistantPage />} />
            {/* Admin Routes */}
            <Route path="/dashboard/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/admin-dashboard/audit-log" element={<AuditLog />} />
            
            {/* Lecturer Routes */}
            <Route path="/dashboard/lecturer-dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/lecturer-dashboard/lecture-page" element={<ContainersPage />} />
            <Route path="/dashboard/lecturer-dashboard/CoursesForm" element={<CoursesForm />} />
            <Route path="/dashboard/lecturer-dashboard/container-details/:containerId" element={<ContainerDetails />} />
            <Route path="/dashboard/lecturer-dashboard/lecture-display/:lectureId" element={<LectureDisplay />} />
            <Route path="/dashboard/coursesdashboard" element={<CoursesDashboard />} />
            <Route path="/dashboard/center-dashboard" element={<CenterDashboard />} />

          </Routes>
        </Suspense>
      </div>

      {/* Only show footer on public routes */}
      {!showUserNavbar && (
        <footer className="bg-base-200 p-4">
          <Footer />
        </footer>
      )}
    </div>
  )
}

export default App