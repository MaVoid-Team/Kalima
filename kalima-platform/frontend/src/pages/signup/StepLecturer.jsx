"use client"

import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
export default function StepLecturer({ formData, handleInputChange, t, errors }) {
   const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      {/* Bio */}

      <div className="form-control">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t("form.bio")}</span>
        </label>
        <textarea
          name="bio"
          className={`textarea textarea-bordered ${errors.bio ? "textarea-error animate-shake" : ""}`}
          value={formData.bio}
          onChange={handleInputChange}
          required
        />
        {errors.bio && (
          <span className="text-error text-sm mt-1">
            {formData.bio?.length === 0 ? t("validation.required") : t("validation.bioMinimum")}
          </span>
        )}
        </div>
      </div>
        {/*Subject */}
        <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t("form.subject")}</span>
          </label>
          <input
            type="text"
            name="subject"
            placeholder={t("form.subjectPlaceholder") || "e.g. math, physics"}
            className={`input input-bordered ${errors.subject ? "input-error animate-shake" : ""}`}
            value={formData.subject?.join(", ") || ""}
            onChange={(e) =>
              handleInputChange({
                target: {
                  name: "subject",
                  value: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
            required
          />
          {errors.subject && (
            <span className="text-error text-sm mt-1">{t("validation.required")}</span>
          )}
        </div>
      </div>
      {/* Expertise */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t("form.expertise")}</span>
        </label>
        <input
          type="text"
          name="expertise"
          className={`input input-bordered ${errors.expertise ? "input-error animate-shake" : ""}`}
          value={formData.expertise}
          onChange={handleInputChange}
          required
        />
        {errors.expertise && <span className="text-error text-sm mt-1">{t("validation.required")}</span>}
        </div>
      </div>
    </div>
  )
}
