"use client"

import { useState } from "react"

const LecturerForm = ({ userData, handleChange, subjects, t, isRTL  , governments, getAdministrationZonesForGovernment}) => {
  const [selectedSubjects, setSelectedSubjects] = useState(userData.subject || [])

  const handleSubjectSelect = (e) => {
    const subjectId = e.target.value
    if (!subjectId) return

    // Check if subject is already selected
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((prev) => [...prev, subjectId])
      userData.subject = [...(userData.subject || []), subjectId]
    }
  }

  const removeSubject = (subjectId) => {
    setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId))
    userData.subject = (userData.subject || []).filter((id) => id !== subjectId)
  }

  // Find subject name by ID
  const getSubjectNameById = (id) => {
    const subject = subjects.find((s) => s._id === id)
    return subject ? subject.name : id
  }

  return (
    <>
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
      <div className="form-control">
        <div className="flex flex-col gap-4">
          <label className="label">
            <span className="label-text">{t("fields.subjects")}</span>
          </label>
          <div className="flex gap-2">
            <select className="select select-bordered flex-1" onChange={handleSubjectSelect} value="">
              <option value="">{t("placeholders.selectSubject")}</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id} disabled={selectedSubjects.includes(subject._id)}>
                  {subject.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary">
              {t("buttons.add")}
            </button>
          </div>
        </div>

        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSubjects.map((subjectId) => (
              <div key={subjectId} className="badge badge-secondary gap-1">
                {getSubjectNameById(subjectId)}
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => removeSubject(subjectId)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-control">
        <div className="flex flex-col gap-4">
          <label className="label">
            <span className="label-text">{t("fields.bio")}</span>
          </label>
          <textarea
            name="bio"
            className="textarea textarea-bordered"
            value={userData.bio || ""}
            onChange={handleChange}
            rows="3"
            placeholder={t("placeholders.bio")}
          ></textarea>
        </div>
      </div>

      <div className="form-control">
        <div className="flex flex-col gap-4">
          <label className="label">
            <span className="label-text">{t("fields.expertise")}</span>
          </label>
          <input
            type="text"
            name="expertise"
            className="input input-bordered"
            value={userData.expertise || ""}
            onChange={handleChange}
            placeholder={t("placeholders.expertise")}
          />
        </div>
      </div>
    </>
  )
}

export default LecturerForm
