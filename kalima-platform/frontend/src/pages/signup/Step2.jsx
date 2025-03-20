export default function Step2({ formData, handleInputChange, t ,errors}) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">{t('form.parentDetails')}</p>
        {/* Parent Phone */}
        <div className="relative pb-5 form-control ">
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
          
          {errors.fieldName && (
        <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
          {t(errors.fieldName)}
        </span>
      )}
      </div>
  
   
        {/* Email */}
        <div className="relative pb-5 form-control ">
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
         {errors.fieldName && (
        <span className="absolute bottom-0 left-0 text-error text-sm mt-1">
       {t(errors.fieldName)}
      </span>
  )}
        </div>
        {/* Password */}
          <div className="relative pb-5 form-control ">
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
    );
  }