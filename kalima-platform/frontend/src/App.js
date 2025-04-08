import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { isMobile } from "./utils/isMobile";
import MobileOnly from "./pages/Lecture Page/mobileOnly";
import LectureDetail from "./pages/Lecture Page/ContainerDetails";
import ContainerDetailsPage from "./pages/Lecture Page/ContainerDetails";
// Lazy load components
const Home = lazy(() => import("./pages/Home/Home"));
const AuditLog = lazy(() => import("./pages/Admin dashboard/auditLog"));
const AdminDashboard = lazy(() => import("./pages/Admin dashboard/adminDashboard"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
// const About = lazy(() => import('./pages/About'));
const CivilcoLanding = lazy(() => import("./pages/landing"));
const LoginStudent = lazy(() => import("./pages/Login/login-student"));
const TeacherLogin = lazy(() => import("./pages/Login/login-teacher"));
const Footer = lazy(() => import("./components/footer"));
const CoursesPage = lazy(() => import("./pages/courses"));
const RegisterStudent = lazy(() => import("./pages/signup/StudentRegistration"));
const Teachers = lazy(() => import("./pages/Teachers"));
const TeacherDetails = lazy(() => import("./pages/teacher details/Teacher-details"));
const PromoCodes = lazy(() => import("./pages/User Dashboard/promoCodes"));
const LectureList = lazy(() => import("./pages/Lecture Page/LectureDisplay"));
const ContainerDetails = lazy(() => import("./pages/Lecture Page/ContainerDetails"));
const SettingsPage = lazy(() => import("./pages/Settings/SettingsPage"));
const Services = lazy(() => import("./pages/Services/Services"));
function App() {
  return (
    <div className="App">
      <NavBar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterStudent />} />
          <Route path="/login-student" element={<LoginStudent />} />
          <Route path="/landing" element={<CivilcoLanding />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login-teacher" element={<TeacherLogin />} />
          <Route path="/teacher-details/:id" element={<TeacherDetails />} />
          <Route path="/mobile-only" element={<MobileOnly />} />
          <Route path="/lecture-page" element={isMobile ?  <LectureList /> : <MobileOnly />} />
          <Route path="/promo-codes" element={<PromoCodes />} />
          <Route path="/lecture-details/:id" element={<ContainerDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Routes>
      </Suspense>

      <footer className="bg-base-200 p-4">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
