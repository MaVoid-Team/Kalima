// AssistantForm.jsx
import React from "react";

const AssistantForm = ({ userData, handleChange, lecturers }) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">المعلم المسؤول</span>
      </label>
      <select
        name="assignedLecturer"
        className="select select-bordered"
        value={userData.assignedLecturer || ""}
        onChange={handleChange}
        required
      >
        <option value="">اختر المعلم المسؤول</option>
        {lecturers.map(lecturer => (
          <option key={lecturer._id} value={lecturer._id}>
            {lecturer.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AssistantForm;