// LecturerForm.jsx
import React, { useState } from "react";

const LecturerForm = ({ userData, handleChange, subjects }) => {
  const [selectedSubjects, setSelectedSubjects] = useState(userData.subject || []);

  const handleSubjectSelect = (e) => {
    const subjectId = e.target.value;
    if (!subjectId) return;
    
    // Check if subject is already selected
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(prev => [...prev, subjectId]);
      userData.subject = [...(userData.subject || []), subjectId];
    }
  };

  const removeSubject = (subjectId) => {
    setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    userData.subject = (userData.subject || []).filter(id => id !== subjectId);
  };

  // Find subject name by ID
  const getSubjectNameById = (id) => {
    const subject = subjects.find(s => s._id === id);
    return subject ? subject.name : id;
  };

  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">المواد الدراسية</span>
        </label>
        <div className="flex gap-2">
          <select
            className="select select-bordered flex-1"
            onChange={handleSubjectSelect}
            value=""
          >
            <option value="">اختر مادة</option>
            {subjects.map(subject => (
              <option 
                key={subject._id} 
                value={subject._id}
                disabled={selectedSubjects.includes(subject._id)}
              >
                {subject.name}
              </option>
            ))}
          </select>
          <button 
            type="button" 
            className="btn btn-secondary"
          >
            إضافة
          </button>
        </div>
        
        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSubjects.map(subjectId => (
              <div key={subjectId} className="badge badge-secondary gap-1">
                {getSubjectNameById(subjectId)}
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs" 
                  onClick={() => removeSubject(subjectId)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">نبذة شخصية (اختياري)</span>
        </label>
        <textarea
          name="bio"
          className="textarea textarea-bordered"
          value={userData.bio || ""}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">التخصص (اختياري)</span>
        </label>
        <input
          type="text"
          name="expertise"
          className="input input-bordered"
          value={userData.expertise || ""}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default LecturerForm;