"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getUserDashboard} from "../../../routes/auth-services"
import { getContainerById } from "../../../routes/lectures"

const ContainerDetails = () => {
  const { containerId } = useParams()
  const navigate = useNavigate()
  const [container, setContainer] = useState(null)
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user role
        const dashboardResult = await getUserDashboard()
        if (!dashboardResult.success) {
          throw new Error("Failed to fetch user role")
        }
        setUserRole(dashboardResult.data.data.userInfo.role)

        // Fetch container details
        const containerResult = await getContainerById(containerId)
        if (containerResult.status === "success") {
          const { data } = containerResult
          setContainer(data)
          // Filter children to only include lectures (kind: "Lecture")
          setLectures(data.children.filter(child => child.kind === "Lecture") || [])
        } else {
          throw new Error("Failed to load container details")
        }
      } catch (err) {
        setError(err.message || "Failed to load container details. Please try again later.")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [containerId])

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

  if (!container) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>لا توجد حاوية متاحة.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline mb-4"
      >
        رجوع
      </button>
      <h1 className="text-3xl font-bold mb-6">{container.name}</h1>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">تفاصيل الحاوية</h2>
          <p><strong>النوع:</strong> {container.type}</p>
          <p><strong>المادة:</strong> {container.subject?.name || "غير محدد"}</p>
          <p><strong>المستوى:</strong> {container.level?.name || "غير محدد"}</p>
          <p><strong>السعر:</strong> {container.price} نقاط</p>
          {userRole === "Lecturer" && (
            <p><strong>تم إنشاؤها بواسطة:</strong> {container.createdBy?.name || "غير محدد"}</p>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">المحاضرات</h2>
          {lectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture) => (
                <div key={lecture._id} className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <h3 className="card-title">{lecture.name}</h3>
                    <div className="card-actions justify-end">
                      <Link
                        to={`/dashboard/${userRole.toLowerCase()}-dashboard/lecture-display/${lecture._id}`}
                        className="btn btn-primary"
                      >
                        عرض المحاضرة
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد محاضرات متاحة في هذه الحاوية.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContainerDetails