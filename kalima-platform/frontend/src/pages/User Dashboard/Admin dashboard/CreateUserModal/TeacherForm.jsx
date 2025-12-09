"use client";

import { useEffect, useState } from "react";

const TeacherForm = ({
  userData,
  handleChange,
  subjects,
  levels,

  t,
  isRTL,
}) => {
  const [selectedCenters, setSelectedCenters] = useState(
    userData.centers || []
  );
  const [socialMediaLinks, setSocialMediaLinks] = useState(
    userData.socialMedia || []
  );

  // Handle level selection - use level values instead of IDs
  const handleLevelSelect = (e) => {
    const levelValue = e.target.value;
    if (!levelValue) return;

    if (!selectedLevels.includes(levelValue)) {
      const newLevels = [...selectedLevels, levelValue];
      setSelectedLevels(newLevels);
      const syntheticEvent = {
        target: {
          name: "level",
          value: newLevels,
        },
      };
      handleChange(syntheticEvent);
    }
  };

  const removeLevel = (levelValue) => {
    const newLevels = selectedLevels.filter((level) => level !== levelValue);
    setSelectedLevels(newLevels);
    const syntheticEvent = {
      target: {
        name: "level",
        value: newLevels,
      },
    };
    handleChange(syntheticEvent);
  };

  // Handle centers
  const addCenter = () => {
    const centerInput = document.getElementById("centerInput");
    const centerName = centerInput.value.trim();

    if (centerName && !selectedCenters.includes(centerName)) {
      const newCenters = [...selectedCenters, centerName];

      setSelectedCenters(newCenters);
      handleChange({
        target: {
          name: "centers",
          value: newCenters,
        },
      });

      centerInput.value = "";
    }
  };

  const removeCenter = (centerName) => {
    const newCenters = selectedCenters.filter((c) => c !== centerName);

    setSelectedCenters(newCenters);

    handleChange({
      target: {
        name: "centers",
        value: newCenters,
      },
    });
  };

  useEffect(() => {
    setSelectedCenters(userData.centers || []);
  }, [userData.centers]);

  const toEnglishDigits = (str) =>
    str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d]/g, "");

  const handlePhoneInputChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = toEnglishDigits(value);
    handleChange({ target: { name, value: cleanedValue } });
  };

  // Handle social media - Fixed to use 'account' instead of 'link'
  const addSocialMedia = () => {
    const platformInput = document.getElementById("socialPlatform");
    const accountInput = document.getElementById("socialAccount");
    const platform = platformInput.value;
    const account = accountInput.value.trim();

    if (platform && account) {
      const newSocialMedia = [...socialMediaLinks, { platform, account }];
      setSocialMediaLinks(newSocialMedia);
      platformInput.value = "";
      accountInput.value = "";
      const syntheticEvent = {
        target: {
          name: "socialMedia",
          value: newSocialMedia,
        },
      };
      handleChange(syntheticEvent);
    }
  };

  const removeSocialMedia = (index) => {
    const newSocialMedia = socialMediaLinks.filter((_, i) => i !== index);
    setSocialMediaLinks(newSocialMedia);
    const syntheticEvent = {
      target: {
        name: "socialMedia",
        value: newSocialMedia,
      },
    };
    handleChange(syntheticEvent);
  };

  // Find subject name by ID
  const getSubjectNameById = (id) => {
    const subject = subjects.find((s) => s._id === id);
    return subject ? subject.name : id;
  };

  // Get level display name - handle both database objects and simple strings
  const getLevelDisplayName = (levelValue) => {
    // If levels is an array of objects with name/value properties
    if (levels.length > 0 && typeof levels[0] === "object") {
      const level = levels.find(
        (l) => l.value === levelValue || l._id === levelValue
      );
      return level ? level.name || level.value : levelValue;
    }
    // If levels is an array of strings or simple values
    return levelValue;
  };

  // Normalize levels to always be an array
  const normalizedLevels = Array.isArray(userData.level)
    ? userData.level
    : userData.level
    ? [userData.level]
    : [];

  const [selectedLevels, setSelectedLevels] = useState(normalizedLevels);

  // Keep synced when userData.level changes
  useEffect(() => {
    const normalized = Array.isArray(userData.level)
      ? userData.level
      : userData.level
      ? [userData.level]
      : [];

    setSelectedLevels(normalized);
  }, [userData.level]);

  const shouldShowCenters =
    userData.teachesAtType === "Both" || userData.teachesAtType === "Center";
  const shouldShowSchool =
    userData.teachesAtType === "Both" || userData.teachesAtType === "School";

  // Define the allowed level values
  const allowedLevels = [
    { value: "primary", label: t("levels.primary") || "Primary" },
    { value: "preparatory", label: t("levels.preparatory") || "Preparatory" },
    { value: "secondary", label: t("levels.secondary") || "Secondary" },
  ];

  return (
    <div className="space-y-4 novalidate">
      <h3 className="text-xl font-bold mb-4 text-primary text-center">
        البيانات الفرعية للحصول على مميزات منصة كلمة
      </h3>

      {/* Subject Selection */}
      <div className="form-control">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("fields.subject") || "Subject"}
            </span>
          </label>
      {/* Subject Selection */}
          <select
            name="subject"
            className="select select-bordered"
            value={userData.subject || ""}
            onChange={(e) =>
              handleChange({
                target: { name: "subject", value: e.target.value },
              })
            }
            required
          >
            <option value="">
              {t("placeholders.selectSubject") || "Select Subject"}
            </option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Level Selection (Multiple) - Use predefined level values */}
      <div className="">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("fields.levels") || "Teaching Levels"}
            </span>
          </label>
          <select
            className="select select-bordered"
            onChange={handleLevelSelect}
            value=""
          >
            <option value="">
              {t("placeholders.selectLevel") || "Select Level"}
            </option>
            {allowedLevels.map((level) => (
              <option
                key={level.value}
                value={level.value}
                disabled={selectedLevels.includes(level.value)}
              >
                {level.label}
              </option>
            ))}
          </select>
          {selectedLevels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedLevels.map((levelValue) => (
                <div key={levelValue} className="badge badge-primary gap-2">
                  {getLevelDisplayName(levelValue)}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => removeLevel(levelValue)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teaches At Type */}
      <div className=" ">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("fields.teachesAtType") || "Teaches At"}
            </span>
          </label>
          <select
            name="teachesAtType"
            className="select select-bordered"
            value={userData.teachesAtType || ""}
            onChange={handleChange}
          >
            <option value="">
              {t("placeholders.selectTeachesAt") || "Select where you teach"}
            </option>
            <option value="Both">
              {t("options.both") || "Both Center & School"}
            </option>
            <option value="Center">
              {t("options.center") || "Center Only"}
            </option>
            <option value="School">
              {t("options.school") || "School Only"}
            </option>
          </select>
        </div>
      </div>

      {/* Centers - Show if teachesAtType is "Both" or "Center" */}
      {shouldShowCenters && (
        <div className="">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">
                {t("fields.centers") || "Centers"}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="centerInput"
                className="input input-bordered flex-1"
                placeholder={
                  t("placeholders.centerName") || "Enter center name"
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCenter())
                }
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addCenter}
              >
                {t("buttons.add") || "Add"}
              </button>
            </div>
            {selectedCenters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCenters.map((center, index) => (
                  <div key={index} className="badge badge-secondary gap-2">
                    {center}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => removeCenter(center)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* School - Show if teachesAtType is "Both" or "School" */}
      {shouldShowSchool && (
        <div className="form-control">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">
                {t("fields.school") || "School"}
              </span>
            </label>
            <input
              type="text"
              name="school"
              className="input input-bordered"
              value={userData.school || ""}
              onChange={handleChange}
              placeholder={t("placeholders.school") || "Enter school name"}
              required={shouldShowSchool}
            />
          </div>
        </div>
      )}

      {/* Social Media (Optional) - Updated to use 'account' */}
      <div className="">
        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">
              {t("fields.socialMedia") || "Social Media (Optional)"}
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select id="socialPlatform" className="select select-bordered">
              <option value="">
                {t("placeholders.selectPlatform") || "Select Platform"}
              </option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
            </select>
            <input
              type="text"
              id="socialAccount"
              className="input input-bordered"
              placeholder={
                t("placeholders.socialAccount") || "Enter account/username"
              }
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addSocialMedia}
            >
              {t("buttons.add") || "Add"}
            </button>
          </div>
          {socialMediaLinks.length > 0 && (
            <div className="space-y-2 mt-2">
              {socialMediaLinks.map((social, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-base-200 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="badge badge-outline">
                      {social.platform}
                    </span>
                    <span className="text-sm truncate">{social.account}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => removeSocialMedia(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;
