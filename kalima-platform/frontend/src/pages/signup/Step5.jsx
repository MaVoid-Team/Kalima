const ReviewItem = ({ label, value }) => (
    <div>
      <p className="text-sm text-base-content/70">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  );
  
  export default function Step5({ formData, handleAvatarUpload, t, hobbiesList ,errors }) {
    return (
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('form.uploadAvatar')}</span>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarUpload}
            className={`file-input file-input-bordered w-full ${errors.avatar ? 'file-input-error' : ''}`}
          />
          {formData.avatar && (
            <div className="mt-4 flex justify-center">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={formData.avatar} alt="Avatar preview" />
                </div>
              </div>
            </div>
          )}
        </div>
  
        <div className="bg-base-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('review.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewItem 
              label={t('form.fullName')} 
              value={formData.fullName} 
            />
            <ReviewItem 
              label={t('form.studentGender')} 
              value={formData.studentGender && t(`gender.${formData.studentGender}`)}
            />
            <ReviewItem 
              label={t('form.studentId')} 
              value={formData.studentId} 
            />
            <ReviewItem 
              label={t('form.parentPhone')} 
              value={formData.parentPhone} 
            />
            <ReviewItem 
              label={t('form.schoolName')} 
              value={formData.schoolName} 
            />
            <ReviewItem 
              label={t('form.grade')} 
              value={formData.grade} 
            />
            <ReviewItem 
              label={t('form.hobbies')}
              value={formData.selectedHobbies
                .map(id => {
                  const hobby = hobbiesList.find(h => h.id === id);
                  return hobby ? t(`hobbies.${hobby.name}`) : '';
                })
                .filter(Boolean)
                .join(', ')}
            />
          </div>
        </div>
      </div>
    );
  }