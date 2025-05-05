// ParentForm.jsx
import React from "react";

const ParentForm = ({ userData, handleChange }) => {
  return (
    <div className="form-control">
      <div className="flex flex-col gap-4">
      <label className="label">
        <span className="label-text">رقم الهاتف</span>
      </label>
      <input
        type="text"
        name="phoneNumber"
        className="input input-bordered"
        value={userData.phoneNumber || ""}
        onChange={handleChange}
        required
      />
      </div>
    </div>
  );
};

export default ParentForm;