import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  // Set initial language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('lng') || 'ar';
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
        {i18n.language === 'en' ? (
          <span>Language</span>
        ) : (
          <span>اللغه</span>
        )}
      </div>
      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
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