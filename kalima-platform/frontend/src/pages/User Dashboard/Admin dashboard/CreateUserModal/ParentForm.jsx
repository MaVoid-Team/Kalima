"use client"

const ParentForm = ({ userData, handleChange, t, isRTL }) => {
  return (
    <div className="form-control">
      <div className="flex flex-col gap-2">
        <label className="label">
          <span className="label-text">{t("fields.phoneNumber")}</span>
        </label>
        <input
          type="tel"
          name="phoneNumber"
          className="input input-bordered"
          value={userData.phoneNumber || ""}
          onChange={handleChange}
          placeholder={t("placeholders.phoneNumber")}
          required
        />
      </div>
    </div>
  )
}

export default ParentForm
