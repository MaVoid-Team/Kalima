import React, { useState } from "react";
import { bulkCreateUsers } from "../../../../routes/fetch-users";

const BulkCreateUsers = () => {
  const [accountType, setAccountType] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv") {
      setError("Please upload a valid CSV file");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!file) {
      setError("Please upload a CSV file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("accountType", accountType);
    formData.append("file", file);

    const result = await bulkCreateUsers(formData);

    if (result.success) {
      setSuccess("Users created successfully!");
      setFile(null);
      setAccountType("students");
      document.getElementById("file-input").value = "";
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <div className="flex flex-col gap-4">
          <label className="label">
            <span className="label-text">Account Type</span>
          </label>
          <select
            name="accountType"
            className="select select-bordered"
            value={accountType}
            onChange={handleAccountTypeChange}
            required
          >
            <option value="student">Students</option>
            <option value="parent">Parents</option>
            <option value="lecturer">Lecturers</option>
            <option value="teacher">Teachers</option>
            <option value="assistant">Assistants</option>
            <option value="moderator">Moderators</option>
          </select>
          </div>
        </div>

        <div className="form-control">
          <div className="flex flex-col gap-4">
          <label className="label">
            <span className="label-text">Upload CSV File</span>
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            className="file-input file-input-bordered"
            onChange={handleFileChange}
            required
          />
          </div>
        </div>

        <div className="form-control mt-4">
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Create Users"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkCreateUsers;