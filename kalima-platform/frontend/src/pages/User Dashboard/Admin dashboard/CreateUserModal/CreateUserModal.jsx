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
    level: "",
    phoneNumber: "",
    parentPhoneNumber: "",
    hobbies: [],
    faction: "",
    school: "",
    parent: "",
    subject: [],
    bio: "",
    expertise: "",
    assignedLecturer: "",
    sequencedId: "",
  };

  const [userData, setUserData] = useState(initialUserState);
  const [formError, setFormError] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData(initialUserState);
      setFormError("");
      setIsBulkMode(false);
      fetchDropdownData();
    }
  }, [isOpen]);

  // Fetch data for dropdowns
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const levelsResult = await getAllLevels();
      if (levelsResult.success) {
        setLevels(levelsResult.data || []);
      } else {
        console.error("Failed to fetch levels:", levelsResult.error);
      }
      
      const subjectsResult = await getAllSubjects();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.data || []);
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
      setFormError("فشل في تحميل بيانات القوائم المنسدلة");
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Display error from parent component
  useEffect(() => {
    if (error) {
      setFormError(typeof error === "string" ? error : error.message || "فشل في إنشاء المستخدم");
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return "البريد الإلكتروني غير صالح";
    }

    // Password match and length
    if (userData.password !== userData.confirmPassword) {
      return "كلمات المرور غير متطابقة";
    }
    if (userData.password.length < 6) {
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    // Role-specific validations
    if (userData.role === "student") {
      if (!userData.level) {
        return "الرجاء تحديد المستوى الدراسي";
      }
      if (!userData.phoneNumber || !/^\d{10,15}$/.test(userData.phoneNumber)) {
        return "رقم الهاتف غير صالح (10-15 أرقام)";
      }
    }

    if (userData.role === "parent") {
      if (!userData.phoneNumber || !/^\d{10,15}$/.test(userData.phoneNumber)) {
        return "رقم الهاتف غير صالح (10-15 أرقام)";
      }
    }

    if (userData.role === "lecturer") {
      if (!userData.subject || userData.subject.length === 0) {
        return "الرجاء إدخال المواد الدراسية";
      }
    }

    if (userData.role === "assistant") {
      if (!userData.assignedLecturer) {
        return "الرجاء تحديد المعلم المسؤول";
      }
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const filteredData = filterDataByRole(userData);
    console.log("Filtered Data sent to backend:", filteredData); // Log data for debugging
    onCreateUser(filteredData);
  };

  const filterDataByRole = (data) => {
    const commonFields = {
      role: data.role,
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      gender: data.gender,
    };

    switch (data.role) {
      case "student":
        return {
          ...commonFields,
          level: data.level || undefined,
          phoneNumber: data.phoneNumber || undefined,
          sequencedId: data.sequencedId || undefined,
          parentPhoneNumber: data.parentPhoneNumber || undefined,
          hobbies: data.hobbies && data.hobbies.length > 0 ? data.hobbies : undefined,
          faction: data.faction || undefined,
          school: data.school || undefined,
          parent: data.parent || undefined,
        };
      
      case "parent":
        return {
          ...commonFields,
          phoneNumber: data.phoneNumber || undefined,
        };
      
      case "lecturer":
        return {
          ...commonFields,
          subject: data.subject || [],
          bio: data.bio || undefined,
          expertise: data.expertise || undefined,
        };
      
      case "assistant":
        return {
          ...commonFields,
          assignedLecturer: data.assignedLecturer || undefined,
        };
      
      case "subadmin":
      case "moderator":
        return commonFields;
      
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
                    <option value="" disabled>اختر نوع الحساب</option>
                    <option value="subadmin">مدير فرعي</option>
                    <option value="moderator">مشرف</option>
                    <option value="assistant">مساعد</option>
                    <option value="student">طالب</option>
                    <option value="parent">ولي أمر</option>
                    <option value="lecturer">معلم</option>
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
              <StudentForm userData={userData} handleChange={handleChange} levels={levels} />
            )}
            {userData.role === "parent" && (
              <ParentForm userData={userData} handleChange={handleChange} />
            )}
            {userData.role === "lecturer" && (
              <LecturerForm userData={userData} handleChange={handleChange} subjects={subjects} />
            )}
            {userData.role === "assistant" && (
              <AssistantForm userData={userData} handleChange={handleChange} lecturers={lecturers} />
            )}

            <div className="modal-action">
              <button type="button" className="btn" onClick={onClose}>
                إلغاء
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loadingDropdowns}
              >
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