"use client"
import SectionHeader from "./SectionHeader"

function NotificationsSection() {
  const notifications = [
    { id: "new-assignment", text: "تم إضافة واجب جديد", checked: true },
    { id: "assignment-correction", text: "تم تصحيح واجبك", checked: true },
    { id: "new-lesson", text: "تم إضافة درس جديد", checked: true },
    { id: "exam-date", text: "موعد اختبار قادم", checked: true },
    { id: "notification-update", text: "تم تحديث إشعاراتك", checked: true },
    { id: "teacher-message", text: "تم إرسال رسالة من المعلم", checked: true },
    { id: "assignment-submission", text: "تم تسليم واجب من طالب", checked: true },
    { id: "student-message", text: "طالب أرسل رسالة أو استفسار", checked: true },
    { id: "grade-posted", text: "تم نشر نتائج", checked: true },
    { id: "deadline-reminder", text: "إشعار بموعد تحديد أو موعد تسليم", checked: true },
  ]

  const handleNotificationToggle = (id) => {
    // This would update the notification preferences via API
    console.log(`Toggled notification: ${id}`)
  }

  const notificationIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  )

  return (
    <div className="mb-8">
      <SectionHeader title="الإشعارات" icon={notificationIcon} />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <NotificationGroup
            title="نوع الطالب"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            }
            notifications={notifications.slice(0, 5)}
            onToggle={handleNotificationToggle}
          />

          <NotificationGroup
            title="قبل المعلم"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            }
            notifications={notifications.slice(5)}
            onToggle={handleNotificationToggle}
          />
        </div>
      </div>
    </div>
  )
}

function NotificationGroup({ title, icon, notifications, onToggle }) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-center justify-between border-b pb-2">
            <div className="form-control">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                defaultChecked={notification.checked}
                onChange={() => onToggle(notification.id)}
              />
            </div>
            <span>{notification.text}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default NotificationsSection;

