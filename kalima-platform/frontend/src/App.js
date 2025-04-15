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
const AuditLog = lazy(() => import("./pages/User Dashboard/Admin dashboard/auditLog"))
const AdminDashboard = lazy(() => import("./pages/User Dashboard/Admin dashboard/adminDashboard"))
const CourseDetails = lazy(() => import("./pages/CourseDetails"))
const LecturesPage = lazy(() => import("./pages/lectures"))
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
const UserDashboard = lazy(() => import("./pages/User Dashboard/assistantPage/assistantPage"))
const CoursesDashboard = lazy(() => import("./pages/CoursesDashboard/CoursesDashboard"))
const CenterDashboard = lazy(() => import("./pages/CenterDashboard/CenterDashboard"))
function App() {
  const location = useLocation()
  const [showUserNavbar, setShowUserNavbar] = useState(false)
  const [showUserSidebar, setShowUserSidebar] = useState(false)

  // Define routes that should show user-specific UI components
  const userRoutes = [
    "/dashboard",
    "/dashboard/lecture-page",
    "/dashboard/promo-codes",
    "/settings",
    "/lecture-details",
    "/lecture-details/:lectureId",
    "/container-details/:containerId",
    "/container-details/:containerId/lecture-page/:lectureId"
  ]

  useEffect(() => {
    // Check if current route should show user-specific components
    const isUserRoute = userRoutes.some(route => {
      if (route.includes(':')) {
        // Handle dynamic routes
        const routeParts = route.split('/')
        const pathParts = location.pathname.split('/')
        
        if (routeParts.length !== pathParts.length) return false
        
        return routeParts.every((part, i) => {
          return part.startsWith(':') || part === pathParts[i]
        })
      }
      return route === location.pathname
    })

    setShowUserNavbar(isUserRoute)
    setShowUserSidebar(isUserRoute)
  }, [location.pathname])

  return (
    <div className="App">
      {showUserNavbar ? <UserNavbar /> : <NavBar />}
      {showUserSidebar ? <UserSidebar /> : null}

      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<CivilcoLanding />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/services" element={<Services />} />
          
          {/* Authentication Routes */}
          <Route path="/login-student" element={<LoginStudent />} />
          <Route path="/login-teacher" element={<TeacherLogin />} />
          <Route path="/register" element={<RegisterStudent />} />
          
          {/* Content Routes */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/lectures" element={<LecturesPage />} />
          <Route path="/lectures/:lectureId" element={<LecturePage />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teacher-details/:userId" element={<TeacherDetails />} />
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<AssistantPage />} />
          <Route path="/dashboard/lecture-page" element={<LectureList />} />
          <Route path="/dashboard/promo-codes" element={<PromoCodes />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/audit-log" element={<AuditLog />} />
          
          {/* Lecturer Routes */}
          <Route path="/lecturer-dashboard" element={<DashboardPage />} />
          <Route path="/coursesdashboard" element={<CoursesDashboard />} />
          <Route path="container-details/:containerId" element={<ContainerDetails />} />
          <Route path="container-details/:containerId/lecture-page/:lectureId" element={<LecturePage />} />
          <Route path="dashboard/assistant-page" element={<AssistantPage />} />
          <Route path="/dashboard/center-dashboard" element={<CenterDashboard />} />
        </Routes>
      </Suspense>

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