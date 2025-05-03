import { useState, useEffect } from "react";
import { getAllLevels } from '../../routes/levels'; // Adjust the import path based on your project structure
import { Eye, EyeOff } from 'lucide-react';
export default function StepParent({ formData, handleChildrenChange, t, errors, handleInputChange }) {
    const [childrenCount, setChildrenCount] = useState(1);
    const [gradeLevels, setGradeLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Ensure we have enough empty slots for all children
    const safeChildren = [...formData.children, ...Array(childrenCount - formData.children.length).fill('')];

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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`input input-bordered0 pr-12 ${errors.password ? 'input-error animate-shake' : ''}`}
                value={formData.password || ''}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 z-10 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-sm mt-1">
                {t('validation.passwordRequirements')}
              </span>
            )}
          </div>
        </div>
      {/* Confirm Password */}
      <div className="form-control relative">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.confirmPassword')}</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`input input-bordered pr-10 ${errors.confirmPassword ? 'input-error animate-shake' : ''}`}
              value={formData.confirmPassword || ''}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2  z-10 text-gray-500"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-error text-sm mt-1">
              {t(errors.confirmPassword)}
            </span>
          )}
        </div>
      </div>

            {/* Optional Level Field
            <div className="form-control">
                <div className="flex flex-col gap-2">
                    <label className="label">
                        <span className="label-text">{t('form.level')} ({t('form.optional')})</span>
                    </label>
                    <select
                        name="level"
                        className={`select select-bordered  ${errors.level ? 'select-error animate-shake' : ''}`}
                        value={formData.level || ''}
                        onChange={handleInputChange}
                        disabled={loading || error}
                    >
                        <option value="">{t('form.selectLevel')}</option>
                        {loading ? (
                            <option value="" disabled>
                                {t('form.loading')}
                            </option>
                        ) : error ? (
                            <option value="" disabled>
                                {t('form.errorLoadingLevels')}
                            </option>
                        ) : (
                            gradeLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {t(`gradeLevels.${level.label}`)}
                                </option>
                            ))
                        )}
                    </select>
                    {errors.level && <span className="text-error text-sm mt-1">{t(errors.level)}</span>}
                </div>
            </div> */}

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