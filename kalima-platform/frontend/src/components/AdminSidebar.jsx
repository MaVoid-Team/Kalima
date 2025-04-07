import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUser, FaClipboardList, FaTicketAlt, FaGraduationCap, FaCog, FaSignOutAlt, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import  Activity  from '../pages/Admin dashboard/userManageTable';
const UserSidebar = ({ isOpen, toggleSidebar }) => {
  const { t, i18n } = useTranslation('common');
  const isRTL = i18n.language === 'ar';
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    { id: 1, title: t('activity'), icon: <MdDashboard className="w-5 h-5" />, path: '/activity' },
    { id: 2, title: t('profile'), icon: <FaUser className="w-5 h-5" />, path: '/profile' },
    { id: 3, title: t('courses'), icon: <FaGraduationCap className="w-5 h-5" />, path: '/lecture-page' },
    { id: 4, title: t('promoCodes'), icon: <FaTicketAlt className="w-5 h-5" />, path: '/promo-codes' },
    { id: 5, title: t('assignments'), icon: <FaClipboardList className="w-5 h-5" />, path: '/assignments' },
    { id: 6, title: t('exams'), icon: <FaClipboardList className="w-5 h-5" />, path: '/exams' },
    { id: 7, title: t('settings'), icon: <FaCog className="w-5 h-5" />, path: '/settings' },
    { id: 8, title: t('logout'), icon: <FaSignOutAlt className="w-5 h-5" />, path: '/logout' },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('user-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (
        sidebar && 
        !sidebar.contains(event.target) && 
        toggleButton && 
        !toggleButton.contains(event.target) && 
        isOpen && 
        isMobile
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar, isMobile]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="user-sidebar"
        className={`fixed top-14 bottom-0 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } w-52 bg-base-100 border-base-300 shadow-md z-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className={`flex gap-3 items-center ${isRTL ? 'flex-row-reverse' : ''} mx-auto`}> 
            <span className="font-bold text-primary">{t('dashboardTitle')}</span>
            <div className="bg-primary text-primary-content rounded-full p-2">
              <FaUser className="w-2 h-2" />
            </div>
          </div>
          {isMobile && (
            <button 
              className="text-base-content hover:text-primary"
              onClick={toggleSidebar}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex flex-col h-full overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-between py-3 px-4 hover:bg-base-200 transition-colors ${
                location.pathname === item.path 
                  ? `text-primary ${isRTL ? 'border-r-4' : 'border-l-4'} border-primary bg-primary bg-opacity-10` 
                  : 'text-base-content'
              } ${index === menuItems.length - 3 ? 'border-b-2 border-base-300' : ''}`}
              onClick={() => isMobile && toggleSidebar()}
            ><div className={`${isRTL ? 'ml-3' : 'mr-3'} text-primary`}>
                {item.icon}
              </div>
              <span className="text-sm mx-auto">{item.title}</span>
              
            </Link>
          ))}
        </div>
      </div>
      
      {/* Desktop Toggle Button */}
      <button
          className={`hidden md:flex fixed top-20 ${
            isRTL ? 'right-0' : 'left-0'
          } z-40 bg-primary text-primary-content p-2 ${
            isRTL ? 'rounded-r-md' : 'rounded-l-md'
          } shadow-md transition-transform duration-300 ease-in-out`}
          style={{ 
            transform: isOpen 
              ? `translateX(${isRTL ? '-13rem' : '13rem'})`  // Adjusted to match sidebar width
              : 'translateX(0)',
          }}
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <FaChevronRight className={`w-4 h-4 ${!isRTL && 'rotate-180'}`} />
        ) : (
          <FaChevronLeft className={`w-4 h-4 ${!isRTL && 'rotate-180'}`} />
        )}
      </button>
    </>
  );
};

export default UserSidebar;