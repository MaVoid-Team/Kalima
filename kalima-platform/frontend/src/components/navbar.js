import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navbar, Button } from 'react-daisyui';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const NavBar = () => {
  const { t, i18n } = useTranslation('common');
  const [menuOpen, setMenuOpen] = useState(false);
  const isAr = i18n.language === 'ar';
  const navbarRef = useRef(null); 
  const menuRef = useRef(null);   

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (menuOpen && 
          !navbarRef.current?.contains(event.target) && 
          !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  const navItems = [
    { key: 'homepage', path: '/' },
    { key: 'educationalCourses', path: '/courses' },
    { key: 'teachers', path: '/teachers' },
    { key: 'lectures', path: '/lecture-page' },
    { key: 'contactUs', path: '/contact' },
    { key: 'services', path: '/services' },
  ];

  const authItems = [
    { key: 'signup', path: '/register' },
    { key: 'signin', path: '/landing' },
  ];

  return (
    <Navbar className="top-0 left-0 right-0 z-50 bg-base-100 shadow-xl px-4 py-1 sticky" dir={isAr ? 'rtl' : 'ltr'}>
      
      <div ref={navbarRef} className="flex-1 flex justify-between items-center">
        {/* Left side - Logo and navigation items */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            color="ghost"
            className="lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </Button>
          
          {/* Logo */}
          <Link to="/" className="btn btn-ghost px-2 rounded-2xl">
            <img 
              src="/kalima.jpg" 
              alt="Logo" 
              className="w-10 h-10 rounded-full"
            />
            <span className="text-xl font-bold text-primary ml-2">
              {t('logoText')}
            </span>
          </Link>
          
          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex  xl:gap-4  ml-4 rounded-2xl">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="btn btn-ghost font-medium rounded-2xl hover:text-primary transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Auth buttons - Desktop */}
        <div className="flex-none hidden lg:flex gap-2 ml-4">
          {authItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`btn ${item.key === 'signup' ? 'btn-primary' : 'btn-outline'}  rounded-2xl`}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu with ref */}
      {menuOpen && (
        <div
          ref={menuRef}
          className={`lg:hidden w-1/2 sm:w-1/3 fixed ${isAr ? 'right-0' : 'left-0'} top-0 bottom-0 bg-base-100 z-50 overflow-y-auto`}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="p-2 space-y-3 h-[calc(100vh-4rem)]">
            {/* Mobile menu header */}
            <div className='gap-4 flex rounded-2xl'>
              <Button
                color="ghost"
                className="lg:hidden rounded-2xl"
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
              <Link to="/" className="btn btn-ghost px-2" onClick={() => setMenuOpen(false)}>
                <img 
                  src="/kalima.jpg" 
                  alt="Logo" 
                  className="w-10 h-10 rounded-full"
                />
              </Link>
            </div>

            {/* Mobile menu items */}
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="btn btn-ghost justify-start w-full rounded-2xl"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            
            <div className="divider" />
            <ThemeSwitcher />
            <LanguageSwitcher />
 
            
            {authItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`btn ${item.key === 'signup' ? 'btn-primary' : 'btn-outline'} justify-start w-full rounded-2xl`}
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default NavBar;