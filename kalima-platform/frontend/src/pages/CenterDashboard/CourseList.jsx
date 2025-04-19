import { useTranslation } from "react-i18next";
import CourseCard from "./CourseCard";

const CourseList = ({ filters }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  // This would typically come from an API
  const courses = [
    {
      id: 1,
      subject: isRTL ? "الرياضيات" : "Mathematics",
      session: isRTL ? "٢" : "2",
      type: isRTL ? "محاضرة" : "Lecture",
      room: isRTL ? "١٥٧" : "157",
      time: isRTL ? "١١:٠٠ - ٩:٣٠" : "9:30 - 11:00",
      teacher: {
        name: isRTL ? "أ/ عماد عبدالعزيز" : "Mr. Emad Abdulaziz",
        email: "Keegan_Mraz@gmail.com",
        group: isRTL ? "المجموعة ١٢٢" : "Group 122",
      },
    },
    {
      id: 2,
      subject: isRTL ? "العلوم" : "Science",
      session: isRTL ? "٣" : "3",
      type: isRTL ? "محاضرة" : "Lecture",
      room: isRTL ? "٤٥" : "45",
      time: isRTL ? "١٢:٣٠ - ١١:٣٠" : "11:30 - 12:30",
      teacher: {
        name: isRTL ? "أ/ إيهاب سعيد" : "Mr. Ehab Said",
        email: "Olaf_Hegmann40@hotmail.com",
        group: isRTL ? "المجموعة ١٠٢" : "Group 102",
      },
    },
    {
      id: 3,
      subject: isRTL ? "الفلسفة" : "Philosophy",
      session: isRTL ? "٤" : "4",
      type: isRTL ? "مراجعة" : "Review",
      room: isRTL ? "١٠٠" : "100",
      time: isRTL ? "١٠:٥ - ١٢:٣٠" : "10:05 - 12:30",
      teacher: {
        name: isRTL ? "أ/ علي حسن" : "Mr. Ali Hassan",
        email: "Bennett_Nolan@gmail.com",
        group: isRTL ? "المجموعة ١٤٠" : "Group 140",
      },
    },
    {
      id: 4,
      subject: isRTL ? "مراجعة إضافية" : "Extra Review",
      session: isRTL ? "٥" : "5",
      type: isRTL ? "مراجعة" : "Review",
      room: isRTL ? "١٨٥" : "185",
      time: isRTL ? "١٢:٤٥ - ١٠:١٥" : "10:15 - 12:45",
      teacher: {
        name: isRTL ? "أ/ مالك حسام" : "Mr. Malek Hossam",
        email: "Felipe_Rohan@gmail.com",
        group: isRTL ? "المجموعة ١٦٠" : "Group 160",
      },
    },
  ];

  // Apply filters if any
  let filteredCourses = [...courses];
  if (filters.teacher) {
    filteredCourses = filteredCourses.filter((course) =>
      course.teacher.name.includes(filters.teacher)
    );
  }

  return (
    <div dir={dir}>
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-base-content text-right">
        {isRTL
          ? "المواد الدراسية والمقررات"
          : "Academic Subjects and Courses"}
      </h2>
        <div className="badge badge-outline border-base-300 text-base-content">
          {isRTL ? "المواد" : "Courses"}: {filteredCourses.length}
        </div>
      </div>

      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} isRTL={isRTL} />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
