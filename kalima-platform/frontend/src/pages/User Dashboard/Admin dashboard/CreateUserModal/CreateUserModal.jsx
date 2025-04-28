import React, { useState, useEffect } from "react";
import { getAllLecturers } from "../../../../routes/fetch-users";
import { getAllLevels } from "../../../../routes/levels";
import { getAllSubjects } from "../../../../routes/courses";
import StudentForm from "./StudentForm";
import ParentForm from "./ParentForm";
import LecturerForm from "./LecturerForm";
import AssistantForm from "./AssistantForm";
import BulkCreateUsers from "./BulkCreateUsers";

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
  };

  const [userData, setUserData] = useState(initialUserState);
  const [formError, setFormError] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false); // State to toggle between modes
  
  // State for dropdown data
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData(initialUserState);
      setFormError("");
      setIsBulkMode(false); // Reset to single user mode
      fetchDropdownData();
    }
  }, [isOpen]);

  // Fetch data for dropdowns
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const levelsResult = await getAllLevels();
      if (levelsResult.success) {
        setLevels(levelsResult.data.levels || []);
      } else {
        console.error("Failed to fetch levels:", levelsResult.error);
      }
      
      const subjectsResult = await getAllSubjects();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.data.subjects || []);
      } else {
        console.error("Failed to fetch subjects:", subjectsResult.error);
      }
      
      const lecturersResult = await getAllLecturers();
      if (lecturersResult.success) {
        setLecturers(lecturersResult.data || []);
      } else {
        console.error("Failed to fetch lecturers:", lecturersResult.error);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (userData.password !== userData.confirmPassword) {
      setFormError("كلمات المرور غير متطابقة");
      return;
    }

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

    const filteredData = filterDataByRole(userData);
    onCreateUser(filteredData);
  };

  const filterDataByRole = (data) => {
    const commonFields = {
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      gender: data.gender
    };

    switch (data.role) {
      case "student":
        return {
          ...commonFields,
          level: data.level || undefined,
          phoneNumber: data.phoneNumber || undefined,
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

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl mb-4">
          {isBulkMode ? "إنشاء مستخدمين بالجملة" : "إنشاء مستخدم جديد"}
        </h3>

        {/* Toggle between single and bulk user creation */}
        <div className="tabs tabs-border mb-4">
          <button
            className={`tab ${!isBulkMode ? "tab-active" : ""}`}
            onClick={() => setIsBulkMode(false)}
          >
            إنشاء مستخدم واحد
          </button>
          <button
            className={`tab ${isBulkMode ? "tab-active" : ""}`}
            onClick={() => setIsBulkMode(true)}
          >
            إنشاء بالجملة
          </button>
        </div>

        {formError && (
          <div className="alert alert-error mb-4">
            <span>{formError}</span>
          </div>
        )}
        
        {isBulkMode ? (
          <BulkCreateUsers />
        ) : loadingDropdowns ? (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <div className="flex flex-col gap-2">
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
              </div>

              <div className="form-control">
                <div className="flex flex-col gap-2">
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
            </div>

            <div className="form-control">
              <div className="flex flex-col gap-2">
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
            </div>

            <div className="form-control">
              <div className="flex flex-col gap-2">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <div className="flex flex-col gap-2">
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
              </div>

              <div className="form-control">
                <div className="flex flex-col gap-2">
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
            </div>

            {userData.role === "student" && (
              <StudentForm 
                userData={userData} 
                handleChange={handleChange} 
                levels={levels} 
              />
            )}

            {userData.role === "parent" && (
              <ParentForm 
                userData={userData} 
                handleChange={handleChange} 
              />
            )}

            {userData.role === "lecturer" && (
              <LecturerForm 
                userData={userData} 
                handleChange={handleChange} 
                subjects={subjects} 
              />
            )}

            {userData.role === "assistant" && (
              <AssistantForm 
                userData={userData} 
                handleChange={handleChange} 
                lecturers={lecturers} 
              />
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