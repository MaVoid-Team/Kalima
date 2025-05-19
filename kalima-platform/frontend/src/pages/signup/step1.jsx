import { useState, useEffect } from 'react';
import { governments, getAdministrationZonesForGovernment } from "../../constants/locations"

export default function Step1({ formData, handleInputChange, t, errors, role, gradeLevels  }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  return (
    <div className="space-y-2">
      <p className="text-2xl font-semibold">{t('form.personalDetails')}</p>

      {/* Common fields */}
      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.fullName')}</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`input input-bordered w-2/3 lg:w-1/2 ${errors.fullName ? 'input-error animate-shake' : ''}`}
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          {errors.fullName && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
             {t(`validation.${errors.fullName}`)}
            </span>
          )}
        </div>
      </div>

      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.gender')}</span>
          </label>
          <select
            name="gender"
            className={`select select-bordered w-2/3 lg:w-1/2 ${errors.gender ? 'select-error animate-shake' : ''}`}
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">{t('form.selectGender')}</option>
            <option value="male">{t('gender.male')}</option>
            <option value="female">{t('gender.female')}</option>
          </select>
        </div>
      </div>

      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.phoneNumber')}</span>
          </label>
          <input
            type="number"
            name="phoneNumber"
            className={`input input-bordered w-2/3 lg:w-1/2 ${errors.phoneNumber ? 'input-error animate-shake' : ''}`}
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
          {errors.phoneNumber && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
               {t(`validation.${errors.phoneNumber}`)}
            </span>
          )}
        </div>
      </div>

       {role === 'teacher' && (
        <>
     <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t('form.phoneNumber2')}</span>
          </label>
          <input
            type="number"
            name="phoneNumber2"
            className={`input input-bordered w-2/3 lg:w-1/2 `}
            value={formData.phoneNumber2}
            onChange={handleInputChange}
            required
          />
          <label className="label">
            <span className="label-text">{t('form.optional')}</span>
          </label>
          {errors.phoneNumber2 && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
               {t(`validation.${errors.phoneNumber2}`)}
            </span>
          )}
        </div>
      </div>
        </>
      )}

    {/* Government Selection */}
      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t("form.government") || "Government"}</span>
          </label>
          <select
            name="government"
            className={`select select-bordered w-2/3 lg:w-1/2 ${errors.government ? "select-error animate-shake" : ""}`}
            value={formData.government || ""}
            onChange={handleInputChange}
          >
            <option value="">{t("form.selectGovernment") || "Select Government"}</option>
            {governments.map((government) => (
              <option key={government} value={government}>
                {government}
              </option>
            ))}
          </select>
          {errors.government && (
            <span className="absolute bottom-0  text-error text-sm mt-1">
              {t(`validation.${errors.government}`) || "Government is required"}
            </span>
          )}
        </div>
      </div>

      {/* Administration Zone Selection - Only show if government is selected */}
      
        <div className="form-control relative pb-5">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t("form.administrationZone") || "Administration Zone"}</span>
            </label>
            <select
              disabled={!formData.government}
              name="administrationZone"
              className={`select select-bordered  w-2/3 lg:w-1/2 ${errors.administrationZone ? "select-error animate-shake" : ""}`}
              value={formData.administrationZone || ""}
              onChange={handleInputChange}
            >
              <option value="">{t("form.selectAdministrationZone") || "Select Administration Zone"}</option>
              {getAdministrationZonesForGovernment(formData.government).map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            {errors.administrationZone && (
              <span className="absolute bottom-0  text-error text-sm mt-1">
                {t(`validation.${errors.administrationZone}`) || "Administration Zone is required"}
              </span>
            )}
          </div>
        </div>
     
      {/* Student-specific fields */}
      {role === 'student' && (
        <>
       <div className="form-control relative pb-5">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('form.grade')}</span>
            </label>
            <select
              name="level"
              className={`select select-bordered w-2/3 lg:w-1/2 ${errors.level ? 'select-error animate-shake' : ''}`}
              value={formData.level}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('form.selectGrade')}</option>
              {gradeLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {t(`gradeLevels.${level.label}`)}
                </option>
              ))}
            </select>
            {errors.level && (
              <span className="absolute bottom-0  text-error text-sm mt-1">
                 {t(`validation.${errors.level}`)}
              </span>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}