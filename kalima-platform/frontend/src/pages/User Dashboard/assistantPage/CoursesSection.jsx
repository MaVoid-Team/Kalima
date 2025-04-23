import { useRef } from 'react';
import { FaBook, FaStar, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
const CoursesSection = () => {
  const { t, i18n } = useTranslation('assistantPage');
  const isRTL = i18n.language === 'ar';

  const scrollContainer = useRef(null);
  const cardWidth = 384; 
  const gap = 24; 

  const handleScroll = (direction) => {
    if (!scrollContainer.current) return;
    
    let scrollDirection = direction;
    if (isRTL) {
      scrollDirection = direction === 'right' ? 'left' : 'right';
    }

    const scrollAmount = cardWidth + gap;
    scrollContainer.current.scrollTo({
      left: scrollDirection === 'right' 
        ? scrollContainer.current.scrollLeft + scrollAmount
        : scrollContainer.current.scrollLeft - scrollAmount,
      behavior: 'smooth'
    });
  };

  const courses = [
    {
      id: 1,
      image: "https://via.placeholder.com/300x150",
      duration: "3 شهور",
      lectures: 36,
      title: "Introduction to React",
      rating: 1,
      price: "$49.99",
      lecturer: { name: "Sarah", image: "https://via.placeholder.com/30" }
    },
    {
      id: 2,
      image: "https://via.placeholder.com/300x150",
      duration: "6 شهور",
      lectures: 24,
      title: "Advanced JavaScript",
      rating: 2,
      price: "$59.99",
      lecturer: { name: "Mike", image: "https://via.placeholder.com/30" }
    },
    {
      id: 3,
      image: "https://via.placeholder.com/300x150",
      duration: "4 شهور",
      lectures: 48,
      title: "Full Stack Development",
      rating: 3,
      price: "$79.99",
      lecturer: { name: "Emma", image: "https://via.placeholder.com/30" }
    },
    {
      id: 6,
      image: "https://via.placeholder.com/300x150",
      duration: "4 شهور",
      lectures: 48,
      title: "Full Stack Development",
      rating: 3,
      price: "$79.99",
      lecturer: { name: "Emma", image: "https://via.placeholder.com/30" }
    },
    {
      id: 4,
      image: "https://via.placeholder.com/300x150",
      duration: "4 شهور",
      lectures: 48,
      title: "Full Stack Development",
      rating: 4.2,
      price: "$79.99",
      lecturer: { name: "Emma", image: "https://via.placeholder.com/30" }
    },
    {
      id: 5,
      image: "https://via.placeholder.com/300x150",
      duration: "4 شهور",
      lectures: 48,
      title: "Full Stack Development",
      rating: 4.2,
      price: "$79.99",
      lecturer: { name: "Emma", image: "https://via.placeholder.com/30" }
    },
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={`${i < rating ? "text-yellow-400" : "text-gray-300"} ${isRTL ? 'ml-1' : 'mr-1'}`}
      />
    ));
  };

  return (
    <div className="mb-12 relative">
      {/* Updated Section Header */}
      <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h1 className="text-3xl font-bold px-10">{t('assistantPageTitle')}</h1>
        <div className={`flex items-center gap-4 `}>
          <img 
            src= "/bookshelf.png" 
            alt="Section" 
            className="w-32 h-16 object-cover rounded"
          />
          <button className="btn btn-outline rounded-full">{t('course')}</button>
        </div>
      </div>

      {/* Updated Courses Carousel */}
      <div className="relative">
        <div 
          ref={scrollContainer}
          className={`flex overflow-x-auto gap-6 pb-4 scrollbar-hide `}
          style={{ scrollBehavior: 'smooth', direction: isRTL ? 'rtl' : 'ltr' }}
        >
          {courses.map((course) => (
            <div key={course.id} className="card w-80 bg-base-100 shadow-xl border border-yellow-500 flex-shrink-0">
              <figure>
                <img 
                  src={course.image} 
                  alt="Course" 
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <div className={`flex justify-between text-sm `}>
                  <div className="flex items-center gap-1 text-primary">
                    <FaBook />
                    <span>{course.lectures} lectures</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-gray-500" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                
                <h2 className={`card-title mt-2 ${isRTL ? 'text-right' : ''}`}>{course.title}</h2>
                
                <div className={`flex justify-between items-center mt-4 `}>
                  <div className="border border-primary rounded-lg">
                    <div className={`text-sm text-gray-500 pt-2 text-center ${isRTL ? 'pr-2' : 'pl-2'}`}>
                      {t('rating', { rating: course.rating })}
                    </div>
                    <div className={`flex gap-1 pb-2 `}>
                      {renderStars(course.rating)}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-md rounded-2xl">
                    {t('signUp')}
                  </button>
                </div>
                
                <div className={`flex justify-between items-center mt-4 `}>
                  <span className="font-bold text-lg">{course.price}</span>
                  <div className={`flex items-center gap-2 `}>
                    <span>{course.lecturer.name}</span>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img src={course.lecturer.image} alt="Lecturer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full">
          <button className={`btn btn-circle btn-sm ${isRTL ? 'order-2' : ''}`}
            onClick={() => handleScroll(isRTL ? 'left' : 'right')}>
            <FaChevronRight className="text-xl" />
          </button>
          <button className={`btn btn-circle btn-sm ${isRTL ? 'order-1' : ''}`}
            onClick={() => handleScroll(isRTL ? 'right' : 'left')}>
            <FaChevronLeft className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursesSection;