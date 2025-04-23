const ActivityTracker = () => {
    const activities = [
      {
        id: 1,
        student: "أحمد محمد",
        avatar: "/placeholder.svg?height=40&width=40",
        course: "الرياضيات",
        activity: "أكمل الاختبار",
        score: "90/100",
        date: "15 دقيقة",
        status: "مكتمل",
      },
      {
        id: 2,
        student: "سارة أحمد",
        avatar: "/placeholder.svg?height=40&width=40",
        course: "العلوم",
        activity: "سلم الواجب",
        score: "45/50",
        date: "ساعة",
        status: "مكتمل",
      },
      {
        id: 3,
        student: "محمد علي",
        avatar: "/placeholder.svg?height=40&width=40",
        course: "اللغة العربية",
        activity: "حضر المحاضرة",
        score: "-",
        date: "ساعتين",
        status: "حاضر",
      },
      {
        id: 4,
        student: "نورا حسن",
        avatar: "/placeholder.svg?height=40&width=40",
        course: "الفيزياء",
        activity: "غائب عن الاختبار",
        score: "0/100",
        date: "يوم",
        status: "غائب",
      },
    ]
  
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-sm btn-outline">عرض الكل</button>
          <h2 className="text-xl font-bold text-right">النشاط الأخير</h2>
        </div>
  
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-right">الحالة</th>
                <th className="text-right">الدرجة</th>
                <th className="text-right">منذ</th>
                <th className="text-right">النشاط</th>
                <th className="text-right">المادة</th>
                <th className="text-right">الطالب</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <span
                      className={`badge ${
                        activity.status === "مكتمل"
                          ? "badge-success"
                          : activity.status === "حاضر"
                            ? "badge-info"
                            : "badge-error"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td>{activity.score}</td>
                  <td>{activity.date}</td>
                  <td>{activity.activity}</td>
                  <td>{activity.course}</td>
                  <td className="flex items-center gap-2">
                    <span>{activity.student}</span>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img src={activity.avatar || "/placeholder.svg"} alt={activity.student} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
  export default ActivityTracker
  