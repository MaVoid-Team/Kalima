import { useState } from "react";

export default function StepParent({ formData, handleChildrenChange, t, errors, handleInputChange }) {
    const [childrenCount, setChildrenCount] = useState(1);
    // Ensure we have enough empty slots for all children
    const safeChildren = [...formData.children, ...Array(childrenCount - formData.children.length).fill('')];
    
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">{t('form.parentDetails')}</p>
        
        {/* Email Field */}
        <div className="form-control">
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
                placeholder="email@example.com"
                required
            />
            {errors.email && <span className="text-error text-sm mt-1">{t(errors.email)}</span>}
          </div>
        </div>

        {/* Password Field */}
        <div className="form-control">
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
            {errors.password && <span className="text-error text-sm mt-1">{t(errors.password)}</span>}
            </div>
        </div>
        
        {/* Confirm Password Field */}
        <div className="form-control">
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
            {errors.confirmPassword && <span className="text-error text-sm mt-1">{t(errors.confirmPassword)}</span>}
            </div>
        </div>
        
        {/* Optional Level Field */}
        <div className="form-control">
            <div className="flex flex-col gap-2">
            <label className="label">
                <span className="label-text">{t('form.level')} ({t('form.optional')})</span>
            </label>
            <select
                name="level"
                className="select select-bordered w-full"
                value={formData.level || ''}
                onChange={handleInputChange}
            >
                <option value="">{t('form.selectLevel')}</option>
                <option value="First Secondary">First Secondary</option>
                <option value="Second Secondary">Second Secondary</option>
                <option value="Third Secondary">Third Secondary</option>
                {/* Add more options as needed */}
            </select>
            </div>
        </div>
        
        <p className="text-lg font-semibold mt-6">{t('form.childrenSequenceIds')}</p>
        <p className="text-sm text-gray-500">{t('form.childrenSequenceIdsHelp')}</p>
        
        {safeChildren.slice(0, childrenCount).map((child, i) => (
          <div key={i} className="form-control">
            <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('form.childSequenceId')} #{i + 1}</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.children?.[i] ? 'input-error animate-shake' : ''}`}
              value={child || ''}
              onChange={(e) => handleChildrenChange(i, e.target.value)}
              placeholder="333"
              required={i === 0} // At least one child is required
            />
            {errors.children?.[i] && <span className="text-error text-sm mt-1">{t(errors.children[i])}</span>}
            </div>
          </div>
        ))}
  
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => setChildrenCount(prev => prev + 1)}
        >
          {t('buttons.addAnotherChild')}
        </button>
      </div>
    );
}