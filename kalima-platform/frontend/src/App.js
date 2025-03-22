import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/navbar";
import { Teachers } from "./pages/Teachers";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load components
const Home = lazy(() => import("./pages/Home/Home"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
// const About = lazy(() => import('./pages/About'));
const CivilcoLanding = lazy(() => import("./pages/landing"));
const Login = lazy(() => import("./pages/Login/login"));
const Register = lazy(() => import("./pages/register"));
const Footer = lazy(() => import("./components/footer"));
const CoursesPage = lazy(() => import("./pages/courses"));

function App() {
  return (
    <div className="App">
      <NavBar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<CivilcoLanding />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/teachers" element={<Teachers />} />
        </Routes>
      </Suspense>

      <footer className="bg-base-300 p-4">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
