export default function Step3({ formData, handleInputChange, t ,errors}) {
    const grades = Array.from({ length: 12 }, (_, i) => i + 1);
    const schoolTypes = ['arabic', 'english'];
    const variants = [1, 2, 3];
  
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">{t('form.schoolDetails')}</p>
        {/* School Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('form.schoolName')}</span>
          </label>
          <input
            type="text"
            name="schoolName"
            className={`input input-bordered ${errors.schoolName ? 'input-error animate-shake' : ''}`}
            value={formData.schoolName}
            onChange={handleInputChange}
            required
          />
        </div>
  
        {/* School Type and Grade */}
        <div className="flex gap-4">
          {/* School Type */}
          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">{t('form.schoolType')}</span>
            </label>
            <select
              name="schoolType"
              className={`select select-bordered ${errors.schoolType ? 'select-error animate-shake' : ''}`}
              value={formData.schoolType}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('form.selectSchoolType')}</option>
              {schoolTypes.map(type => (
                <option key={type} value={type}>
                  {t(`schoolType.${type}`)}
                </option>
              ))}
            </select>
          </div>
  
          {/* Grade */}
          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">{t('form.grade')}</span>
            </label>
            <select
              name="grade"
              className={`select select-bordered ${errors.grade ? 'select-error animate-shake' : ''}`}
              value={formData.grade}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('form.selectGrade')}</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Variant (Conditional) */}
        {formData.grade >= 9 && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t('form.variant')}</span>
            </label>
            <select
              name="variant"
              className={`select select-bordered ${errors.variant ? 'select-error animate-shake' : ''}`}
              value={formData.variant}
              onChange={handleInputChange}
              required={formData.grade >= 9}
            >
              <option value="">{t('form.selectVariant')}</option>
              {variants.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }