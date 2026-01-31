"use client";

import { useState } from "react";

const StudentForm = ({
  userData,
  handleChange,
  handleGovernmentChange,
  levels,
  governments,
  administrationZones,
  loadingZones,
  t,
  isRTL,
}) => {
  const [hobby, setHobby] = useState("");

  const addHobby = () => {
    if (hobby.trim()) {
      userData.hobbies = [...(userData.hobbies || []), hobby.trim()];
      setHobby("");
    }
  };

  const removeHobby = (index) => {
    userData.hobbies = userData.hobbies.filter((_, i) => i !== index);
  };

  const toEnglishDigits = (str) =>
    str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d]/g, "");

  const handleGovernmentSelect = (e) => {
    const governmentName = e.target.value;
    handleGovernmentChange(governmentName);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <div className="flex flex-col gap-4">
            <label className="label">
              <span className="label-text">{t("fields.level")}</span>
            </label>
            <select
              name="level"
              className="select select-bordered"
              value={userData.level || ""}
              onChange={(e) =>
                handleChange({
                  target: { name: "level", value: e.target.value },
                })
              }
              required
            >
              <option value="">{t("placeholders.selectLevel")}</option>
              {levels.map((level) => (
                <option key={level._id} value={level.name}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <div className="flex flex-col gap-4">
            <label className="label">
              <span className="label-text">
                {t("fields.sequencedIdOptional")}
              </span>
            </label>
            <input
              type="text"
              name="sequencedId"
              className="input input-bordered"
              value={userData.sequencedId || ""}
              onChange={handleChange}
              placeholder={t("placeholders.sequencedId")}
            />
          </div>
        </div>
        <div className="form-control">
          <div className="flex flex-col gap-4">
            <label className="label">
              <span className="label-text">
                {t("fields.parentPhoneNumberOptional")}
              </span>
            </label>
            <input
              type="text"
              name="parentPhoneNumber"
              className="input input-bordered"
              value={userData.parentPhoneNumber || ""}
              onChange={handleChange}
              placeholder={t("placeholders.parentPhoneNumber")}
            />
          </div>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">{t("fields.hobbiesOptional")}</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={hobby}
            onChange={(e) => setHobby(e.target.value)}
            placeholder={t("placeholders.addHobby")}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addHobby}
          >
            {t("buttons.add")}
          </button>
        </div>
        {userData.hobbies && userData.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {userData.hobbies.map((h, index) => (
              <div key={index} className="badge badge-secondary gap-1">
                {h}
                <button
                  type="button"
                  className="btn-ghost btn-xs"
                  onClick={() => removeHobby(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentForm;
