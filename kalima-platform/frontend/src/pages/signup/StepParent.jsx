import { useState } from "react";

export default function StepParent({ formData, handleChildrenChange, t, errors , handleInputChange}) {
    const [childrenCount, setChildrenCount] = useState(1);
   const safeChildren = [...formData.children, ...Array(childrenCount - formData.children.length).fill('')];
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">{t('form.childrenDetails')}</p>
         {/* Email and Password Fields */}
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
        {safeChildren.slice(0, childrenCount).map((child, i) => (
          <div key={i} className="form-control">
            <label className="label">
              <span className="label-text">{t('form.childId')} #{i + 1}</span>
            </label>
            <input
            type="text"
            className={`input input-bordered ${errors.children?.[i] ? 'input-error animate-shake' : ''}`}
            value={child || ''}
            onChange={(e) => handleChildrenChange(i, e.target.value)}
            required
          />
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