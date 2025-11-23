"use client";

import { useEffect, useState } from "react";
import { getAllSubjects } from "../../routes/courses";

export default function StepTeacher({
  formData,
  handleInputChange,
  t,
  errors,
  role,
}) {
  const handleNumberOnlyChange = (e) => {
    const { name, value } = e.target;
    const cleaned = toEnglishDigits(value);
    handleInputChange({ target: { name, value: cleaned } });
  };

  const toEnglishDigits = (value) => {
  if (!value) return "";

  return value
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)) 
    .replace(/[^\d]/g, ""); 
};


  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await getAllSubjects();
      if (response.success) {
        setSubjects(response.data);
      } else {
        console.error(response.error);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="space-y-4">
      <div className="form-control"></div>
      <h1>البيانات الاضافيه للحصول علي مميزات منصه كلمه</h1>
      
      {/* Level Selection */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">{t("form.level")}</span>
          </label>
          <div className="flex flex-row gap-2">
            {["primary", "preparatory", "secondary"].map((levelOption) => (
              <label
                key={levelOption}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  name="level"
                  value={levelOption}
                  checked={formData.level?.includes(levelOption) || false}
                  onChange={(e) => {
                    const value = e.target.value;
                    const isChecked = e.target.checked;
                    const updatedLevels = isChecked
                      ? [...(formData.level || []), value]
                      : (formData.level || []).filter(
                          (level) => level !== value
                        );
                    handleInputChange({
                      target: { name: "level", value: updatedLevels },
                    });
                  }}
                />
                <span>{t(`gradeLevels.${levelOption}`)}</span>
              </label>
            ))}
          </div>
          {errors.level && (
            <span className="text-error text-sm mt-1">
              {t(`validation.${errors.level}`)}
            </span>
          )}
        </div>
      </div>

      {/* Teaches At Type */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("form.teachesAtType") || "Teaches At"}
            </span>
          </label>
          <select
            name="teachesAtType"
            className={`select select-bordered w-2/3 lg:w-1/2 ${
              errors.teachesAtType ? "select-error animate-shake" : ""
            }`}
            value={formData.teachesAtType || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">
              {t("form.selectTeachesAt") || "Select where you teach"}
            </option>
            <option value="Center">{t("center")}</option>
            <option value="School">{t("school")}</option>
            <option value="Both">{t("both")}</option>
          </select>
          {errors.teachesAtType && (
            <span className="text-error text-sm mt-1">
              {t(`validation.${errors.teachesAtType}`) ||
                "This field is required"}
            </span>
          )}
        </div>
      </div>

      {/* Centers - Show if teachesAtType is Center or Both */}
      {(formData.teachesAtType === "Center" ||
        formData.teachesAtType === "Both") && (
        <div className="form-control">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">
                {t("form.centers") || "Centers"}
              </span>
            </label>
            <div className="flex flex-col gap-2">
              {(formData.centers || [""]).map((center, index) => (
                <div key={index} className="flex gap-2 w-1/2">
                  <input
                    type="text"
                    className={`input input-bordered w-2/3 lg:w-1/2 flex-1 ${
                      errors.centers?.[index] ? "input-error animate-shake" : ""
                    }`}
                    value={center}
                    onChange={(e) => {
                      const newCenters = [...(formData.centers || [""])];
                      newCenters[index] = e.target.value;
                      handleInputChange({
                        target: { name: "centers", value: newCenters },
                      });
                    }}
                    placeholder={`${t("form.centerName") || "Center name"}`}
                  />
                  {index === (formData.centers || [""]).length - 1 ? (
                    <button
                      type="button"
                      className="btn btn-square btn-outline"
                      onClick={() => {
                        const newCenters = [...(formData.centers || [""]), ""];
                        handleInputChange({
                          target: { name: "centers", value: newCenters },
                        });
                      }}
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-square btn-outline btn-error"
                      onClick={() => {
                        const newCenters = (formData.centers || [""]).filter(
                          (_, i) => i !== index
                        );
                        handleInputChange({
                          target: { name: "centers", value: newCenters },
                        });
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.centers && (
              <span className="text-error text-sm mt-1">
                {t(`validation.${errors.centers}`) ||
                  "Please add at least one center"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* School - Show if teachesAtType is School or Both */}
      {(formData.teachesAtType === "School" ||
        formData.teachesAtType === "Both") && (
        <div className="form-control">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t("form.school") || "School"}</span>
            </label>
            <input
              type="text"
              name="school"
              className={`input input-bordered w-2/3 lg:w-1/2 ${
                errors.school ? "input-error animate-shake" : ""
              }`}
              value={formData.school || ""}
              onChange={handleInputChange}
              placeholder={`${t("form.schoolName") || "School name"}`}
              required
            />
            {errors.school && (
              <span className="text-error text-sm mt-1">
                {t(`validation.${errors.school}`) || "School name is required"}
              </span>
            )}
          </div>
        </div>
      )}

      {role === "teacher" && (
        <>
          <div className="form-control relative pb-5">
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text">{t("form.phoneNumber2")}</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="phoneNumber2"
                value={formData.phoneNumber2}
                onChange={handleNumberOnlyChange}
                className="input input-bordered w-2/3 lg:w-1/2"
              />

              <label className="label">
                <span className="label-text">{t("form.optional")}</span>
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

      <div className="form-control relative pb-5">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("form.profilePic") || "Profile Picture"}
            </span>
          </label>
          <input
            type="file"
            name="profilePic"
            accept=".jpg,.jpeg,.png"
            className="file-input file-input-bordered w-2/3 lg:w-1/2"
            onChange={handleInputChange}
          />
          {formData.profilePic && (
            <p className="text-xs mt-1 text-base-content/70">
              Selected file: {formData.profilePic.name}
            </p>
          )}
          {errors.profilePic && (
            <span className="absolute bottom-0 text-error text-sm mt-1">
              {t(`validation.${errors.profilePic}`)}
            </span>
          )}
        </div>
      </div>

      {/* Social Media */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("form.socialMedia") || "Social Media"}
            </span>
          </label>
          <div className="flex flex-col gap-2">
            {(formData.socialMedia || [{ platform: "", account: "" }]).map(
              (social, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <select
                    className={`select select-bordered ${
                      errors.socialMedia?.[index]?.platform
                        ? "select-error animate-shake"
                        : ""
                    }`}
                    value={social.platform || ""}
                    onChange={(e) => {
                      const newSocialMedia = [
                        ...(formData.socialMedia || [
                          { platform: "", account: "" },
                        ]),
                      ];
                      newSocialMedia[index] = {
                        ...newSocialMedia[index],
                        platform: e.target.value,
                      };
                      handleInputChange({
                        target: { name: "socialMedia", value: newSocialMedia },
                      });
                    }}
                  >
                    <option value="">
                      {t("form.selectPlatform") || "Select platform"}
                    </option>
                    {[
                      {
                        value: "Facebook",
                        label: t("form.facebook") || "Facebook",
                      },
                      {
                        value: "Instagram",
                        label: t("form.instagram") || "Instagram",
                      },
                      {
                        value: "Twitter",
                        label: t("form.twitter") || "Twitter",
                      },
                      {
                        value: "LinkedIn",
                        label: t("form.linkedin") || "LinkedIn",
                      },
                      { value: "TikTok", label: t("form.tikTok") || "TikTok" },
                      {
                        value: "YouTube",
                        label: t("form.youtube") || "YouTube",
                      },
                      {
                        value: "WhatsApp",
                        label: t("form.whatsApp") || "WhatsApp",
                      },
                      {
                        value: "Telegram",
                        label: t("form.telegram") || "Telegram",
                      },
                    ].map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`input input-bordered flex-1 ${
                        errors.socialMedia?.[index]?.account
                          ? "input-error animate-shake"
                          : ""
                      }`}
                      value={social.account || ""}
                      onChange={(e) => {
                        const newSocialMedia = [
                          ...(formData.socialMedia || [
                            { platform: "", account: "" },
                          ]),
                        ];
                        newSocialMedia[index] = {
                          ...newSocialMedia[index],
                          account: e.target.value,
                        };
                        handleInputChange({
                          target: {
                            name: "socialMedia",
                            value: newSocialMedia,
                          },
                        });
                      }}
                      placeholder={`${
                        t("form.accountName") || "Account name/handle"
                      }`}
                    />
                    {index ===
                    (formData.socialMedia || [{ platform: "", account: "" }])
                      .length -
                      1 ? (
                      <button
                        type="button"
                        className="btn btn-square btn-outline"
                        onClick={() => {
                          const newSocialMedia = [
                            ...(formData.socialMedia || [
                              { platform: "", account: "" },
                            ]),
                            { platform: "", account: "" },
                          ];
                          handleInputChange({
                            target: {
                              name: "socialMedia",
                              value: newSocialMedia,
                            },
                          });
                        }}
                      >
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-square btn-outline btn-error"
                        onClick={() => {
                          const newSocialMedia = (
                            formData.socialMedia || [
                              { platform: "", account: "" },
                            ]
                          ).filter((_, i) => i !== index);
                          handleInputChange({
                            target: {
                              name: "socialMedia",
                              value: newSocialMedia,
                            },
                          });
                        }}
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
