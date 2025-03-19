export default function Step4({ formData, toggleHobby, t, hobbiesList ,errors }) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('form.selectHobbies')}</h3>
        <div className={`grid grid-cols-3 gap-2 `}>
          {hobbiesList.map(hobby => (
            <div
              key={hobby.id}
              onClick={() => toggleHobby(hobby.id)}
              className={`border-2 rounded-lg p-2 cursor-pointer transition-all  ${errors.selectedHobbies ? 'ring-2 ring-error rounded-box p-1' : ''}
                ${formData.selectedHobbies.includes(hobby.id)
                  ? 'border-primary bg-primary/10' 
                  : 'border-base-300 hover:border-primary/50'}`}
            >
              <img 
                src={hobby.img} 
                alt={hobby.name} 
                className="w-full  object-contain p-2" 
              />
              <p className="text-center mt-2 text-sm">
                {t(`hobbies.${hobby.name}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }