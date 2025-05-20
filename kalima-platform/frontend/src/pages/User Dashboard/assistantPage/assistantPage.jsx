"use client"

import { useState, useEffect } from "react"
import { getUserDashboard } from "../../../routes/auth-services"
import { BookOpen, FileText, Layers, User, BarChart2, ChevronLeft, ChevronRight, Search, Filter, Calendar, Clock, CheckCircle, XCircle, Briefcase, GraduationCap, Award, FileCheck, Eye, Paperclip, ChevronDown } from 'lucide-react'
import { useNavigate } from "react-router-dom";
const AssistantPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [activeTab, setActiveTab] = useState("containers")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [expandedContainers, setExpandedContainers] = useState({})
  const [expandedLectures, setExpandedLectures] = useState({})
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getUserDashboard()
        if (result.success) {
          setDashboardData(result.data.data)
          console.log(dashboardData)
        } else {
          setError(result.error || "Failed to fetch dashboard data")
        }
      } catch (err) {
        setError("An error occurred while fetching data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleContainerExpand = (id) => {
    setExpandedContainers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const filterData = (data, term) => {
    if (!term) return data
    
    return data.filter((item) => {
      const searchableText = [
        item.name,
        item.description,
        item.subject?.name,
        item.level?.name,
        item.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      
      return searchableText.includes(term.toLowerCase())
    })
  }

  const paginateData = (data, page, perPage) => {
    const startIndex = (page - 1) * perPage
    return data.slice(startIndex, startIndex + perPage)
  }

  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <button
                key={pageNum}
                className={`join-item btn ${currentPage === pageNum ? "btn-primary" : ""}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            className="join-item btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderContainers = () => {
    if (!dashboardData?.lecturerContainers) return null

    const filteredContainers = filterData(dashboardData.lecturerContainers, searchTerm)
    const paginatedContainers = paginateData(filteredContainers, currentPage, itemsPerPage)

    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Containers ({filteredContainers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Level</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContainers.map((container) => (
                <tr key={container._id} className="hover:bg-base-200">
                  <td className="font-medium">{container.name}</td>
                  <td>
                    <span className="badge badge-outline capitalize">{container.type}</span>
                  </td>
                  <td>{container.subject?.name || "N/A"}</td>
                  <td>{container.level?.name || "N/A"}</td>
                  <td>{container.price > 0 ? `${container.price} points` : "Free"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => toggleContainerExpand(container._id)}
                    >
                      {expandedContainers[container._id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedContainers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No containers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renderPagination(filteredContainers.length)}
      </div>
    )
  }

  const renderLectures = () => {
    if (!dashboardData?.lectures) return null

    const filteredLectures = filterData(dashboardData.lectures, searchTerm)
    const paginatedLectures = paginateData(filteredLectures, currentPage, itemsPerPage)

    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Lectures ({filteredLectures.length})</h2> 
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedLectures.map((lecture) => (
            <div key={lecture._id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <h3 className="card-title text-base line-clamp-1">{lecture.name}</h3>
                  <div className="badge badge-primary">{lecture.lecture_type}</div>
                </div>
                <p className="text-sm opacity-70 line-clamp-2">{lecture.description || "No description"}</p>
                <div className="flex flex-wrap justify-between items-center mt-2 text-xs opacity-70 gap-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 flex-shrink-0" />
                    {lecture.numberOfViews || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 flex-shrink-0" />
                    {lecture.subject?.name || "No subject"}
                  </span>
                  {lecture.level && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 flex-shrink-0" />
                      {lecture.level.name}
                    </span>
                  )}
                  {lecture.requiresExam && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <FileCheck className="w-3 h-3 flex-shrink-0" />
                      Has Exam
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline btn-primary w-full mt-3"
                  onClick={() => navigate(`/dashboard/assistant-page/detailed-lecture-view/${lecture._id}`)}
                >
                 View Lecture Data 
                </button>
                <button
                  className="btn btn-sm btn-outline btn-primary w-full mt-3"
                  onClick={() => navigate(`/dashboard/assistant-page/lecture-display/${lecture._id}`)}
                >
                 Go To Lecture 
                </button>
              </div>
            </div>
          ))}
          {paginatedLectures.length === 0 && (
            <div className="col-span-full text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p>No lectures found</p>
            </div>
          )}
        </div>

        {renderPagination(filteredLectures.length)}
      </div>
    )
  }

  const renderAttachments = () => {
    if (!dashboardData?.attachments) return null

    const filteredAttachments = dashboardData.attachments.filter(
      (attachment) => !searchTerm || attachment.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const paginatedAttachments = paginateData(filteredAttachments, currentPage, itemsPerPage)

    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Attachments ({filteredAttachments.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Lecture</th>
                <th>Type</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttachments.map((attachment) => (
                <tr key={attachment._id} className="hover:bg-base-200">
                  <td className="font-medium">{attachment.fileName}</td>
                  <td>{attachment.lectureId?.name || "N/A"}</td>
                  <td>
                    <span className="badge badge-outline capitalize">{attachment.type}</span>
                  </td>
                  <td>{new Date(attachment.uploadedOn).toLocaleDateString()}</td>
                  <td>
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {paginatedAttachments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No attachments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renderPagination(filteredAttachments.length)}
      </div>
    )
  }

  const renderExamSubmissions = () => {
    if (!dashboardData?.examSubmissions) return null

    const filteredSubmissions = dashboardData.examSubmissions.filter(
      (submission) =>
        !searchTerm ||
        (submission.lecture?.name && submission.lecture.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (submission.student?.name && submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    const paginatedSubmissions = paginateData(filteredSubmissions, currentPage, itemsPerPage)

    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Exam Submissions ({filteredSubmissions.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lecture</th>
                <th>Score</th>
                <th>Status</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-base-200">
                  <td className="font-medium">{submission.student?.name || "Unknown"}</td>
                  <td>{submission.lecture?.name || "Unknown"}</td>
                  <td>
                    {submission.score}/{submission.maxScore} ({Math.round((submission.score / submission.maxScore) * 100)}%)
                  </td>
                  <td>
                    {submission.passed ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No exam submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renderPagination(filteredSubmissions.length)}
      </div>
    )
  }

  const renderHomeworkSubmissions = () => {
    if (!dashboardData?.homeworkSubmissions) return null

    const filteredSubmissions = dashboardData.homeworkSubmissions.filter(
      (submission) =>
        !searchTerm ||
        (submission.lecture?.name && submission.lecture.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (submission.student?.name && submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    const paginatedSubmissions = paginateData(filteredSubmissions, currentPage, itemsPerPage)

    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Homework Submissions ({filteredSubmissions.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lecture</th>
                <th>Score</th>
                <th>Status</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-base-200">
                  <td className="font-medium">{submission.student?.name || "Unknown"}</td>
                  <td>{submission.lecture?.name || "Unknown"}</td>
                  <td>
                    {submission.score}/{submission.maxScore} ({Math.round((submission.score / submission.maxScore) * 100)}%)
                  </td>
                  <td>
                    {submission.passed ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No homework submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {renderPagination(filteredSubmissions.length)}
      </div>
    )
  }

  const renderStats = () => {
    if (!dashboardData?.stats) return null

    const stats = [
      {
        title: "Total Lectures",
        value: dashboardData.stats.totalLectures,
        icon: <BookOpen className="w-6 h-6 text-blue-500" />,
        color: "bg-blue-100",
      },
      {
        title: "Lecture Views",
        value: dashboardData.stats.lectureViews,
        icon: <Eye className="w-6 h-6 text-green-500" />,
        color: "bg-green-100",
      },
      {
        title: "Exam Submissions",
        value: dashboardData.stats.totalStudentExamSubmissions,
        icon: <FileCheck className="w-6 h-6 text-purple-500" />,
        color: "bg-purple-100",
      },
      {
        title: "Homework Submissions",
        value: dashboardData.stats.totalStudentHomeworkSubmissions,
        icon: <FileText className="w-6 h-6 text-orange-500" />,
        color: "bg-orange-100",
      },
      {
        title: "Attachments",
        value: dashboardData.stats.totalAttachments,
        icon: <Paperclip className="w-6 h-6 text-red-500" />,
        color: "bg-red-100",
      },
    ]

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${stat.color}`}>{stat.icon}</div>
                  <div>
                    <h3 className="text-sm font-medium opacity-70">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <XCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          <span>No data available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with user info */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="avatar avatar-placeholder">
            <div className="bg-primary text-primary-content rounded-full w-16">
              <span className="text-xl">{dashboardData.userInfo.name.charAt(0)}</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{dashboardData.userInfo.name}</h1>
            <p className="text-base-content/70">{dashboardData.userInfo.email}</p>
            <div className="badge badge-primary mt-1">{dashboardData.userInfo.role}</div>
          </div>
          {dashboardData.userInfo.assignedLecturer && (
            <div className="bg-base-200/50 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="avatar avatar-placeholder">
                <div className="bg-secondary text-secondary-content rounded-full w-12">
                  <span>{dashboardData.userInfo.assignedLecturer.name.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{dashboardData.userInfo.assignedLecturer.name}</h2>
                <p className="text-sm text-base-content/70">{dashboardData.userInfo.assignedLecturer.role}</p>
                <p className="text-sm">
                  <span className="font-medium">Expertise:</span> {dashboardData.userInfo.assignedLecturer.expertise}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <div className="tabs tabs-boxed my-6">
        <button
          className={`tab ${activeTab === "containers" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("containers")}
        >
          <Layers className="w-4 h-4 mr-2" />
          Containers
        </button>
        <button
          className={`tab ${activeTab === "lectures" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("lectures")}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Lectures
        </button>
        <button
          className={`tab ${activeTab === "attachments" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("attachments")}
        >
          <Paperclip className="w-4 h-4 mr-2" />
          Attachments
        </button>
        <button
          className={`tab ${activeTab === "examSubmissions" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("examSubmissions")}
        >
          <FileCheck className="w-4 h-4 mr-2" />
          Exam Submissions
        </button>
        <button
          className={`tab ${activeTab === "homeworkSubmissions" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("homeworkSubmissions")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Homework Submissions
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6">
        {activeTab === "containers" && renderContainers()}
        {activeTab === "lectures" && renderLectures()}
        {activeTab === "attachments" && renderAttachments()}
        {activeTab === "examSubmissions" && renderExamSubmissions()}
        {activeTab === "homeworkSubmissions" && renderHomeworkSubmissions()}
      </div>
    </div>
  )
}

export default AssistantPage