export default function NavigationButtons({ currentStep, handlePrev, handleNext, t }) {
    return (
      <div className="flex justify-between mt-8">
        <button 
          onClick={handlePrev} 
          disabled={currentStep === 1}
          className="btn btn-outline" 
          type="button"
        >
          {t('buttons.previous')}
        </button>
        
        <button 
          onClick={handleNext} 
          className="btn btn-primary" 
          type="button"
        >
          {currentStep === 5 ? t('buttons.submit') : t('buttons.next')}
        </button>
      </div>
    );
  }