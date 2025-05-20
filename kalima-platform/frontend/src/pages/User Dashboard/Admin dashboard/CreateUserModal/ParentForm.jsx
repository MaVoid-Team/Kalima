"use client"

const ParentForm = ({ userData, handleChange, t, governments, getAdministrationZonesForGovernment, isRTL }) => {
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
       {/* Government Selection */}
            <div className="form-control relative pb-5">
              <div className="flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">{t("fields.government") || "Government"}</span>
                </label>
                <select
                  name="government"
                  className={`select select-bordered w-2/3 lg:w-1/2 `}
                  value={userData.government || ""}
                  onChange={handleChange}
                >
                  <option value="">{t("fields.selectGovernment") || "Select Government"}</option>
                  {governments.map((government) => (
                    <option key={government} value={government}>
                      {government}
                    </option>
                  ))}
                </select>
              </div>
            </div>
      
            {/* Administration Zone Selection - Only show if government is selected */}
            
              <div className="form-control relative pb-5">
                <div className="flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">{t("fields.administrationZone") || "Administration Zone"}</span>
                  </label>
                  <select
                    disabled={!userData.government}
                    name="administrationZone"
                    className={`select select-bordered  w-2/3 lg:w-1/2 `}
                    value={userData.administrationZone || ""}
                    onChange={handleChange}
                  >
                    <option value="">{t("fields.selectAdministrationZone") || "Select Administration Zone"}</option>
                    {getAdministrationZonesForGovernment(userData.government).map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
    </div>
    
  )
}

export default ParentForm
