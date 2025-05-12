import { useState } from 'react';

export default function Step3({ formData, toggleHobby, t, hobbiesList, setHobbiesList, errors }) {
  const [customHobby, setCustomHobby] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddCustomHobby = () => {
    if (!customHobby.trim()) return;
    const newHobby = {
      id: `custom-${Date.now()}`,
      name: customHobby.trim(),
      img: '/default-hobby.png', // Use a default or placeholder image
    };
    setHobbiesList(prev => [...prev, newHobby]);
    toggleHobby(newHobby.id); // Automatically select it
    setCustomHobby('');
    setShowInput(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('form.selectHobbies')}</h3>

      <div className="grid grid-cols-3 gap-2">
        {hobbiesList.map(hobby => (
          <div
            key={hobby.id}
            onClick={() => toggleHobby(hobby.id)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition-all 
              ${errors.hobbies ? 'ring-2 ring-error rounded-box p-1' : ''}
              ${formData.hobbies.includes(hobby.id) 
                ? 'border-primary bg-primary/10' 
                : 'border-base-300 hover:border-primary/50'}`}
          >
            <img 
              src={hobby.img} 
              alt={hobby.name} 
              className="w-full object-contain p-2" 
            />
            <p className="text-center mt-2 text-sm">
              {t(`hobbies.${hobby.name}`) || hobby.name}
            </p>
          </div>
        ))}

        {/* Optional custom hobby input */}
        <div className="col-span-full">
          {!showInput ? (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="btn btn-outline btn-sm"
            >
              + {t('form.addOtherHobby')}
            </button>
          ) : (
            <div className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={customHobby}
                onChange={e => setCustomHobby(e.target.value)}
                placeholder={t('form.enterHobby')}
                className="input input-sm input-bordered flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomHobby}
                className="btn btn-sm btn-primary"
              >
                {t('form.add')}
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="btn btn-sm btn-ghost"
              >
                {t('form.cancel')}
              </button>
            </div>
          )}
        </div>

        {errors.hobbies && (
          <div className="col-span-full text-error text-sm mt-2">
            {t(`validation.${errors.hobbies}`)}
          </div>
        )}
      </div>
    </div>
  );
}
