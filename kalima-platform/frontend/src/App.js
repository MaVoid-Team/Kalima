import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import NavBar from './components/navbar';
// Lazy load components
const Home = lazy(() => import('./pages/Home/Home'));
// const About = lazy(() => import('./pages/About'));
const CivilcoLanding = lazy(() => import('./pages/landing'));
const Login = lazy(() => import('./pages/Login/login'));
const Register = lazy(() => import('./pages/register'));
const Footer = lazy(() => import('./components/footer'));
const CoursesPage = lazy(() => import('./pages/courses'));
// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <div className="App">
      
      <NavBar/>
      {/* <nav className="bg-base-300 p-4">
        <ul className="flex space-x-4">
          <li><Link to="/" className="link">Home</Link></li>
          <li><Link to="/about" className="link">About</Link></li>
          <li><Link to="/contact" className="link">Contact</Link></li>
          <li><Link to="/login" className="link">Login</Link></li>
        </ul>
      </nav> */}

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<CivilcoLanding />} />
          <Route path='/courses' element={<CoursesPage />} />
        </Routes>
      </Suspense>

      <footer className='bg-base-300 p-4'>
        <Footer />
      </footer>
      
    </div>
  );
}

export default App;