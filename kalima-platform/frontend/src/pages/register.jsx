"use client";

import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../routes/auth-services";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common fields for all roles
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male", // Default value
  });

  // Role-specific fields
  const [teacherData, setTeacherData] = useState({
    bio: "",
    expertise: "",
  });

  const [studentData, setStudentData] = useState({
    sequencedId: "",
    level: "",
    hobbies: [],
    parentPhoneNumber: "",
    phoneNumber: "",
    faction: "Alpha", // Default value
  });

  const [parentData, setParentData] = useState({
    phoneNumber: "",
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleRoleSpecificChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (activeTab === "teacher") {
        setTeacherData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else if (activeTab === "student") {
        if (name === "hobbies") {
          const hobbiesArray = value.split(",").map((hobby) => hobby.trim());
          setStudentData((prev) => ({
            ...prev,
            hobbies: hobbiesArray,
          }));
        } else {
          setStudentData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      } else if (activeTab === "parent") {
        setParentData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    [activeTab]
  );

  const validateForm = useCallback(() => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  }, [formData.password, formData.confirmPassword]);

  const prepareRequestData = useCallback(() => {
    const requestData = {
      role: activeTab === "teacher" ? "lecturer" : activeTab,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
    };

    if (activeTab === "teacher") {
      return {
        ...requestData,
        bio: teacherData.bio,
        expertise: teacherData.expertise,
      };
    } else if (activeTab === "student") {
      return {
        ...requestData,
        sequencedId: Number.parseInt(studentData.sequencedId),
        level: studentData.level,
        hobbies: studentData.hobbies,
        parentPhoneNumber: studentData.parentPhoneNumber,
        phoneNumber: studentData.phoneNumber,
        faction: studentData.faction,
      };
    } else if (activeTab === "parent") {
      return {
        ...requestData,
        phoneNumber: parentData.phoneNumber,
      };
    }
  }, [activeTab, formData, teacherData, studentData, parentData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const requestData = prepareRequestData();
        const result = await registerUser(requestData);

        if (result.success) {
          navigate("/login");
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Registration error:", err);
      } finally {
        setLoading(false);
      }
    },
    [validateForm, prepareRequestData, navigate]
  );

  const renderTeacherFields = useMemo(
    () => (
      <>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Bio</span>
          </label>
          <textarea
            name="bio"
            placeholder="Tell us about yourself"
            className="textarea textarea-bordered text-foreground"
            value={teacherData.bio}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Expertise</span>
          </label>
          <input
            type="text"
            name="expertise"
            placeholder="Your area of expertise"
            className="input input-bordered text-foreground"
            value={teacherData.expertise}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
      </>
    ),
    [teacherData, handleRoleSpecificChange]
  );

  const renderStudentFields = useMemo(
    () => (
      <>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Student ID</span>
          </label>
          <input
            type="number"
            name="sequencedId"
            placeholder="Student ID"
            className="input input-bordered text-foreground"
            value={studentData.sequencedId}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Grade Level</span>
          </label>
          <input
            type="text"
            name="level"
            placeholder="e.g. Grade 4"
            className="input input-bordered text-foreground"
            value={studentData.level}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Hobbies</span>
          </label>
          <input
            type="text"
            name="hobbies"
            placeholder="e.g. reading, basketball (comma separated)"
            className="input input-bordered text-foreground"
            value={studentData.hobbies.join(", ")}
            onChange={handleRoleSpecificChange}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">
              Your Phone Number
            </span>
          </label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Your phone number"
            className="input input-bordered text-foreground"
            value={studentData.phoneNumber}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">
              Parent's Phone Number
            </span>
          </label>
          <input
            type="text"
            name="parentPhoneNumber"
            placeholder="Parent's phone number"
            className="input input-bordered text-foreground"
            value={studentData.parentPhoneNumber}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Faction</span>
          </label>
          <select
            name="faction"
            className="select select-bordered text-foreground"
            value={studentData.faction}
            onChange={handleRoleSpecificChange}
          >
            <option value="Alpha">Alpha</option>
            <option value="Beta">Beta</option>
            <option value="Gamma">Gamma</option>
            <option value="Delta">Delta</option>
          </select>
        </div>
      </>
    ),
    [studentData, handleRoleSpecificChange]
  );

  const renderParentFields = useMemo(
    () => (
      <>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">
              Phone Number
            </span>
          </label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Your phone number"
            className="input input-bordered text-foreground"
            value={parentData.phoneNumber}
            onChange={handleRoleSpecificChange}
            required
          />
        </div>
      </>
    ),
    [parentData, handleRoleSpecificChange]
  );

  const renderCommonFields = useMemo(
    () => (
      <>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Name</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="input input-bordered text-foreground"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered text-foreground"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered text-foreground"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">
              Confirm Password
            </span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="input input-bordered text-foreground"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-card-foreground">Gender</span>
          </label>
          <select
            name="gender"
            className="select select-bordered text-foreground"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </>
    ),
    [formData, handleInputChange]
  );

  const renderForm = useMemo(
    () => (
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderCommonFields}

        {activeTab === "teacher" && renderTeacherFields}
        {activeTab === "student" && renderStudentFields}
        {activeTab === "parent" && renderParentFields}

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control mt-6">
          <button
            className={`btn bg-button-background text-button-foreground border-none hover:bg-accent hover:text-foreground ${
              loading ? "loading" : ""
            }`}
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : `Register as ${
                  activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                }`}
          </button>
        </div>
      </motion.form>
    ),
    [
      renderCommonFields,
      renderTeacherFields,
      renderStudentFields,
      renderParentFields,
      activeTab,
      error,
      loading,
      handleSubmit,
    ]
  );

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary">Register now!</h1>
        <p className="py-6 text-foreground">
          Join our community and start your journey with us.
        </p>
      </div>

      <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-background">
        <div className="card-body">
          <div className="tabs tabs-boxed mb-4">
            <Link
              className={`tab ${
                activeTab === "parent"
                  ? "bg-primary duration-500 transition-all"
                  : "text-foreground"
              }`}
              onClick={() => setActiveTab("parent")}
            >
              Parent
            </Link>
            <Link
              className={`tab ${
                activeTab === "student"
                  ? "bg-primary duration-500 transition-all"
                  : "text-foreground"
              }`}
              onClick={() => setActiveTab("student")}
            >
              Student
            </Link>
            <Link
              className={`tab ${
                activeTab === "teacher"
                  ? "bg-primary duration-500 transition-all"
                  : "text-foreground"
              }`}
              onClick={() => setActiveTab("teacher")}
            >
              Teacher
            </Link>
          </div>

          {renderForm}

          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover text-accent">
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Register;
