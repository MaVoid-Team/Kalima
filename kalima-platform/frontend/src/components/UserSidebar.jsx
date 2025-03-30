import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaClipboardList, FaTicketAlt, FaGraduationCap, FaCog, FaSignOutAlt, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const UserSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  const menuItems = [
    { id: 1, title: 'لوحة القيادة', icon: <MdDashboard className="w-5 h-5" />, path: '/dashboard' },
    { id: 2, title: 'معلوماتي', icon: <FaUser className="w-5 h-5" />, path: '/profile' },
    { id: 3, title: 'كورساتي', icon: <FaGraduationCap className="w-5 h-5" />, path: '/lecture-page' },
    { id: 4, title: 'اكواد الشحن', icon: <FaTicketAlt className="w-5 h-5" />, path: '/promo-codes' },
    { id: 5, title: 'الواجب', icon: <FaClipboardList className="w-5 h-5" />, path: '/assignments' },
    { id: 6, title: 'الاختبارات', icon: <FaClipboardList className="w-5 h-5" />, path: '/exams' },
    { id: 7, title: 'الاعدادات', icon: <FaCog className="w-5 h-5" />, path: '/settings' },
    { id: 8, title: 'تسجيل الخروج', icon: <FaSignOutAlt className="w-5 h-5" />, path: '/logout' },
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
        className={`fixed top-14 bottom-0 right-0 w-52 bg-base-100 border-l border-base-300 shadow-md z-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary text-primary-content rounded-full p-2">
              <FaUser className="w-5 h-5" />
            </div>
            <span className="mr-2 font-bold text-primary">لوحة القيادة</span>
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
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center py-3 px-4 hover:bg-base-200 transition-colors ${
                location.pathname === item.path ? 'text-primary border-r-4 border-primary bg-primary bg-opacity-10' : 'text-base-content'
              }`}
              onClick={() => isMobile && toggleSidebar()}
            >
              <div className={`ml-3 ${location.pathname === item.path ? 'text-primary' : 'text-base-content'}`}>
                {item.icon}
              </div>
              <span className="text-sm">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Desktop Toggle Button */}
      <button
        className="hidden md:flex fixed top-20 right-0 z-40 bg-primary text-primary-content p-2 rounded-r-md shadow-md transition-transform duration-300 ease-in-out"
        style={{ 
          transform: isOpen ? 'translateX(-16rem)' : 'translateX(0)',
        }}
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <FaChevronRight className="w-4 h-4" /> : <FaChevronLeft className="w-4 h-4" />}
      </button>
    </>
  );
};

export default UserSidebar;