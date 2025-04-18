import React, { useState, useEffect } from "react";
import { getAllLecturers } from "../routes/fetch-users";
import {getAllLevels} from "../routes/levels"
import {getAllSubjects} from "../routes/courses" // Adjust the import path as needed

const CreateUserModal = ({ 
  isOpen, 
  onClose, 
  onCreateUser, 
  error 
}) => {
  const initialUserState = {
    role: "student",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    // Role-specific fields will be added conditionally
  };

  const [userData, setUserData] = useState(initialUserState);
  const [formError, setFormError] = useState("");
  const [hobby, setHobby] = useState("");
  
  // State for dropdown data
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData(initialUserState);
      setFormError("");
      setHobby("");
      setSelectedSubjects([]);
      
      // Fetch dropdown data when modal opens
      fetchDropdownData();
    }
  }, [isOpen]);

  // Fetch data for dropdowns
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch levels
      const levelsResult = await getAllLevels();
      if (levelsResult.success) {
        setLevels(levelsResult.data.levels || []);
      }
      
      // Fetch subjects
      const subjectsResult = await getAllSubjects();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.data.subjects || []);
      }
      
      // Fetch lecturers
      const lecturersResult = await getAllLecturers();
      if (lecturersResult.success) {
        setLecturers(lecturersResult.data || []);
      }
    } catch (error) {
      setFormError("Failed to load dropdown data");
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Display error from parent component
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectSelect = (e) => {
    const subjectId = e.target.value;
    if (!subjectId) return;
    
    // Check if subject is already selected
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(prev => [...prev, subjectId]);
      setUserData(prev => ({
        ...prev,
        subject: [...(prev.subject || []), subjectId]
      }));
    }
  };

  const removeSubject = (subjectId) => {
    setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    setUserData(prev => ({
      ...prev,
      subject: (prev.subject || []).filter(id => id !== subjectId)
    }));
  };

  const addHobby = () => {
    if (hobby.trim()) {
      setUserData(prev => ({
        ...prev,
        hobbies: [...(prev.hobbies || []), hobby.trim()]
      }));
      setHobby("");
    }
  };

  const removeHobby = (index) => {
    setUserData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (userData.password !== userData.confirmPassword) {
      setFormError("كلمات المرور غير متطابقة");
      return;
    }

    // Role-specific validation
    if (userData.role === "student" && !userData.level) {
      setFormError("الرجاء تحديد المستوى الدراسي");
      return;
    }

    if (userData.role === "lecturer" && (!userData.subject || userData.subject.length === 0)) {
      setFormError("الرجاء إدخال المواد الدراسية");
      return;
    }

    if (userData.role === "assistant" && !userData.assignedLecturer) {
      setFormError("الرجاء تحديد المعلم المسؤول");
      return;
    }

    // Filter data based on role before submission
    const filteredData = filterDataByRole(userData);
    
    // Submit the filtered data
    onCreateUser(filteredData);
  };

  // Function to filter data based on role
  const filterDataByRole = (data) => {
    // Common fields for all roles
    const commonFields = {
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      gender: data.gender
    };

    // Add role-specific fields
    switch (data.role) {
      case "student":
        return {
          ...commonFields,
          level: data.level || undefined,
          phoneNumber: data.phoneNumber || undefined,
          // Only add optional fields if they have values
          ...(data.sequencedId ? { sequencedId: data.sequencedId } : {}),
          ...(data.parentPhoneNumber ? { parentPhoneNumber: data.parentPhoneNumber } : {}),
          ...(data.hobbies && data.hobbies.length > 0 ? { hobbies: data.hobbies } : {}),
          ...(data.faction ? { faction: data.faction } : {}),
          ...(data.school ? { school: data.school } : {}),
          ...(data.parent ? { parent: data.parent } : {})
        };
      
      case "parent":
        return {
          ...commonFields,
          phoneNumber: data.phoneNumber || undefined
        };
      
      case "lecturer":
        return {
          ...commonFields,
          subject: data.subject || [],
          ...(data.bio ? { bio: data.bio } : {}),
          ...(data.expertise ? { expertise: data.expertise } : {})
        };
      
      case "assistant":
        return {
          ...commonFields,
          assignedLecturer: data.assignedLecturer || undefined
        };
      
      default:
        return commonFields;
    }
  };

  // Find subject name by ID
  const getSubjectNameById = (id) => {
    const subject = subjects.find(s => s._id === id);
    return subject ? subject.name : id;
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl mb-4">إنشاء مستخدم جديد</h3>
        
        {formError && (
          <div className="alert alert-error mb-4">
            <span>{formError}</span>
          </div>
        )}
        
        {loadingDropdowns ? (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information - Common for all roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">نوع الحساب</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered"
                  value={userData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">طالب</option>
                  <option value="parent">ولي أمر</option>
                  <option value="lecturer">معلم</option>
                  <option value="assistant">مساعد</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">الجنس</span>
                </label>
                <select
                  name="gender"
                  className="select select-bordered"
                  value={userData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">الاسم</span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">كلمة المرور</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="input input-bordered"
                  value={userData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">تأكيد كلمة المرور</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input input-bordered"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Student-specific fields */}
            {userData.role === "student" && (
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
            )}

            {/* Parent-specific fields */}
            {userData.role === "parent" && (
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
            )}

            {/* Lecturer-specific fields */}
            {userData.role === "lecturer" && (
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
                      onClick={() => document.querySelector('select[onChange="handleSubjectSelect"]').focus()}
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
            )}

            {/* Assistant-specific fields */}
            {userData.role === "assistant" && (
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
            )}

            <div className="modal-action">
              <button type="button" className="btn" onClick={onClose}>
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary">
                إنشاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateUserModal;