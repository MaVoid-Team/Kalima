export default function Step2({ formData, handleInputChange, t, errors }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{t('form.parentDetails')}</p>
      {/* Parent Phone */}
      <div className="relative pb-5 form-control ">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t('form.parentPhone')}</span>
        </label>
        <input
          type="number"
          name="parentPhoneNumber"
          className={`input input-bordered ${errors.parentPhoneNumber ? 'input-error animate-shake' : ''}`}
          value={formData.parentPhoneNumber}
          onChange={handleInputChange}
          required
        />
        
        {errors.parentPhoneNumber && (
          <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
            {t(errors.parentPhoneNumber)}
          </span>
        )}
        </div>
      </div>

      {/* Email */}
      <div className="relative pb-5 form-control ">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t('form.email')}</span>
        </label>
        <input
          type="email"
          name="email"
          className={`input input-bordered ${errors.email ? 'input-error animate-shake' : ''}`}
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        {errors.email && (
          <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
            {t(errors.email)}
          </span>
        )}
        </div>
      </div>
      
      {/* Password */}
      <div className="relative pb-5 form-control ">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t('form.password')}</span>
        </label>
        <input
          type="password"
          name="password"
          className={`input input-bordered ${errors.password ? 'input-error animate-shake' : ''}`}
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {errors.password && (
          <span className="text-error text-sm mt-1">
            {t('validation.passwordRequirements')}
          </span>
        )}
        </div>
      </div>

      {/* Confirm Password - Added field */}
      <div className="relative pb-5 form-control ">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t('form.confirmPassword')}</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          className={`input input-bordered ${errors.confirmPassword ? 'input-error animate-shake' : ''}`}
          value={formData.confirmPassword || ''}
          onChange={handleInputChange}
          required
        />
        {errors.confirmPassword && (
          <span className="text-error text-sm mt-1">
            {t(errors.confirmPassword)}
          </span>
        )}
        </div>
      </div>
    </div>
  );
}