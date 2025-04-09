import { useTranslation } from "react-i18next"

export default function InstructorsList() {
  const { t } = useTranslation("dashboard")

  // Mock data for instructors
  const instructors = [
    {
      id: 1,
      name: "محمد علي",
      specialty: "متخصص في البرمجة والتطوير",
      image: "/course-1.png",
    },
    {
      id: 2,
      name: "أحمد محمود",
      specialty: "متخصص في التصميم والجرافيك",
      image: "/course-2.png",
    },
    {
      id: 3,
      name: "علي الشمري",
      specialty: "متخصص في الذكاء الاصطناعي",
      image: "/course-3.png",
    },
    {
      id: 4,
      name: "علي حسن",
      specialty: "متخصص في تطوير الويب",
      image: "/course-4.png",
    },
    {
      id: 5,
      name: "فيصل سعيد",
      specialty: "متخصص في علوم البيانات",
      image: "/course-5.png",
    },
    {
      id: 6,
      name: "ليلى علي",
      specialty: "متخصصة في تجربة المستخدم",
      image: "/course-6.png",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {instructors.map((instructor) => (
        <div key={instructor.id} className="card bg-base-100 shadow-lg hover:shadow-2xl duration-300 transition-shadow">
          <div className="card-body items-center text-center p-6">
            <div className="avatar mb-3">
              <div className="w-24 rounded-full">
                <img src={instructor.image || "/placeholder.svg"} alt={instructor.name} />
              </div>
            </div>
            <h3 className="font-bold text-lg">{instructor.name}</h3>
            <p className="text-sm text-base-content/70">{instructor.specialty}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
