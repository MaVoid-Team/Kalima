import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navbar, Button } from 'react-daisyui';

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
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [menuOpen]);

  const navItems = [
    { key: 'homepage', path: '/' },
    { key: 'educationalCourses', path: '/courses' },
    { key: 'teachers', path: '/teachers' },
    { key: 'services', path: '/services' },
    { key: 'contactUs', path: '/contact' },
  ];

  const authItems = [
    { key: 'signup', path: '/signup' },
    { key: 'signin', path: '/login' },
  ];

  return (
    <Navbar className="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-lg px-4 py-3" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex-1 flex justify-between items-center">
        {/* Left side - Logo and navigation items */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            color="ghost"
            className="lg:hidden"
            onClick={() => {
              
                setMenuOpen(!menuOpen);
              }
            }
             
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
          <Link to="/" className="btn btn-ghost px-2">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-full"
            />
            <span className="text-xl font-bold text-primary ml-2">
              {t('logoText')}
            </span>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex gap-4 ml-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="btn btn-ghost font-medium hover:text-primary transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>

        {/* Auth buttons - Left side */}
        <div className="flex-none hidden lg:flex gap-2 ml-4">
          {authItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`btn  ${item.key === 'signup' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu with scroll */}
      {menuOpen && (
    <div className={`lg:hidden w-1/2 sm:w-1/3 fixed ${isAr ? 'right-0' : 'left-0'} top-0 bottom-0 bg-base-100 z-50  overflow-y-auto`} dir={isAr ? 'rtl' : 'ltr'}>
    <div className="p-4 space-y-3 h-[calc(100vh-4rem)]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className='gap-4 flex'>
          {/* Mobile menu button */}
          <Button
            color="ghost"
            className="lg:hidden"
            onClick={() => {
              
                setMenuOpen(!menuOpen);
              }
            }
             
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
          <Link to="/" className="btn btn-ghost px-2">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-full"
            />
            <span className="text-xl font-bold text-primary ml-2">
              {t('logoText')}
            </span>
          </Link>
          </div>
            {navItems.map((item) => (
              <Link
              
                key={item.key}
                to={item.path}
                className="btn btn-ghost justify-start w-full"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="divider"></div>
            {authItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`btn ${item.key === 'signup' ? 'btn-primary' : 'btn-outline'} justify-start w-full`}
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