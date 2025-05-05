"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getContainerById, purchaseContainer } from "../routes/lectures"
import { getUserDashboard } from "../routes/auth-services"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorAlert } from "../components/ErrorAlert"
import {
  FaChalkboardTeacher,
  FaBook,
  FaGraduationCap,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaStickyNote,
  FaLock,
  FaUnlock,
  FaPlayCircle
} from "react-icons/fa"

const DetailItem = ({ label, value, icon }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-base-200 last:border-b-0">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-right">{value}</span>
  </div>
)

const ContainerItem = ({ container, isPurchased, onPurchase, purchaseInProgress }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [childContainers, setChildContainers] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchChildren = async () => {
    if (isExpanded || !container.children || container.children.length === 0) return
    
    setLoading(true)
    try {
      // Fetch each child container
      const childrenPromises = container.children.map(child => 
        getContainerById(child._id || child.id)
      )
      
      const results = await Promise.all(childrenPromises)
      const validResults = results
        .filter(result => result?.status === "success" && result.data)
        .map(result => result.data)
      
      setChildContainers(validResults)
    } catch (err) {
      console.error("Error fetching child containers:", err)
    } finally {
      setLoading(false)
      setIsExpanded(true)
    }
  }

  const containerIsPurchased = isPurchased(container._id)
  const containerTypeLabel = {
    'course': 'دورة',
    'year': 'سنة',
    'term': 'فصل دراسي',
    'month': 'شهر',
    'lecture': 'محاضرة'
  }[container.type] || container.type

  return (
    <div className="card bg-base-100 shadow-sm mb-3">
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {container.type === 'lecture' ? (
              <FaPlayCircle className="text-primary" />
            ) : (
              <FaBook className="text-primary" />
            )}
            <div>
              <h3 className="font-medium">{container.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="badge badge-accent">{containerTypeLabel}</span>
                {container.price > 0 ? (
                  <span className="badge badge-neutral">{container.price} نقطة</span>
                ) : (
                  <span className="badge badge-success">مجاني</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {containerIsPurchased ? (
              <span className="badge badge-success gap-1">
                <FaUnlock size={12} /> تم الشراء
              </span>
            ) : (
              <button 
                className={`btn btn-sm btn-primary ${purchaseInProgress === container._id ? 'loading' : ''}`}
                onClick={() => onPurchase(container._id)}
                disabled={purchaseInProgress !== null}
              >
                {container.price > 0 ? 'شراء' : 'الحصول مجاناً'}
              </button>
            )}
            
            {container.children && container.children.length > 0 && (
              <button 
                className="btn btn-sm btn-ghost btn-circle"
                onClick={fetchChildren}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Child containers */}
        {isExpanded && childContainers.length > 0 && (
          <div className="mt-4 pl-6 border-r-2 border-base-300">
            {childContainers.map(child => (
              <ContainerItem 
                key={child._id} 
                container={child} 
                isPurchased={isPurchased}
                onPurchase={onPurchase}
                purchaseInProgress={purchaseInProgress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [purchaseInProgress, setPurchaseInProgress] = useState(null)
  const [purchaseError, setPurchaseError] = useState("")
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [remainingPoints, setRemainingPoints] = useState(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch course data and user dashboard in parallel
        const [courseResult, dashboardResult] = await Promise.all([
          getContainerById(courseId),
          getUserDashboard({
            params: {
              fields: 'userInfo,purchaseHistory',
            }
          })
        ])

        if (courseResult?.status === "success" && courseResult.data) {
          setCourseData(courseResult.data)
        } else {
          setError("فشل في جلب بيانات الدورة")
        }

        if (dashboardResult?.success) {
          setPurchaseHistory(dashboardResult.data.data.purchaseHistory || [])
          
          // Store user points if available
          if (dashboardResult.data.data.userInfo) {
            setRemainingPoints(dashboardResult.data.data.userInfo.generalPoints || 0)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("حدث خطأ غير متوقع")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  // Check if a container is purchased
  const isContainerPurchased = (containerId) => {
    return purchaseHistory.some(purchase => 
      purchase.type === 'containerPurchase' &&
      purchase.container?._id === containerId
    )
  }

  // Handle container purchase
  const handlePurchase = async (containerId) => {
    setPurchaseInProgress(containerId)
    setPurchaseError("")
    setPurchaseSuccess(false)
    
    try {
      // Call the purchase API
      const response = await purchaseContainer(containerId)
      
      // Check if the purchase was successful
      if (response && response.data && response.data.status === "success") {
        setPurchaseSuccess(true)
        
        // Update remaining points if available in the response
        if (response.data.data && response.data.data.remainingPoints !== undefined) {
          setRemainingPoints(response.data.data.remainingPoints)
        }
        
        // Add the new purchase to the purchase history
        if (response.data.data && response.data.data.purchase) {
          const newPurchase = response.data.data.purchase
          
          // Update purchase history with the new purchase
          setPurchaseHistory(prevHistory => [
            ...prevHistory,
            {
              ...newPurchase,
              container: {
                _id: newPurchase.container
              }
            }
          ])
        } else {
          // If purchase data is not in the response, refresh purchase history from API
          refreshPurchaseHistory()
        }
      } else {
        setPurchaseError("فشل في عملية الشراء. يرجى المحاولة مرة أخرى.")
      }
    } catch (err) {
      console.error("Purchase error:", err)
      setPurchaseError(err.response?.data?.message || "حدث خطأ أثناء الشراء")
    } finally {
      setPurchaseInProgress(null)
    }
  }
  
  // Refresh purchase history from API
  const refreshPurchaseHistory = async () => {
    try {
      const dashboardResult = await getUserDashboard({
        params: {
          fields: 'userInfo,purchaseHistory',
        }
      })
      
      if (dashboardResult?.success) {
        setPurchaseHistory(dashboardResult.data.data.purchaseHistory || [])
        
        // Update remaining points if available
        if (dashboardResult.data.data.userInfo) {
          setRemainingPoints(dashboardResult.data.data.userInfo.generalPoints || 0)
        }
      }
    } catch (err) {
      console.error("Error refreshing purchase history:", err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />
  if (!courseData) return <ErrorAlert message="لم يتم العثور على الدورة" />

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Course Details */}
          <div className="lg:w-1/3 order-1 lg:order-none">
            <div className="card bg-base-100 shadow-xl sticky top-6">
              <div className="card-body">
                <h2 className="card-title justify-center text-2xl mb-4">تفاصيل الدورة</h2>
                <div className="space-y-2">
                  <DetailItem
                    icon={<FaMoneyBillWave className="text-accent" />}
                    label="السعر"
                    value={courseData?.price > 0 ? `${courseData.price} نقطة` : "مجاني"}
                  />
                  <DetailItem
                    icon={<FaGraduationCap className="text-primary" />}
                    label="المستوى"
                    value={courseData?.level?.name || "غير محدد"}
                  />
                  <DetailItem
                    icon={<FaBook className="text-secondary" />}
                    label="المادة"
                    value={courseData?.subject?.name || "غير محدد"}
                  />
                  <DetailItem
                    icon={<FaChalkboardTeacher className="text-accent" />}
                    label="حالة الشراء"
                    value={isContainerPurchased(courseId) ? "مشتراة" : "غير مشتراة"}
                  />
                  
                  {remainingPoints !== null && (
                    <DetailItem
                      icon={<FaMoneyBillWave className="text-primary" />}
                      label="النقاط المتبقية"
                      value={`${remainingPoints} نقطة`}
                    />
                  )}
                </div>
                
                <div className="card-actions mt-6">
                  {isContainerPurchased(courseId) ? (
                    <button className="btn btn-success w-full" disabled>
                      ✓ تم الشراء
                    </button>
                  ) : (
                    <>
                      {purchaseError && (
                        <div className="alert alert-error w-full mb-2">
                          <span>{purchaseError}</span>
                        </div>
                      )}
                      {purchaseSuccess && (
                        <div className="alert alert-success w-full mb-2">
                          <span>تم الشراء بنجاح!</span>
                        </div>
                      )}
                      <button
                        className={`btn btn-primary w-full ${purchaseInProgress === courseId ? 'loading' : ''}`}
                        onClick={() => handlePurchase(courseId)}
                        disabled={purchaseInProgress !== null}
                      >
                        {courseData?.price === 0 
                          ? "الحصول على الدورة مجانًا" 
                          : purchaseInProgress === courseId 
                            ? 'جاري الشراء...' 
                            : 'شراء الدورة'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-8">
            {/* Course Header */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h1 className="card-title text-2xl md:text-3xl mb-4">{courseData?.name}</h1>
                  {isContainerPurchased(courseId) && (
                    <span className="badge badge-success badge-lg">مشتراة</span>
                  )}
                </div>
                {courseData?.description && <p className="text-base-content/80">{courseData.description}</p>}
              </div>
            </div>

            {/* Objectives Section */}
            {courseData?.goal?.length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">أهداف الدورة</h2>
                  <ul className="space-y-3">
                    {courseData.goal.map((obj, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-primary">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Course Content Section */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">محتويات الدورة</h2>
                
                {/* Main container */}
                <ContainerItem 
                  container={courseData}
                  isPurchased={isContainerPurchased}
                  onPurchase={handlePurchase}
                  purchaseInProgress={purchaseInProgress}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}