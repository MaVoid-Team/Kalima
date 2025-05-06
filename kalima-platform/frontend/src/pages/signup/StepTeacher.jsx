import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function StepTeacher({ formData, handleInputChange, t, errors , gradeLevels}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const {i18n} = useTranslation();
  return (
    <div className="space-y-4">
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t("form.email")}</span>
          </label>
          <input
            type="email"
            name="email"
            className={`input input-bordered ${errors.email ? "input-error animate-shake" : ""}`}
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errors.email && <span className="text-error text-sm mt-1">{t("validation.email")}</span>}
        </div>
      </div>

      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.password')}</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`input input-bordered ${i18n.language === 'ar' ? 'pr-12' : 'pl-12'} ${errors.password ? 'input-error animate-shake' : ''}`}
              value={formData.password || ''}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
               className={`absolute top-1/2 ${i18n.language === 'ar' ? 'right-3' : 'left-3'} -translate-y-1/2 z-10 text-gray-500`}
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

      <div className="form-control relative">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.confirmPassword')}</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`input input-bordered ${i18n.language === 'ar' ? 'pr-12' : 'pl-12'} ${errors.confirmPassword ? 'input-error animate-shake' : ''}`}
              value={formData.confirmPassword || ''}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className={`absolute top-1/2 ${i18n.language === 'ar' ? 'right-3' : 'left-3'} -translate-y-1/2 z-10 text-gray-500`}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-error text-sm mt-1">
              {t(`validation.${errors.confirmPassword}`)}
            </span>
          )}
        </div>
      </div>

       {/* Level Selection */}
       <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.level')}</span>
          </label>
          <select
            name="level"
            className={`select select-bordered ${errors.level ? 'select-error animate-shake' : ''}`}
            value={formData.level}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('form.selectLevel')}</option>
            {gradeLevels.map(level => (
              <option key={level.value} value={level.value}>
                {t(`gradeLevels.${level.label}`)}
              </option>
            ))}
          </select>
          {errors.level && (
            <span className="text-error text-sm mt-1">
            {t(`validation.${errors.level}`)}
            </span>
          )}
        </div>
      </div>

      {/* Subject Input */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.subject')}</span>
          </label>
          <input
          type="text"
          name="subject"
          className={`input input-bordered ${errors.subject ? "input-error animate-shake" : ""}`}
          value={formData.subject || ""} // Direct string value
          onChange={handleInputChange} // Use default handler
          placeholder={t("form.subjectPlaceholder") || "e.g. Mathematics, Physics"}
          required
        />
          {errors.subject && (
            <span className="text-error text-sm mt-1">
              {t(`validation.${errors.subject}`)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}