const RecommendedCourses = () => {
    const courses = [
      {
        id: 1,
        title: "التقييم الشامل للرياضيات",
        level: "متقدم",
        instructor: "د. أحمد محمد",
        hours: 15,
        rating: 4.8,
        students: 240,
      },
      {
        id: 2,
        title: "التقييم الشامل للعلوم",
        level: "متوسط",
        instructor: "د. سارة أحمد",
        hours: 12,
        rating: 4.6,
        students: 180,
      },
      {
        id: 3,
        title: "التقييم الشامل للغة العربية",
        level: "مبتدئ",
        instructor: "أ. محمد علي",
        hours: 10,
        rating: 4.7,
        students: 210,
      },
    ]
  
    return (
      <div>
        <h2 className="text-xl font-bold text-right mb-4">إرشاد لتقييم المهارة في المواد</h2>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="text-right">
                  <h3 className="font-bold">{course.title}</h3>
                  <p className="text-sm">{course.instructor}</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-sm">{course.level}</span>
                      <span className="text-sm font-bold">:المستوى</span>
                    </div>
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-sm">{course.hours} ساعة</span>
                      <span className="text-sm font-bold">:المدة</span>
                    </div>
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-sm">{course.students} طالب</span>
                      <span className="text-sm font-bold">:عدد الطلاب</span>
                    </div>
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-sm">{course.rating}/5</span>
                      <span className="text-sm font-bold">:التقييم</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm w-full mt-4">سجل الآن</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default RecommendedCourses
  