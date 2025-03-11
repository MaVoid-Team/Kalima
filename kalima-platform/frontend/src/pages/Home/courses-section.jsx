import { FileText, Users, ChevronLeft } from "lucide-react"

export function CoursesSection() {
  const courses = [
    {
      id: 1,
      image: "/course-1.png",
      title: "كيمياء عامة",
      subject: "كيمياء",
      teacher: "أستاذ محمد",
      grade: "الصف الثالث الثانوي",
      rating: 5,
    },
    {
      id: 2,
      image: "/course-2.png",
      title: "أحب أن أتعلم",
      subject: "لغة إنجليزية",
      teacher: "أستاذ أحمد",
      grade: "الصف الثاني الثانوي",
      rating: 5,
    },
    {
      id: 3,
      image: "/course-3.png",
      title: "أساسيات الفيزياء",
      subject: "فيزياء",
      teacher: "أستاذة سارة",
      grade: "الصف الأول الثانوي",
      rating: 5,
    },
  ]

  return (
    <section className="p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">كورساتنا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          شوف كل الكورسات <span className="text-primary border-b-2 border-primary pb-1">بتاعتنا</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button className="btn btn-primary rounded-full">
            عرض الكورسات
            <ChevronLeft className="h-4 w-4 mr-2" />
          </button>
        </div>
      </div>
      {/* Curved arrow */}
      <div className="relative h-24 w-24 ml-auto mt-4 animate-pulse">
        <svg viewBox="0 0 100 100" className="text-primary">
          <path d="M10,30 Q50,90 90,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <polygon points="85,55 95,50 85,45" fill="currentColor" />
        </svg>
      </div>
    </section>
  )
}

function CourseCard({ course }) {
  return (
    <div className="rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl shadow-lg duration-500">
      <div className="relative">
        <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {course.subject}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2 text-right">{course.title}</h4>
        <div className="flex justify-end items-center gap-2 mb-2">
          <span className="text-sm">{course.teacher}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <Users className="h-3 w-3" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mb-4">
          <span className="text-sm">{course.grade}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <FileText className="h-3 w-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex">
            {[...Array(course.rating)].map((_, i) => (
              <div key={i} className="text-warning">
                ★
              </div>
            ))}
          </div>
          <button className="btn btn-sm btn-primary rounded-full">تسجيل الكورس</button>
        </div>
      </div>
    </div>
  )
}

