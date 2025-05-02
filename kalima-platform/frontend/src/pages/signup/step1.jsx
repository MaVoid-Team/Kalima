import { useState, useEffect } from 'react';
import { getAllLevels } from '../../routes/levels'; // Adjust the import path based on your project structure

export default function Step1({ formData, handleInputChange, t, errors, role }) {
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getAllLevels();
        if (response.success) {
          const levels = response.data.levels.map(level => ({
            value: level._id,
            label: level.name
          }));
          setGradeLevels(levels);
          setLoading(false);
        } else {
          setError(response);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch grade levels');
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

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
            <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
              {t(errors.fullName)}
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
            <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
              {t(errors.phoneNumber)}
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
                name="grade"
                className={`select select-bordered w-2/3 lg:w-1/2 ${errors.grade ? 'select-error animate-shake' : ''}`}
                value={formData.grade}
                onChange={handleInputChange}
                required
                disabled={loading || error}
              >
                <option value="">{t('form.selectGrade')}</option>
                {loading ? (
                  <option value="" disabled>
                    {t('form.loading')}
                  </option>
                ) : error ? (
                  <option value="" disabled>
                    {t('form.errorLoadingGrades')}
                  </option>
                ) : (
                  gradeLevels.map(level => (
                    <option key={level.value} value={level.value}>
                    {level.label}
                    </option>
                  ))
                )}
              </select>
              {errors.grade && (
                <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
                  {t(errors.grade)}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}