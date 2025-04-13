"use client"

import { Suspense, lazy, useEffect, useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import NavBar from "./components/navbar"
import UserNavbar from "./components/UserNavbar"
import { LoadingSpinner } from "./components/LoadingSpinner"
import { isMobile } from "./utils/isMobile"
import MobileOnly from "./pages/User Dashboard/Lecture Page/mobileOnly"
import UserSidebar from "./components/UserSidebar"
import AssistantPage from "./pages/User Dashboard/assistantPage/assistantPage"

// Lazy load components
const Home = lazy(() => import("./pages/Home/Home"))
const AuditLog = lazy(() => import("./pages/Admin dashboard/auditLog"))
const AdminDashboard = lazy(() => import("./pages/Admin dashboard/adminDashboard"))
const CourseDetailsId = lazy(() => import("./pages/CourseDetails"))
// const About = lazy(() => import('./pages/About'));
const CivilcoLanding = lazy(() => import("./pages/landing"))
const LoginStudent = lazy(() => import("./pages/Login/login-student"))
const TeacherLogin = lazy(() => import("./pages/Login/login-teacher"))
const Footer = lazy(() => import("./components/footer"))
const CoursesPage = lazy(() => import("./pages/courses"))
const RegisterStudent = lazy(() => import("./pages/signup/StudentRegistration"))
const Teachers = lazy(() => import("./pages/Teachers"))
const TeacherDetails = lazy(() => import("./pages/teacher details/Teacher-details"))
const PromoCodes = lazy(() => import("./pages/User Dashboard/promoCodes"))
const LectureList = lazy(() => import("./pages/User Dashboard/Lecture Page/LectureDisplay"))
const ContainerDetails = lazy(() => import("./pages/User Dashboard/Lecture Page/ContainerDetails"))
const SettingsPage = lazy(() => import("./pages/Settings/SettingsPage"))
const Services = lazy(() => import("./pages/Services/Services"))
const DashboardPage = lazy(() => import("./pages/Lecturer Dashboard/LecturerDashboard"))
const LecturePage = lazy(() => import("./pages/User Dashboard/Lecture Page/LecturePage"))
const CourseDetails = lazy(() => import("./pages/Lecturer Dashboard/coursesDetails"))
const UserDashboard = lazy(() => import("./pages/User Dashboard/assistantPage/assistantPage"))
function App() {
  const location = useLocation()
  const [showUserNavbar, setShowUserNavbar] = useState(false)
  const [showUserSidebar, setShowUserSidebar] = useState(false)

  const userSidebarRoutes = ["/dashboard", "/dashboard/lecture-page", "/dashboard/promo-codes", "/settings", "/lecture-details/:lectureId", "/lecture-details"]

  useEffect(() => {
    // Check if current route should show UserSidebar
    const shouldShowUserSidebar = userSidebarRoutes.includes(location.pathname)
    setShowUserSidebar(shouldShowUserSidebar)
  }, [location.pathname])
  // Routes where UserNavbar should be shown
  const userNavbarRoutes = ["/mobile-only", "/dashboard/lecture-page", "/dashboard/promo-codes", "/settings", "/lecture-details/:lectureId", "/lecture-details"]

  useEffect(() => {
    // Check if current route should show UserNavbar
    const shouldShowUserNavbar = userNavbarRoutes.includes(location.pathname)
    setShowUserNavbar(shouldShowUserNavbar)
  }, [location.pathname])

  return (
    <div className="App">
      {showUserNavbar ? <UserNavbar /> : <NavBar />}
      {showUserSidebar ? <UserSidebar /> : null}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterStudent />} />
          <Route path="/login-student" element={<LoginStudent />} />
          <Route path="/landing" element={<CivilcoLanding />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course-details/:containerId" element={<CourseDetailsId />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login-teacher" element={<TeacherLogin />} />
          <Route path="/teacher-details/:id" element={<TeacherDetails />} />
          <Route path="/mobile-only" element={<MobileOnly />} />
          <Route path="/dashboard/lecture-page" element={isMobile ? <LectureList /> : <MobileOnly />} />
          <Route path="/dashboard/promo-codes" element={<PromoCodes />} />
          <Route path="/container-details/:containerId" element={<ContainerDetails />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/lecturer-dashboard" element={<DashboardPage />} />
          <Route path="container-details/:containerId/lecture-page/:lectureId" element={<LecturePage />} />
          <Route path="/course-details" element={<CourseDetails />} />
          
        </Routes>
      </Suspense>

      <footer className="bg-base-200 p-4">
        <Footer />
      </footer>
    </div>
  )
}

export default App
