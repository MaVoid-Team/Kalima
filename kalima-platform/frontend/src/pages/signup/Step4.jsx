const ReviewItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-base-content/70">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

export default function Step4({ formData, t, hobbiesList }) {
  
  return (
    <div className="space-y-6">
      <div className="bg-base-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">{t('review.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReviewItem label={t('form.role')} value={t(`role.${formData.role}`)} />
          <ReviewItem label={t('form.fullName')} value={formData.fullName} />
          <ReviewItem label={t('form.gender')} value={t(`gender.${formData.gender}`)} />
          <ReviewItem label={t('form.phoneNumber')} value={formData.phoneNumber} />

          {formData.role === 'student' && (
            <>
               <ReviewItem 
                    label={t('form.grade')} 
                    value={t(`gradeLevels.${formData.grade}`)} 
                  />
                <ReviewItem label={t('form.parentPhone')} value={formData.parentPhoneNumber} />
                <ReviewItem 
                  label={t('form.hobbies')} 
                  value={formData.hobbies.map(id => t(`hobbies.${hobbiesList.find(hobby => hobby.id === id).name}`)).join(', ')} 
                          />
                        </>
          )}

          {formData.role === 'lecturer' && (
            <>
              <ReviewItem label={t('form.bio')} value={formData.bio} />
              <ReviewItem label={t('form.expertise')} value={formData.expertise} />
              <ReviewItem label={t('form.subject')} value={formData.subject.join(', ')} />
            </>
          )}

          {formData.role === 'parent' && (
            <ReviewItem
              label={t('form.children')}
              value={formData.children.join(', ')}
            />
          )}
        </div>
      </div>
    </div>
  );
}