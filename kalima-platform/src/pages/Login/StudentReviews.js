import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQuoteLeft, FaQuoteRight, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const reviews = [
  {
    name: 'Sarah Johnson',
    review: 'This platform transformed my learning experience. The interactive courses and supportive community made complex topics easily understandable.',
    image: 'https://i.pravatar.cc/150?img=1',
    fullReview: `Enrolling here was the best decision I made for my career. The courses are well-structured, and the instructors are always available to help. The hands-on projects gave me real-world experience that I could immediately apply at my job. I've recommended this platform to all my colleagues!`
  },
  {
    name: 'Michael Chen',
    review: 'The quality of instruction is exceptional. I doubled my salary within 6 months of completing the program.',
    image: 'https://i.pravatar.cc/150?img=2',
    fullReview: `As someone with a non-technical background, I was nervous about switching careers. But the clear explanations and gradual progression made learning to code achievable. The career support team helped me craft a winning resume and prepare for interviews. I'm now working at my dream company!`
  },
  {
    name: 'Emma Wilson',
    review: 'Flexible scheduling and excellent resources made balancing work and study possible.',
    image: 'https://i.pravatar.cc/150?img=3',
    fullReview: `The self-paced learning structure was perfect for my busy schedule. The community forum was incredibly active - I never felt stuck thanks to prompt help from both peers and mentors. The certificate program gave me the confidence to start freelancing immediately after completion.`
  },
  {
    name: 'David Martinez',
    review: 'The project-based learning approach helped me build an impressive portfolio.',
    image: 'https://i.pravatar.cc/150?img=4',
    fullReview: `I appreciated how every module included practical exercises. By the end of the program, I had 5 complete projects that demonstrated my skills to employers. The code reviews from experienced developers were invaluable for improving my best practices.`
  }
];

export const StudentReviewCard = ({ review, onViewMore , isRTL, onPrev, onNext }) => (
  <div className="card bg-base-100 shadow-xl p-6 " dir='ltr'>
    <div className="flex items-center gap-4 mb-4">
      <div className="avatar">
        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img 
            src={review.image} 
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
    <div className={`flex  flex-row justify-center gap-3 mt-4`}>
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

const StudentReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [modalContent, setModalContent] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { t,i18n } = useTranslation('studentReviews');
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
    <div className="w-full md:w-3/4 p-4 md:p-8 xl:pt-10 flex flex-col items-center mt-8 xl:mt-16" dir='ltr'>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
        {t('title')}
      </h2>

      <div className="relative w-full max-w-xs md:max-w-lg">
        <StudentReviewCard 
          review={{
            ...reviews[currentReview],
            viewMoreText: t('viewMore')
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
        <div className="modal-box relative max-w-[95%] md:max-w-2xl p-4 md:p-6">
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
                      src={modalContent.image} 
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

export default StudentReviews;