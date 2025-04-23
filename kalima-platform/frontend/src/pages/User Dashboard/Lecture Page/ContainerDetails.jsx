"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getContainerById } from "../../../routes/lectures"
import { getUserDashboard } from "../../../routes/auth-services"
import { FiBook, FiFolder, FiArrowLeft, FiPlus } from "react-icons/fi"

const ContainerDetailsPage = () => {
  const { containerId } = useParams()
  const [container, setContainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const dashRes = await getUserDashboard()
        if (!dashRes.success) {
          setError("Failed to load user info")
          return
        }

        const role = dashRes.data.data.userInfo.role
        setUserRole(role)

        const response = await getContainerById(containerId)
        if (response.status === 'success') {
          setContainer(response.data)
        } else {
          setError("Failed to load container details")
        }
      } catch (err) {
        setError(err.message || "Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    
      fetchData()
    }, [containerId])

  // Smoother loading state
  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to={userRole === 'Lecturer' ? "/dashboard/lecturer-dashboard" : "/dashboard/student-dashboard/promo-codes"}
            className="btn btn-outline px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-4">
              {container.points > 0 && (
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-lg">🏅</span>
                  <span className="font-medium">{container.points} Points</span>
                </div>
              )}
            </div>
          </div>
  

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{container.name}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-2">
                <FiFolder className="text-lg" />
                {container.type}
              </span>
              <span className="flex items-center gap-2">
                <FiBook className="text-lg" />
                {container.subject?.name}
              </span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {container.children?.map(child => (
              <div 
                key={child._id}
                className="group relative bg-white rounded-xl border border-gray-200 hover:border-primary transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {child.kind === 'Lecture' ? (
                        <FiBook className="text-primary text-xl" />
                      ) : (
                        <FiFolder className="text-primary text-xl" />
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{child.name}</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {child.kind || container.type}
                    </span>
                    <Link
              to={
                userRole === 'Lecturer'
                  ? `/dashboard/lecturer-dashboard/${child.kind === 'Lecture' ? 'lecture-display' : 'container-details'}/${child._id}`
                  : `/dashboard/student-dashboard/${child.kind === 'Lecture' ? 'lecture-display' : 'container-details'}/${child._id}`
              }
              className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 rounded-full"
            >
              View Details →
            </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {container.children?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 text-gray-300">📭</div>
              <p className="text-gray-500">No content available in this container</p>
            </div>
          )}
        </div>

        {/* Lecturer Actions */}
        {userRole === 'Lecturer' && (
          <div className="flex gap-4 justify-end">
            <button className="btn btn-primary px-6 py-3 rounded-full flex items-center gap-2">
              <FiPlus className="text-lg" />
              Add {container.type === 'month' ? 'Lecture' : 'Sub-Container'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContainerDetailsPage