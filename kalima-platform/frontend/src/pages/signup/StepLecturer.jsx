export default function StepLecturer({ formData, handleInputChange, t, errors }) {
    return (
      <div className="space-y-4">
         <div className="form-control">
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
            </div>

            <div className="form-control">
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
            </div>
            <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.bio')}</span>
                </label>
                <textarea
                  name="bio"
                  className={`textarea textarea-bordered ${errors.bio ? 'textarea-error animate-shake' : ''}`}
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                />
                {errors.bio && (
              <span className="text-error text-sm mt-1 absolute">
                {formData.bio.length === 0 
                  ? t('validation.required')
                  : t('validation.bioMinimum')}
              </span>
            )}
              </div>
  
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('form.expertise')}</span>
          </label>
          <input
            type="text"
            name="expertise"
            className={`input input-bordered ${errors.expertise ? 'input-error' : ''}`}
            value={formData.expertise}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    );
  }