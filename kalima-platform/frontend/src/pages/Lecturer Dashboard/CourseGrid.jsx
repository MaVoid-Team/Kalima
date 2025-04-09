import { useTranslation } from "react-i18next"
import { User, Calendar, BookOpen, Star, Heart } from 'lucide-react'

export default function CourseGrid() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  
  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: "أكمل مهارتك",
      instructor: "أحمد عبدالله",
      category: "تصميم الجرافيك",
      level: "متوسط",
      image: "/course-1.png",
      isFavorite: false
    },
    {
      id: 2,
      title: "أساسيات التعلم",
      instructor: "أسامة أحمد",
      category: "تصميم الويب",
      level: "مبتدئ",
      image: "/course-2.png",
      isFavorite: true
    },
    {
      id: 3,
      title: "أحمد عبدالله",
      instructor: "محمد علي",
      category: "البرمجة",
      level: "متقدم",
      image: "/course-3.png",
      isFavorite: false
    },
    // Duplicate the first 3 courses to fill the grid
    {
      id: 4,
      title: "أكمل مهارتك",
      instructor: "أحمد عبدالله",
      category: "تصميم الجرافيك",
      level: "متوسط",
      image: "/course-4.png",
      isFavorite: false
    },
    {
      id: 5,
      title: "أساسيات التعلم",
      instructor: "أسامة أحمد",
      category: "تصميم الويب",
      level: "مبتدئ",
      image: "/course-5.png",
      isFavorite: true
    },
    {
      id: 6,
      title: "أحمد عبدالله",
      instructor: "محمد علي",
      category: "البرمجة",
      level: "متقدم",
      image: "/course-6.png",
      isFavorite: false
    },
    // Add more courses as needed
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="card bg-base-100 shadow-lg hover:shadow-2xl duration-300 transition-shadow">
          <figure className="relative">
            <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
            <button className="absolute top-2 right-2 btn btn-circle btn-sm bg-base-100/80">
              <Heart className={`h-4 w-4 ${course.isFavorite ? 'fill-primary text-primary' : 'text-base-content/70'}`} />
            </button>
          </figure>
          <div className="card-body p-4">
            <h3 className="card-title text-lg font-bold">{course.title}</h3>
            
            <div className="flex items-center gap-2 text-sm text-base-content/70 mt-2">
              <User className="h-4 w-4" />
              <span>{course.instructor}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.category}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
              <Star className="h-4 w-4" />
              <span>{course.level}</span>
            </div>
            
            <div className="card-actions justify-end mt-3">
              <button className="btn btn-sm btn-ghost">{t("view")}</button>
              <button className="btn btn-sm btn-ghost">{t("edit")}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
