import React from 'react';
import { useTranslation } from 'react-i18next';

const PromoBanner = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div 
      className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden"
      dir={dir}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Section - Text Area */}
        <div className="w-full md:w-1/2 bg-primary/20 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-full">
            <h3 className="text-xl font-bold text-base-content mb-4">
              {isRTL ? 'هل لديك أسئلة أو وجدت خطأ في الجدول؟' : 'Do you have questions or found an error in the schedule?'}
            </h3>
            <p className="text-base-content/80">
              {isRTL ? 'اتصل بنا على 256 258' : 'Contact us at 256 258'}
            </p>
          </div>
        </div>

        {/* Right Section - Image Area */}
        <div className="w-full md:w-1/2">
          <img
            src="/student-center.png" // Replace with your actual image path
            alt={isRTL ? 'اتصل بنا' : 'Contact us'}
            className="w-full h-full object-cover rounded-r-xl md:rounded-l-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;