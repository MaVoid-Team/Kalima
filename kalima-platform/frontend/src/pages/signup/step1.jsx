import { useState, useEffect } from 'react';


export default function Step1({ formData, handleInputChange, t, errors, role, gradeLevels  }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold">{t('form.personalDetails')}</p>

      {/* Common fields */}
      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.fullName')}</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`input input-bordered w-2/3 lg:w-1/2 ${errors.fullName ? 'input-error animate-shake' : ''}`}
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          {errors.fullName && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
             {t(`validation.${errors.fullName}`)}
            </span>
          )}
        </div>
      </div>

      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.gender')}</span>
          </label>
          <select
            name="gender"
            className={`select select-bordered w-2/3 lg:w-1/2 ${errors.gender ? 'select-error animate-shake' : ''}`}
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('form.selectGender')}</option>
            <option value="male">{t('gender.male')}</option>
            <option value="female">{t('gender.female')}</option>
          </select>
        </div>
      </div>

      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
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
          />
          {errors.phoneNumber && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
               {t(`validation.${errors.phoneNumber}`)}
            </span>
          )}
        </div>
      </div>

      {/* Student-specific fields */}
      {role === 'student' && (
        <>
       <div className="form-control relative pb-5">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('form.grade')}</span>
            </label>
            <select
              name="level"
              className={`select select-bordered w-2/3 lg:w-1/2 ${errors.level ? 'select-error animate-shake' : ''}`}
              value={formData.level}
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
            {errors.level && (
              <span className="absolute bottom-0  text-error text-sm mt-1">
                 {t(`validation.${errors.level}`)}
              </span>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}