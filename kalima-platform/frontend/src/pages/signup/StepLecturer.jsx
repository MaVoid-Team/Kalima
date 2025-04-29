"use client"

export default function StepLecturer({ formData, handleInputChange, t, errors }) {
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
          <span className="label-text">{t("form.password")}</span>
        </label>
        <input
          type="password"
          name="password"
          className={`input input-bordered ${errors.password ? "input-error animate-shake" : ""}`}
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {errors.password && <span className="text-error text-sm mt-1">{t("validation.password")}</span>}
        </div>
      </div>

      <div className="form-control">
        <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t("form.validatepassword")}</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          className={`input input-bordered ${errors.confirmPassword ? "input-error animate-shake" : ""}`}
          value={formData.confirmPassword || ""}
          onChange={handleInputChange}
          required
        />
        {errors.confirmPassword && <span className="text-error text-sm mt-1">{t("validation.passwordMatch")}</span>}
        </div>
      </div>

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
