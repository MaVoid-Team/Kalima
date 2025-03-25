"use client"

import { ChevronLeft, Loader } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { CourseCard } from "../../components/CourseCard" // Import the CourseCard component
import { getAllSubjects } from "../../routes/courses" // Import the API function

export function CoursesSection() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fake data for courses
  const fakeCourses = [
    {
      id: 1,
      image: "/course-1.png",
      title: "كيمياء عامة",
      subject: "كيمياء",
      teacher: "أستاذ محمد",
      grade: "الصف الثالث الثانوي",
      rating: 5,
      duration: 12, // Added duration
    },
    {
      id: 2,
      image: "/course-2.png",
      title: "أحب أن أتعلم",
      subject: "لغة إنجليزية",
      teacher: "أستاذ أحمد",
      grade: "الصف الثاني الثانوي",
      rating: 5,
      duration: 10, // Added duration
    },
    {
      id: 3,
      image: "/course-3.png",
      title: "أساسيات الفيزياء",
      subject: "فيزياء",
      teacher: "أستاذة سارة",
      grade: "الصف الأول الثانوي",
      rating: 5,
      duration: 15, // Added duration
    },
  ]

  // Fetch courses from the API
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllSubjects() // Call the API
      if (result.success && result.data?.data?.subjects?.length > 0) {
        // If data is available, use it
        const subjectsData = result.data.data.subjects
        setCourses(
          subjectsData.map((subject, index) => {
            // Determine grade based on subject's level if available
            let grade = "الصف الأول" // Default value
            if (subject.level && subject.level.length > 0) {
              const levelName = subject.level[0].name
              if (levelName === "Primary") {
                grade = "الصف الأول الابتدائي"
              } else if (levelName === "Middle") {
                grade = "الصف الأول الإعدادي"
              } else if (levelName === "Upper Primary") {
                grade = "الصف الرابع الابتدائي"
              }
            }

            return {
              id: subject._id,
              image: `/course-${(index % 6) + 1}.png`, // Cycle through available images
              title: subject.name,
              subject: subject.name,
              teacher: `أستاذ ${subject.name}`,
              grade: grade,
              rating: 4 + (index % 2) * 0.5, // Alternate between 4 and 4.5
              duration: 12 + index, // Mock duration
            }
          }),
        )
      } else {
        // If no data is available, use fake data
        setCourses(fakeCourses)
      }
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("حدث خطأ أثناء تحميل البيانات")
      // If there's an error, use fake data
      setCourses(fakeCourses)
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies, so it won't recreate on re-renders

  useEffect(() => {
    fetchCourses() // Fetch data on component mount
  }, [fetchCourses]) // fetchCourses is memoized, so this won't cause unnecessary re-fetches

  // Mock function for fetchSubjectDetails (since it's not provided)
  const fetchSubjectDetails = async (subjectId) => {
    console.log("Fetching subject details for:", subjectId)
  }

  return (
    <section className="md:p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">كورساتنا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          شوف كل الكورسات <span className="text-primary border-b-2 border-primary pb-1">بتاعتنا</span>
        </h3>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchCourses}>
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link href={`/courses/${course.id}`} passHref>
                      <CourseCard
                        id={course.id}
                        image={course.image}
                        teacherName={course.teacher}
                        subject={course.subject}
                        subjectId={course.id} // Using course.id as subjectId for now
                        level={course.grade}
                        duration={course.duration}
                        rating={course.rating}
                        fetchSubjectDetails={fetchSubjectDetails} // Pass the mock function
                      />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/courses" passHref>
                <button className="btn btn-primary rounded-full">
                  عرض الكورسات
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

