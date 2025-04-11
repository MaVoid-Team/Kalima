// assistantPage.jsx
import { FaBell, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import CoursesSection from './CoursesSection';
import VideoSection from './VideoSection';
import FeaturedCourses from './FeaturedCourses';
import UserSidebar from '../../../components/UserSidebar';
import { useEffect, useState } from 'react';
import RevisionCourses from './RevisionCourses';
import EliteAssistants from './EliteAssistants';
import { useTranslation } from 'react-i18next';

const AssistantPage = () => {
   const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Dummy profile data
  const profile = {
    name: "John Doe",
    role: "Teaching Assistant",
    image: "https://via.placeholder.com/40"
  };
   useEffect(() => {
      const checkScreenSize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setSidebarOpen(!mobile); // Open by default on desktop, closed on mobile
      };
        const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
      // Initial check
      checkScreenSize();
      
      // Add event listener
      window.addEventListener('resize', checkScreenSize);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

  return (
    <div className="mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`transition-all duration-300 ${!isMobile && sidebarOpen ? (isRTL ? 'md:mr-24' : 'md:ml-24') : 'md:mrl-0'}`}>
        <div className="container mx-auto">
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <CoursesSection />
      <VideoSection />
      <FeaturedCourses />
      <RevisionCourses />
      <EliteAssistants />
    </div>
    </div>
    </div>
  );
};


export default AssistantPage;