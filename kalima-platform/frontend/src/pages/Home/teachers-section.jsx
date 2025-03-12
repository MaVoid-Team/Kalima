import { FileText, Clock, ChevronLeft } from "lucide-react"

export function TeachersSection() {
  const teachers = [
    {
      id: 1,
      image: "/course-1.png",
      name: "أستاذ محمد",
      subject: "كيمياء",
      experience: "خبرة 10 سنوات",
      grade: "الصف الثالث الثانوي",
      rating: 5,
    },
    {
      id: 2,
      image: "/course-2.png",
      name: "أستاذ أحمد",
      subject: "لغة إنجليزية",
      experience: "خبرة 8 سنوات",
      grade: "الصف الثاني الثانوي",
      rating: 5,
    },
    {
      id: 3,
      image: "/course-3.png",
      name: "أستاذة سارة",
      subject: "فيزياء",
      experience: "خبرة 12 سنة",
      grade: "الصف الأول الثانوي",
      rating: 5,
    },
  ]

  return (
    <section className="p-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">معلمينا</h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          شوف كل معلمين <span className="text-primary border-b-2 border-primary pb-1">منصتنا</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button className="btn btn-primary rounded-full">
            عرض المعلمين
            <ChevronLeft className="h-4 w-4 mr-2" />
          </button>
        </div>
      </div>
    </section>
  )
}

function TeacherCard({ teacher }) {
  return (
    <div className="rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl shadow-lg duration-500">
      <div className="relative">
        <img src={teacher.image || "/placeholder.svg"} alt={teacher.name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {teacher.subject}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2 text-right">{teacher.name}</h4>
        <div className="flex justify-end items-center gap-2 mb-2">
          <span className="text-sm">{teacher.experience}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mb-4">
          <span className="text-sm">{teacher.grade}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <FileText className="h-3 w-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex">
            {[...Array(teacher.rating)].map((_, i) => (
              <div key={i} className="text-warning">
                ★
              </div>
            ))}
          </div>
          <button className="btn btn-sm btn-primary rounded-full">عرض الملف</button>
        </div>
      </div>
    </div>
  )
}

