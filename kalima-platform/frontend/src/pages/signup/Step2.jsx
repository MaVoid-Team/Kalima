export default function Step2({ formData, handleInputChange, t ,errors}) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">{t('form.parentDetails')}</p>
        {/* Parent Phone */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('form.parentPhone')}</span>
          </label>
          <input
            type="number"
            name="parentPhone"
            className={`input input-bordered ${errors.parentPhone ? 'input-error animate-shake' : ''}`}
            value={formData.parentPhone}
            onChange={handleInputChange}
            required

          />
        </div>
  
        {/* Parent Checkbox (Again) */}
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
  
        {/* Student Phone  */}
        <div className="form-control">
          <label className="number">
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
  
        {/* Email */}
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
  
        {/* Address */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t('form.address')}</span>
          </label>
          <textarea
            name="address"
            className={`textarea textarea-bordered h-24 ${errors.address ? 'textarea-error animate-shake' : ''}`}
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    );
  }