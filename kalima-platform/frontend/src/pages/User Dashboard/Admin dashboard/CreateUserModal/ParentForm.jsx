"use client"

const ParentForm = ({
  userData,
  handleChange,
  handleGovernmentChange,
  governments,
  administrationZones,
  loadingZones,
  t,
  isRTL,
}) => {
  const toEnglishDigits = (str) => str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d]/g, "")

  const handlePhoneInputChange = (e) => {
    const { name, value } = e.target
    const cleanedValue = toEnglishDigits(value)
    handleChange({ target: { name, value: cleanedValue } })
  }

  const handleGovernmentSelect = (e) => {
    const governmentName = e.target.value
    handleGovernmentChange(governmentName)
  }

  return (
    <div className="space-y-4">
      {/* Phone Number Field */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t("fields.phoneNumber")}</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="phoneNumber"
            className="input input-bordered"
            value={userData.phoneNumber || ""}
            onChange={handlePhoneInputChange}
            placeholder={t("placeholders.phoneNumber") || "Enter phone number"}
            required
          />
        </div>
      </div>

     
    </div>
  )
}

export default ParentForm
