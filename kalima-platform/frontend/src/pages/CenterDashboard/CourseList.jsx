import CourseCard from "./CourseCard"

const CourseList = ({ filters }) => {
  // This would typically come from an API
  const courses = [
    {
      id: 1,
      subject: "الرياضيات",
      session: "٢",
      type: "محاضرة",
      room: "١٥٧",
      time: "١١:٠٠ - ٩:٣٠",
      teacher: {
        name: "أ/ عماد عبدالعزيز",
        email: "Keegan_Mraz@gmail.com",
        group: "المجموعة ١٢٢",
      },
    },
    {
      id: 2,
      subject: "العلوم",
      session: "٣",
      type: "محاضرة",
      room: "٤٥",
      time: "١٢:٣٠ - ١١:٣٠",
      teacher: {
        name: "أ/ إيهاب سعيد",
        email: "Olaf_Hegmann40@hotmail.com",
        group: "المجموعة ١٠٢",
      },
    },
    {
      id: 3,
      subject: "الفلسفة",
      session: "٤",
      type: "مراجعة",
      room: "١٠٠",
      time: "١٠:٥ - ١٢:٣٠",
      teacher: {
        name: "أ/ علي حسن",
        email: "Bennett_Nolan@gmail.com",
        group: "المجموعة ١٤٠",
      },
    },
    {
      id: 4,
      subject: "مراجعة إضافية",
      session: "٥",
      type: "مراجعة",
      room: "١٨٥",
      time: "١٢:٤٥ - ١٠:١٥",
      teacher: {
        name: "أ/ مالك حسام",
        email: "Felipe_Rohan@gmail.com",
        group: "المجموعة ١٦٠",
      },
    },
  ]

  // Apply filters if any
  let filteredCourses = [...courses]
  if (filters.teacher) {
    filteredCourses = filteredCourses.filter((course) => course.teacher.name.includes(filters.teacher))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="badge badge-outline">المواد: {filteredCourses.length}</div>
        <h2 className="text-xl font-bold text-right">المواد الدراسية والمقررات</h2>
      </div>

      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}

export default CourseList
