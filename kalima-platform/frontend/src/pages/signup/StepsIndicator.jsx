export default function StepsIndicator({ currentStep, t, i18n }) {
    return (
      <div className="mt-8 pt-8">
          <div className="steps steps-horizontal w-full">
            {[1, 2, 3, 4, 5].map(step => (
              <div 
                key={step} 
                className={`step ${currentStep >= step ? 'step-primary' : ''}`}
                data-content={'•'}
              >
                {t(`steps.step${step}`)}
              </div>
            ))}
          </div>
        </div>
      
    );
  }