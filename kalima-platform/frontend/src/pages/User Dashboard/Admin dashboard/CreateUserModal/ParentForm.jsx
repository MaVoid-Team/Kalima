// ParentForm.jsx
import React from "react";

const ParentForm = ({ userData, handleChange }) => {
  return (
    <div className="form-control">
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
  );
};

export default ParentForm;