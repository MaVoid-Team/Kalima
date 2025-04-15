import { FaCube, FaCalculator, FaAtom, FaMusic, FaPaintBrush, FaCode } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const FeaturedCourses = () => {
  const { t, i18n } = useTranslation('assistantPage');
  const isRTL = i18n.language === 'ar';

  const courses = [
    { icon: <FaCube className="text-4xl" />, translationKey: 'math', count: 34 },
    { icon: <FaCalculator className="text-4xl" />, translationKey: 'physics', count: 28 },
    { icon: <FaAtom className="text-4xl" />, translationKey: 'chemistry', count: 22 },
    { icon: <FaMusic className="text-4xl" />, translationKey: 'biology', count: 45 },
    { icon: <FaPaintBrush className="text-4xl" />, translationKey: 'art', count: 18 },
    { icon: <FaCode className="text-4xl" />, translationKey: 'programming', count: 52 },
  ];

  return (
    <div className="mb-12 p-4 lg:p-0 mt-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 `}>
        <div className="mb-4 lg:mb-0 flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className={`text-3xl font-bold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('importantCourses')}
            </h2>
            <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('exploreCourses')}
            </p>
          </div>
          <img 
            src={'/3books.png'} 
            alt={t('coursesAlt')} 
            className={`w-32 lg:w-24 rounded-lg ${isRTL ? 'mr-4' : 'ml-4'}`}
          />
        </div> 
        <div className="flex items-center gap-4">
          <button className="btn btn-outline">
            {t('viewAll')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {courses.map((course, index) => (
          <div 
            key={index}
            className="p-6 border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-primary mb-4">{course.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t(course.translationKey)}
              </h3>
              <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('coursesCount', { count: course.count })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCourses;