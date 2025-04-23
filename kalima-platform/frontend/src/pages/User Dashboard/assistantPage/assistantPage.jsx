// assistantPage.jsx
import { FaBell, FaEnvelope, FaChevronDown,FaBars } from 'react-icons/fa';
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
  const {t, i18n } = useTranslation();
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
      setSidebarOpen(!mobile);
    };
  
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  

  return (
     <div 
          className={`flex flex-col ${isRTL ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-screen bg-base-100 ${
            sidebarOpen && !isMobile ? ` ${isRTL ? 'mr-52' : 'ml-52'} transition-all duration-500` : `mr-0`
          }`} 
          dir={isRTL ? 'ltr' : 'rtl'}
        >
          {/* Mobile Sidebar Toggle Button */}
          <div className={`md:hidden fixed top-16 ${isRTL ? 'left-4' : 'right-4'} z-50`}>
            <button
              id="sidebar-toggle"
              className="btn btn-circle btn-primary"
              onClick={toggleSidebar}
              aria-label={t('toggleSidebar')}
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        <div className="container mx-auto">
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <CoursesSection />
      {/* <VideoSection /> */}
      <FeaturedCourses />
      {/* <RevisionCourses /> */}
      {/* <EliteAssistants /> */}
    </div>
    </div>
    
  );
};


export default AssistantPage;