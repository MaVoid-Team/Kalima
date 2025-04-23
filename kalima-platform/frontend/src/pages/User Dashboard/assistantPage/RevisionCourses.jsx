import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClock, FaUser, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
const RevisionCourses = () => {
    const { t, i18n } = useTranslation('assistantPage');
    const isRTL = i18n.language === 'ar';
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    
    const courses = [
      {
        image: "https://via.placeholder.com/300x200",
        teacher: t('teachers.sarah'),
        title: t('courses.advancedCalculus'),
        duration: t('duration.6weeks'),
        students: 245,
        price: t('price', { amount: 89.99 })
      },
    {
      image: "https://via.placeholder.com/300x200",
      teacher: t("teachers.michael"),
      title: t("courses.organicChemistry"),
      duration: t("duration.8weeks"),
      students: 178,
      price: t("price", { amount: 109.99 })
    },
    {
      image: "https://via.placeholder.com/300x200",
      teacher: t("teachers.emma"),
      title: t("courses.modernPhysics"),
      duration: t("duration.10weeks"),
      students: 312,
      price: t("price", { amount: 129.99 })
    },
    {
        image: "https://via.placeholder.com/300x200",
        teacher: t("teachers.james"),
        title: t("courses.quantumMechanics"),
        duration: t("duration.12weeks"),
        students: 198,
        price: t("price", { amount: 149.99 })
      },
      {
        image: "https://via.placeholder.com/300x200",
        teacher: t("teachers.lisa"),
        title: t("courses.molecularBiology"),
        duration: t("duration.9weeks"),
        students: 275,
        price: t("price", { amount: 119.99 })
      },
      {
        image: "https://via.placeholder.com/300x200",
        teacher: t("teachers.robert"),
        title: t("courses.linearAlgebra"),
        duration: t("duration.7weeks"),
        students: 324,
        price: t("price", { amount: 99.99 })
      }
  ];
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCourses = courses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mb-12 p-4 lg:p-0" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 `}>
        <div className="mb-4 lg:mb-0">
          <h2 className={`text-3xl font-bold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('revisionCourses')}
          </h2>
          <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('exploreFinalCourses')}
          </p>
        </div>
        <button className="btn btn-outline btn-primary">
          <FaPlus className={isRTL ? 'ml-2' : 'mr-2'} />
          {t('addCourse')}
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedCourses.map((course, index) => (
          <div key={index} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <figure>
              <img 
                src={course.image} 
                alt={t('courseAlt')} 
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <div className={`flex items-center gap-2 text-sm text-gray-500 mb-2`}>
                <span>{course.teacher}</span>
              </div>
              <h3 className={`card-title mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {course.title}
              </h3>
              
              <div className={`flex justify-between text-sm mb-4`}>
                <div className="flex items-center gap-2">
                  <FaClock className="text-orange-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUser className="text-orange-500" />
                  <span>{t('studentsCount', { count: course.students })}</span>
                </div>
              </div>

              <div className="divider my-2"></div>

              <div className={`flex justify-between items-center`}>
                <span className="text-lg font-bold">{course.price}</span>
                <button className="btn btn-outline btn-primary btn-sm">
                  {t('showMore')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2">
        <button 
          className="btn btn-ghost rounded-full"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          {isRTL ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-ghost'} rounded-full`}
            onClick={() => setCurrentPage(page)}
          >
            {new Intl.NumberFormat(i18n.language).format(page)}
          </button>
        ))}
        
        <button 
          className="btn btn-ghost rounded-full"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          {isRTL ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
    </div>
  );
};

export default RevisionCourses;