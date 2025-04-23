import React, { useState } from "react";
import { bulkCreateUsers } from "../../../../routes/fetch-users"; // Adjust the import path as necessary
    const BulkCreateUsers = () => {
    const [accountType, setAccountType] = useState("student");
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
  
      // Prepare form data
      const formData = new FormData();
      formData.append("accountType", accountType);
      formData.append("file", file);
  
      // Call API to bulk create users
      const result = await bulkCreateUsers(formData);
  
      if (result.success) {
        setSuccess("Users created successfully!");
        setFile(null);
        setAccountType("student");
        document.getElementById("file-input").value = ""; // Reset file input
      } else {
        setError(result.error);
      }
  
      setLoading(false);
    };
  
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Bulk Create Users</h2>
  
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
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="lecturer">Lecturer</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>
  
          <div className="form-control">
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