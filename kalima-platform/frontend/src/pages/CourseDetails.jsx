"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
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

const PlanItem = ({ lesson, time }) => (
  <li className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
    <div className="flex items-center gap-3">
      <FaStickyNote className="text-primary" />
      <span className="font-medium">{lesson}</span>
    </div>
    <span className="badge badge-neutral">{time} دقيقة</span>
  </li>
)

const PlanSection = ({ month, items }) => (
  <div className="collapse collapse-plus bg-base-100 mb-2">
    <input type="checkbox" defaultChecked />
    <div className="collapse-title text-lg font-bold flex items-center gap-2">
      <FaCalendarAlt className="text-secondary" />
      {month}
    </div>
    <div className="collapse-content">
      <ul className="menu">
        {items.map((item, index) => (
          <PlanItem key={index} lesson={item.lesson} time={item.time} />
        ))}
      </ul>
    </div>
  </div>
)

const LectureItem = ({ lecture }) => (
  <li className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
    <div className="flex items-center gap-3">
      <span className="font-medium">{lecture.name}</span>
    </div>
  </li>
)

const LectureSection = ({ month, lectures }) => (
  <div className="collapse collapse-plus bg-base-100 mb-2">
    <input type="checkbox" defaultChecked />
    <div className="collapse-title text-lg font-bold flex items-center gap-2">
      <FaCalendarAlt className="text-secondary" />
      {month}
    </div>
    <div className="collapse-content">
      {lectures.length > 0 ? (
        <ul className="menu">
          {lectures.map((lecture) => (
            <LectureItem key={lecture.id} lecture={lecture} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-base-content/70 py-4">لا توجد محاضرات متاحة لهذا الشهر</p>
      )}
    </div>
  </div>
)

export default function CourseDetails() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [lectures, setLectures] = useState({})
  const [loading, setLoading] = useState(true)
  const [lecturesLoading, setLecturesLoading] = useState(false)
  const [error, setError] = useState("")
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseResult, dashboardResult] = await Promise.all([
          getContainerById(courseId),
          getUserDashboard()
        ])

        if (courseResult?.status === "success") {
          setCourse(courseResult.data)
        }

        if (dashboardResult?.success) {
          setPurchaseHistory(dashboardResult.data.data.purchaseHistory || [])
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  const isPurchased = useMemo(() => {
    return purchaseHistory.some(purchase => 
      purchase.type === 'containerPurchase' &&
      purchase.container?._id === courseId
    )
  }, [purchaseHistory, courseId])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await getContainerById(courseId)
        console.log("fetched course:", result);
        
        if (result?.status === "success") {
          setCourse(result.data)
          // After getting course data, fetch lectures for each child container
          if (result.data.children && result.data.children.length > 0) {
            await fetchLectures(result.data.children)
          }
        } else {
          setError("فشل في جلب بيانات الدورة")
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const fetchLectures = async (children) => {
    setLecturesLoading(true)
    const lecturesByMonth = {}

    try {
      // Process each month container
      for (const child of children) {
        const monthResult = await getContainerById(child.id)

        if (monthResult?.status === "success" && monthResult.data) {
          // Store lectures by month name
          lecturesByMonth[monthResult.data.name] = monthResult.data.children || []
        }
      }

      setLectures(lecturesByMonth)
    } catch (err) {
      console.error("Error fetching lectures:", err)
      // We don't set the main error here to still show the course details
    } finally {
      setLecturesLoading(false)
    }
  }

   const handlePurchase = async () => {
    setPurchaseLoading(true)
    setPurchaseError("")
    
    try {
      const result = await purchaseContainer(courseId)
      if (result?.status === "success") {
        // Refresh both course and purchase history
        const [updatedCourse, dashboardResult] = await Promise.all([
          getContainerById(courseId),
          getUserDashboard()
        ])
        
        setCourse(updatedCourse.data)
        setPurchaseHistory(dashboardResult.data.data.purchaseHistory || [])
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.message || "حدث خطأ أثناء الاشتراك")
    } finally {
      setPurchaseLoading(false)
    }
  }
  const detailsBox = useMemo(
    () => (
      <div className="card bg-base-100 shadow-xl sticky top-6">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">تفاصيل الكورس</h2>
          <div className="space-y-2">
            <DetailItem
              icon={<FaMoneyBillWave className="text-accent" />}
              label="حالة الشراء"
              value={isPurchased ? "مشتراة" : "غير مشتراة"}
            />
            {/* ... other detail items ... */}
          </div>
          <div className="card-actions mt-6">
            {isPurchased ? (
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
                <button
                  className={`btn btn-primary w-full ${purchaseLoading ? 'loading' : ''}`}
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                >
                  {course?.price === 0 ? "الحصول على الدورة مجانًا" : purchaseLoading ? 'جاري الاشتراك...' : 'اشترك الآن'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    [isPurchased, course, purchaseLoading, purchaseError]
  )

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Course Details - shown first on mobile */}
          <div className="lg:w-1/3 order-1 lg:order-none">{detailsBox}</div>

          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-8">
            {/* Course Header */}
            <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h1 className="card-title text-2xl md:text-3xl mb-4">{course?.name}</h1>
                {course?.isPurchased && (
                  <span className="badge badge-success badge-lg">مشتراة</span>
                )}
              </div>
              {course?.description && <p className="text-base-content/80">{course.description}</p>}
            </div>
          </div>

            {/* Objectives Section */}
            {course?.objectives?.length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">أهداف الدورة</h2>
                  <ul className="space-y-3">
                    {course.objectives.map((obj, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-primary">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Lectures Section */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">محاضرات الدورة</h2>

                {lecturesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : course?.isPurchased ? (
                <div className="space-y-4">
                  {Object.entries(lectures).map(([month, monthLectures]) => (
                    <LectureSection key={month} month={month} lectures={monthLectures} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/70">
                  {course?.price > 0 
                    ? "يرجى شراء الدورة لمشاهدة المحاضرات"
                    : "سجّل الدخول للوصول إلى المحاضرات"}
                </div>
)}
              </div>
            </div>

            {/* Plan Section */}
            {course?.plan?.length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">خطة الدورة</h2>
                  <div className="space-y-4">
                    {course.plan.map((monthPlan, index) => (
                      <PlanSection key={index} month={monthPlan.month} items={monthPlan.items} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}