"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserDashboard } from "../../../routes/auth-services"

const ContainersPage = () => {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getUserDashboard({
          params: {
            fields: 'userInfo,containers',
            limit: 5,
            type: 'course'
          }
        });

        if (result.success) {
          const { userInfo, containers = [], purchaseHistory = [] } = result.data.data
          setUserRole(userInfo.role)

          if (userInfo.role === 'Lecturer') {
            // For lecturers: show all their containers
            setContainers(containers)
          } else {
            // For students: show unique purchased containers
            const purchasedContainers = purchaseHistory
              .filter(p => p.type === 'containerPurchase' && p.container)
              .map(p => p.container)
              // Remove duplicates based on container._id
              .filter((container, index, self) =>
                index === self.findIndex(c => c._id === container._id)
              )
            
            setContainers(purchasedContainers)
          }
        } else {
          setError("Failed to load data")
        }
      } catch (err) {
        setError("Failed to load data. Please try again later.")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-error">
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
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">
        {userRole === 'Lecturer' ? 'الحاويات الخاصة بك' : 'الحاويات المشتراة'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {containers.map(container => (
          <div key={container._id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{container.name}</h2>
              
              <div className="flex flex-wrap gap-2 my-2">
                {container.subject?.name && (
                  <div className="badge badge-primary">{container.subject.name}</div>
                )}
                {container.level?.name && (
                  <div className="badge badge-secondary">{container.level.name}</div>
                )}
                <div className="badge badge-accent">{container.type}</div>
              </div>

              <div className="card-actions justify-end mt-4">
                {userRole === 'Lecturer' ? (
                  <Link 
                    to={`/dashboard/lecturer-dashboard/container-details/${container._id}`} 
                    className="btn btn-primary"
                  >
                    عرض التفاصيل
                  </Link>
                ) : (
                  <Link 
                    to={`/dashboard/student-dashboard/container-details/${container._id}`} 
                    className="btn btn-primary"
                  >
                    عرض التفاصيل
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {containers.length === 0 && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            {userRole === 'Lecturer' 
              ? 'لا توجد حاويات متاحة حالياً.' 
              : 'لم تقم بشراء أي حاويات بعد.'}
          </span>
        </div>
      )}
    </div>
  )
}

export default ContainersPage