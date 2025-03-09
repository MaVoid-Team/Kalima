import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = ({ onCloseMenu }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setIsOpen(false);
    onCloseMenu?.();
  };

  return (
    <div 
      className="relative"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="btn btn-ghost gap-2"
        onClick={toggleDropdown}
      >
        {t("theme")}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 512 512">
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
        </svg>
      </button>
      
      {isOpen && (
        <ul 
          className="absolute top-full mt-2 bg-base-100 z-[60] p-2 shadow-2xl rounded-box w-52 max-h-96 overflow-y-auto"
        >
          {[
            "light", "dark", "cupcake", "bumblebee", "emerald",
            "corporate", "synthwave", "retro", "cyberpunk", "valentine",
            "halloween", "garden", "forest", "aqua", "lofi",
            "pastel", "fantasy", "wireframe", "black", "luxury",
            "dracula", "cmyk", "autumn", "business", "acid",
            "lemonade", "night", "coffee", "winter"
          ].map((theme) => (
            <li key={theme} className="py-1">
              <button
                data-set-theme={theme}
                className="btn btn-sm btn-block btn-ghost justify-start"
                onClick={() => handleThemeChange(theme)}
              >
                {theme}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSwitcher;