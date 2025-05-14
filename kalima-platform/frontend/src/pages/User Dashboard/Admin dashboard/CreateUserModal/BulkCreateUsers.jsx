"use client"

import { useState } from "react"
import { bulkCreateUsers } from "../../../../routes/fetch-users"

const BulkCreateUsers = () => {
  const [accountType, setAccountType] = useState("student")
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type !== "text/csv") {
      setError("Please upload a valid CSV file")
      setFile(null)
      return
    }
    setError("")
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!file) {
      setError("Please upload a CSV file")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      // Make sure this matches exactly what your API expects
      formData.append("accountType", accountType)
      formData.append("file", file)

      console.log("Submitting form data:", {
        accountType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })

      const result = await bulkCreateUsers(formData)
      console.log("API Response:", result)

      if (result.success) {
        setSuccess("Users created successfully!")
        setFile(null)
        // Reset the file input
        document.getElementById("file-input").value = ""
      } else {
        // Handle error message properly
        const errorMessage =
          typeof result === "string" ? result : result.error || "Failed to create users. Please try again."
        setError(errorMessage)
      }
    } catch (err) {
      console.error("Error in form submission:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Bulk Create Users</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Account Type</span>
              </label>
              <select
                name="accountType"
                className="select select-bordered w-full"
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
                <option value="subadmin">Sub Admins</option>
              </select>
              <label className="label">
                <span className="label-text-alt text-info">Select the type of accounts to create</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Upload CSV File</span>
              </label>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
                required
              />
              <label className="label">
                <span className="label-text-alt text-info">
                  CSV file should include required fields for the selected account type
                </span>
              </label>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full" disabled={loading || !file}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  "Create Users"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 bg-base-200 p-4 rounded-lg">
            <h3 className="font-medium mb-2">CSV Format Guidelines</h3>
            <p className="text-sm mb-2">Your CSV file should include the following columns:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Name - Full name of the user</li>
              <li>Phone - Full correct Phone number</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkCreateUsers
