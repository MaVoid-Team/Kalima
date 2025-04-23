import React from 'react';

const PromoBanner = () => {
  const handleConsultancyClick = () => {
    // Handle consultancy click
  };
  return (
    <div className="relative bg-base-200 rounded-lg p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="md:w-1/2 text-right md:ml-52 mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-6">هل تريد أسئلة أو توجد حيرة في الدروس؟</h3>
          <p className="mb-4 font-semibold">اتصل بنا على 123.456.789</p>
          <p className='mb-6 font-semibold'>او تواصل معنا الان</p>
          <div className="flex items-center justify-end">
          <div className="font-medium btn btn-primary cursor-pointer" onClick={handleConsultancyClick}>إضافة كورس جديد</div>
        </div>
        </div>
        
        <div className="md:w-fit md:scale-125 scale-y-110 scale-x-125 h-auto">
          <img 
            src="/student-center.png" 
            alt="استشارة تعليمية" 
            className="rounded-xl"
          />
        </div>
      </div>
      
      {/* Decorative wave pattern */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="text-base-300 opacity-30">
          <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default PromoBanner;
