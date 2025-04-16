export default function Step1({ formData, handleInputChange, t, errors, role }) {

  const gradeLevels = [
    { value: '67d3594de4a0bacdc2ece381', label: 'Higher Secondary' },
    { value: '67d35943e4a0bacdc2ece37f', label: 'Upper Primary' },
    { value: '67d3593ce4a0bacdc2ece37d', label: 'Middle' },
    { value: '67d35903e4a0bacdc2ece37b', label: 'Primary' },
    { value: 'First Secondary', label: 'First Secondary' },
    { value: 'Second Secondary', label: 'Second Secondary' },
    { value: 'Third Secondary', label: 'Third Secondary' },
  ];
  
  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold">{t('form.personalDetails')}</p>

      {/* Common fields */}
      <div className="form-control relative pb-5">
        <label className="label">
          <span className="label-text">{t('form.fullName')}</span>
        </label>
        <input
          type="text"
          name="fullName"
          className={`input input-bordered  w-2/3 lg:w-1/2 ${errors.fullName ? 'input-error animate-shake' : ''}`}
          value={formData.fullName}
          onChange={handleInputChange}
          required
        /> {errors.fieldName && (
          <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
            {t(errors.fieldName)}
          </span>
        )}
              
      </div>

      <div className="form-control relative pb-5">
        <label className="label">
          <span className="label-text">{t('form.gender')}</span>
        </label>
        <select
          name="gender"
          className={`select select-bordered  w-2/3 lg:w-1/2 ${errors.gender ? 'select-error animate-shake' : ''}`}
          value={formData.gender}
          onChange={handleInputChange}
          required
        >
          <option value="">{t('form.selectGender')}</option>
          <option value="male">{t('gender.male')}</option>
          <option value="female">{t('gender.female')}</option>
        </select>
      </div>

      <div className="form-control relative pb-5">
        <label className="label">
          <span className="label-text">{t('form.phoneNumber')}</span>
        </label>
        <input
          type="number"
          name="phoneNumber"
          className={`input input-bordered w-2/3 lg:w-1/2 ${errors.phoneNumber ? 'input-error animate-shake' : ''}`}
          value={formData.phoneNumber}
          onChange={handleInputChange}
          required
        /> {errors.fieldName && (
    <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
      {t(errors.fieldName)}
    </span>
  )}
      </div>

      {/* Student-specific fields */}
      {role === 'student' && (
        <>
          <div className="form-control relative pb-5">
            <label className="label">
              <span className="label-text">{t('form.grade')}</span>
            </label>
            <select
              name="grade"
              className={`select select-bordered w-2/3 lg:w-1/2 ${errors.grade ? 'select-error animate-shake' : ''}`}
              value={formData.grade}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('form.selectGrade')}</option>
              {gradeLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {t(`gradeLevels.${level.label}`)}
                </option>
              ))}
            </select>
            {errors.fieldName && (
            <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
              {t(errors.fieldName)}
            </span>
          )}
              </div>

         
        </> 
      )}
    </div>
  );
}