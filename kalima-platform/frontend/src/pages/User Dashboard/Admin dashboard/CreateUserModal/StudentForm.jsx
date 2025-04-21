// StudentForm.jsx
import React, { useState } from "react";

const StudentForm = ({ userData, handleChange, levels }) => {
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">المستوى الدراسي</span>
          </label>
          <select
            name="level"
            className="select select-bordered"
            value={userData.level || ""}
            onChange={handleChange}
            required
          >
            <option value="">اختر المستوى الدراسي</option>
            {levels.map(level => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">الرقم التسلسلي (اختياري)</span>
          </label>
          <input
            type="text"
            name="sequencedId"
            className="input input-bordered"
            value={userData.sequencedId || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">رقم هاتف ولي الأمر (اختياري)</span>
          </label>
          <input
            type="text"
            name="parentPhoneNumber"
            className="input input-bordered"
            value={userData.parentPhoneNumber || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">الهوايات (اختياري)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={hobby}
            onChange={(e) => setHobby(e.target.value)}
            placeholder="أضف هواية"
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={addHobby}
          >
            إضافة
          </button>
        </div>
        {userData.hobbies && userData.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {userData.hobbies.map((h, index) => (
              <div key={index} className="badge badge-secondary gap-1">
                {h}
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
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