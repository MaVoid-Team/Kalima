"use client"

import { useState, useEffect } from "react"
import { Search, Book, ChevronDown, Star, Loader } from 'lucide-react'
import { Link } from "react-router-dom"
import { getAllSubjects, getSubjectById } from "../routes/courses"

export default function CoursesPage() {
  const [subjects, setSubjects] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState(null)

  // Filter states
  const [selectedStage, setSelectedStage] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCourseType, setSelectedCourseType] = useState("")
  const [selectedCourseStatus, setSelectedCourseStatus] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Update filtered courses whenever filters change
  useEffect(() => {
    if (subjects.length > 0) {
      applyFilters()
    }
  }, [selectedStage, selectedGrade, selectedTerm, selectedSubject, selectedCourseType, selectedCourseStatus, subjects])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const result = await getAllSubjects()

      if (result.success) {
        setSubjects(result.data)
        // Initialize filtered courses with all courses
        setFilteredCourses(generateCourseData(result.data))
      } else {
        setError("فشل في تحميل بيانات المواد الدراسية")
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  // Fetch subject details by ID
  const fetchSubjectDetails = async (subjectId) => {
    try {
      const result = await getSubjectById(subjectId)
      if (result.success) {
        setSelectedSubjectDetails(result.data)
        return result.data
      } else {
        console.error("Error fetching subject details:", result.error)
        return null
      }
    } catch (err) {
      console.error("Error in fetchSubjectDetails:", err)
      return null
    }
  }

  // Function to handle search with filters
  const handleSearch = () => {
    applyFilters()
  }

  // Apply filters to courses
  const applyFilters = () => {
    let filtered = generateCourseData(subjects)

    // Apply subject filter
    if (selectedSubject) {
      filtered = filtered.filter(course => course.subject === selectedSubject)
    }

    // Apply other filters (in a real app, these would filter based on actual data)
    if (selectedStage) {
      // This is a mock filter since we don't have stage data in the API
      filtered = filtered.filter(course => course.stage === selectedStage || !course.stage)
    }

    if (selectedGrade) {
      filtered = filtered.filter(course => course.level === selectedGrade || course.level === "الصف الأول")
    }

    if (selectedCourseType) {
      // Mock filter for course type
      filtered = filtered.filter(course => course.type === selectedCourseType || !course.type)
    }

    if (selectedCourseStatus) {
      // Mock filter for course status
      filtered = filtered.filter(course => course.status === selectedCourseStatus || !course.status)
    }

    setFilteredCourses(filtered)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedStage("")
    setSelectedGrade("")
    setSelectedTerm("")
    setSelectedSubject("")
    setSelectedCourseType("")
    setSelectedCourseStatus("")
  }

  // Generate course data based on subjects from API
  const generateCourseData = (subjectsData) => {
    if (!subjectsData || subjectsData.length === 0) return []

    // Create course cards based on the subjects we have
    return subjectsData.map((subject, index) => ({
      id: subject._id,
      image: `/course-${(index % 6) + 1}.png`, // Cycle through available images
      teacherName: `أ/معلم ${index + 1}`,
      subject: subject.name,
      subjectId: subject._id, // Store the subject ID for linking
      level: "الصف الأول", // Default value
      duration: 12 + index, // Mock duration
      rating: 4 + (index % 2) * 0.5, // Alternate between 4 and 4.5
      // Add mock data for filters
      stage: index % 3 === 0 ? "المرحلة الابتدائية" : index % 3 === 1 ? "المرحلة الإعدادية" : "المرحلة الثانوية",
      type: index % 3 === 0 ? "شرح" : index % 3 === 1 ? "مراجعة" : "تدريبات",
      status: index % 2 === 0 ? "مجاني" : "مدفوع"
    }))
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Pattern - Positioned on the left */}
      <div className="absolute top-0 left-0 w-2/3 h-screen pointer-events-none z-0">
        <div className="relative w-full h-full">
          <img
            src="/background-courses.png"
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-top opacity-50"
            style={{ maxWidth: "600px" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Title Section - Centered */}
        <div className="container mx-auto px-4 pt-8 pb-4 text-end">
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">كورساتي</p>
            <img src="/underline.png" alt="underline" className="object-contain" />
          </div>
        </div>

        {/* Search and Filters Section - Right aligned */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between mb-4">
            <button 
              className="btn btn-outline btn-sm rounded-md" 
              onClick={resetFilters}
            >
              إعادة ضبط الفلاتر
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-primary btn-sm rounded-md">اختيارات البحث</button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl ml-auto">
            <div className="text-right">
              <p className="mb-1 text-sm">اختر مرحلتك الدراسية</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  {selectedStage || "المرحلة الدراسية"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button onClick={() => setSelectedStage("المرحلة الابتدائية")}>المرحلة الابتدائية</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedStage("المرحلة الإعدادية")}>المرحلة الإعدادية</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedStage("المرحلة الثانوية")}>المرحلة الثانوية</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر الصف الدراسي</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  {selectedGrade || "الصف الدراسي"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button onClick={() => setSelectedGrade("الصف الأول")}>الصف الأول</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedGrade("الصف الثاني")}>الصف الثاني</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedGrade("الصف الثالث")}>الصف الثالث</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر الترم الدراسي</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  {selectedTerm || "الترم الدراسي"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button onClick={() => setSelectedTerm("الترم الأول")}>الترم الأول</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedTerm("الترم الثاني")}>الترم الثاني</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر المادة الدراسية</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  <Book className="h-4 w-4" />
                  {selectedSubject || "المادة الدراسية"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <li key={subject._id}>
                      <button onClick={() => setSelectedSubject(subject.name)}>{subject.name}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر نوع الكورس</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  {selectedCourseType || "نوع الكورس"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button onClick={() => setSelectedCourseType("شرح")}>شرح</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedCourseType("مراجعة")}>مراجعة</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedCourseType("تدريبات")}>تدريبات</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر حالة الكورس</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  {selectedCourseStatus || "حالة الكورس"}
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button onClick={() => setSelectedCourseStatus("مجاني")}>مجاني</button>
                  </li>
                  <li>
                    <button onClick={() => setSelectedCourseStatus("مدفوع")}>مدفوع</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button className="btn btn-accent btn-md rounded-full px-8" onClick={handleSearch}>
              <Search className="h-5 w-5 ml-2" />
              لعرض الكورسات
            </button>
          </div>
        </div>

        {/* Courses Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">اكتشف كورساتك المفضلة الآن!</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-error max-w-md mx-auto">
              <p>{error}</p>
              <button className="btn btn-sm btn-outline" onClick={fetchSubjects}>
                إعادة المحاولة
              </button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">لا توجد كورسات متاحة حالياً</p>
              {(selectedStage || selectedGrade || selectedTerm || selectedSubject || selectedCourseType || selectedCourseStatus) && (
                <button className="btn btn-outline btn-sm mt-4" onClick={resetFilters}>
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  image={course.image}
                  teacherName={course.teacherName}
                  subject={course.subject}
                  subjectId={course.subjectId}
                  level={course.level}
                  duration={course.duration}
                  rating={course.rating}
                  fetchSubjectDetails={fetchSubjectDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Course Card Component
function CourseCard({ id, image, teacherName, subject, subjectId, level, duration, rating, fetchSubjectDetails }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleViewDetails = async () => {
    setIsLoading(true)
    try {
      // Pre-fetch subject details before navigating to the details page
      await fetchSubjectDetails(subjectId)
    } catch (error) {
      console.error("Error pre-fetching subject details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg overflow-hidden border border-base-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <figure className="relative h-48">
        <img src={image || "/placeholder.svg"} alt={subject} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-base-100 p-1 rounded-md">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
          </div>
        </div>
      </figure>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-end text-right">
            <h3 className="font-bold">{teacherName}</h3>
            <p className="text-sm">
              {subject} - {level}
            </p>
          </div>
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
                <circle cx="12" cy="10" r="3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="badge badge-outline badge-sm">{duration} ساعة دراسية</div>
          <div className="flex items-center gap-1 text-right">
            <Book className="h-4 w-4" />
            <span className="text-xs">{subject}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-bold ml-1">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.floor(rating) ? "text-warning fill-warning" : "text-base-300"}`}
                />
              ))}
            </div>
          </div>
          <Link 
            to={`/course-details/${subjectId}`} 
            className="btn btn-sm btn-outline btn-accent"
            onClick={handleViewDetails}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "عرض التفاصيل"
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}