export default function Step1({ formData, handleInputChange, t, errors }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{t('form.personalDetails')}</p>
      
      {/* Student ID */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">{t('form.studentId')}</span>
        </label>
        <input
          type="number"
          name="studentId"
          className={`input input-bordered ${errors.studentId ? 'input-error animate-shake' : ''}`}
          value={formData.studentId}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Full Name */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">{t('form.fullName')}</span>
        </label>
        <input
          type="text"
          name="fullName"
          className={`input input-bordered ${errors.fullName ? 'input-error animate-shake' : ''}`}
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Gender Selection */}
      <div className="flex gap-4">
        {/* Student Gender */}
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">{t('form.studentGender')}</span>
          </label>
          <select
            name="studentGender"
            className={`select select-bordered ${errors.studentGender ? 'select-error animate-shake' : ''}`}
            value={formData.studentGender}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('form.selectGender')}</option>
            <option value="male">{t('gender.male')}</option>
            <option value="female">{t('gender.female')}</option>
          </select>
        </div>

        {/* Parent Gender */}
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">{t('form.parentGender')}</span>
          </label>
          <select
            name="parentGender"
            className={`select select-bordered ${errors.parentGender ? 'select-error animate-shake' : ''}`}
            value={formData.parentGender}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('form.selectGender')}</option>
            <option value="male">{t('gender.male')}</option>
            <option value="female">{t('gender.female')}</option>
          </select>
        </div>
      </div>

      {/* Parent Checkbox */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            name="isParent"
            className="checkbox checkbox-primary"
            checked={formData.isParent}
            onChange={handleInputChange}
          />
          <span className="label-text">{t('form.imParent')}</span>
        </label>
      </div>

      {/* Student Phone */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">{t('form.studentPhone')}</span>
        </label>
        <input
          type="number"
          name="studentPhone"
          className={`input input-bordered ${errors.studentPhone ? 'input-error animate-shake' : ''}`}
          value={formData.studentPhone}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
  );
}