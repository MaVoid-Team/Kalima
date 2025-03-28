import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQuoteLeft, FaQuoteRight, FaChevronLeft, FaChevronRight, FaTimes, FaChalkboardTeacher } from 'react-icons/fa';

const reviews = [
  {
    name: 'Dr. James Wilson',
    review: 'This platform has revolutionized my teaching methods. The interactive tools and resources have made my lessons more engaging for students.',
    image: 'https://i.pravatar.cc/150?img=11',
    fullReview: `As an educator for over 15 years, I've tried many teaching platforms, but this one stands out. The analytics help me understand student progress, and the customizable curriculum tools let me tailor content to different learning styles. My student engagement has increased dramatically since implementing these resources in my classroom.`
  },
  {
    name: 'Prof. Maria Rodriguez',
    review: 'The assessment tools have saved me countless hours of grading while providing better insights into student performance.',
    image: 'https://i.pravatar.cc/150?img=12',
    fullReview: `The automated grading system is incredibly accurate and gives me detailed analytics on where students are struggling. I can now spend more time providing targeted support rather than manually grading assignments. The platform also makes it easy to create differentiated assessments for students with varying abilities.`
  },
  {
    name: 'Dr. Robert Chen',
    review: 'Collaboration with other educators has never been easier. We share resources and best practices seamlessly.',
    image: 'https://i.pravatar.cc/150?img=13',
    fullReview: `The teacher community feature has connected me with educators worldwide. We regularly exchange lesson plans, discuss teaching strategies, and support each other through challenges. This collaborative environment has significantly improved my professional development and classroom effectiveness.`
  },
  {
    name: 'Prof. Aisha Johnson',
    review: 'The parent communication tools have strengthened the home-school connection and improved student outcomes.',
    image: 'https://i.pravatar.cc/150?img=14',
    fullReview: `Parents now have real-time access to their child's progress, upcoming assignments, and classroom announcements. This transparency has increased parental involvement and support at home. The translation feature has been particularly valuable for communicating with my diverse parent community.`
  }
];

export const TeacherReviewCard = ({ review, onViewMore, isRTL, onPrev, onNext }) => (
  <div className="card bg-base-100 shadow-xl p-6" dir='ltr'>
    <div className="flex items-center gap-4 mb-4">
      <div className="avatar">
        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img 
            src={review.image || "/placeholder.svg"} 
            alt={review.name} 
            width={64}
            height={64}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMSIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg==';
            }}
          />
        </div>
      </div>
      <h3 className="text-xl font-bold">{review.name}</h3>
    </div>
    <div className="relative min-h-32">
      <FaQuoteLeft className="text-primary opacity-50 mb-2" />
      <p className="text-base-600 line-clamp-3 mb-4">{review.review}</p>
      <FaQuoteRight className="text-primary opacity-50 ml-auto" />
    </div>
    {/* Navigation buttons inside card */}
    <div className={`flex flex-row justify-center gap-3 mt-4`}>
      <button
        className="btn btn-circle btn-sm md:btn-md"
        onClick={onPrev}
      >
        <FaChevronLeft />
      </button>
      <button
        className="btn btn-circle btn-sm md:btn-md"
        onClick={onNext}
      >
        <FaChevronRight />
      </button>
    
      <button 
        onClick={onViewMore} 
        className="btn btn-ghost text-primary self-start"
      >
        {review.viewMoreText}
      </button>
    </div>
  </div>
);

const TeacherReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [modalContent, setModalContent] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { t, i18n } = useTranslation('studentReviews');
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleViewMore = (review) => {
    if (isMounted) {
      setModalContent(review);
    }
  };

  const closeModal = () => {
    if (isMounted) {
      setModalContent(null);
    }
  };

  return (
    <div className="w-full md:w-3/4 p-4 md:p-8 xl:pt-10 flex flex-col items-center mx-auto" dir='ltr'>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center flex items-center justify-center gap-2">
        <FaChalkboardTeacher className="text-primary opacity-50 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" /> 
        <span>{t('TeacherTitle', 'Teacher Testimonials')}</span>
      </h2>

      <p className="text-base-600 text-center mb-6 md:mb-8">
        {t('TeacherDescription', 'See what educators are saying about our teaching platform')}
      </p>
      
      <div className="relative w-[1200px] max-w-xs md:max-w-lg">
        <TeacherReviewCard 
          review={{
            ...reviews[currentReview],
            viewMoreText: t('viewMore', 'View More')
          }}
          onViewMore={() => handleViewMore(reviews[currentReview])}
          isRTL={isRTL}
          onPrev={() => setCurrentReview(prev => 
            (prev - 1 + reviews.length) % reviews.length
          )}
          onNext={() => setCurrentReview(prev => 
            (prev + 1) % reviews.length
          )}
        />
      </div>

      {/* Modal */}
      <div className={`modal ${modalContent ? 'modal-open' : ''}`}>
        <div className="modal-box relative max-w-[95%] md:max-w-2xl p-4 md:p-6 z-50">
          <button 
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closeModal}
          >
            <FaTimes />
          </button>
          
          {modalContent && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="avatar">
                  <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img 
                      src={modalContent.image || "/placeholder.svg"} 
                      alt={modalContent.name} 
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{modalContent.name}</h3>
              </div>
              
              <div className="relative">
                <FaQuoteLeft className="text-primary opacity-50 text-xl" />
                <p className="text-lg text-base-800">
                  {modalContent.fullReview}
                </p>
                <FaQuoteRight className="text-primary opacity-50 text-xl ml-auto" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherReviews;