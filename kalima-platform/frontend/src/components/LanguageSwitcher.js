import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lng') || 'ar';
    i18n.changeLanguage(savedLang);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="dropdown dropdown-bottom" ref={dropdownRef}>
      <div 
        tabIndex={0}
        role="button"
        className="btn btn-ghost gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {i18n.language === 'en' ? 'Language' : 'اللغه'}
      </div>
      <ul 
        className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <li>
          <button
            onClick={() => changeLanguage('en')}
            className="flex justify-between hover:bg-base-200"
          >
            <span>English</span>
            <span>🇺🇸</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => changeLanguage('ar')}
            className="flex justify-between hover:bg-base-200"
          >
            <span>العربية</span>
            <span>🇸🇦</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;