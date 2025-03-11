import { Search, Book, ChevronDown, Star } from 'lucide-react'
import { Link } from "react-router-dom"

export default function CoursesPage() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Pattern - Positioned on the left */}
      <div className="absolute top-0 left-0 w-2/3 h-screen pointer-events-none z-0">
        <div className="relative w-full h-full">
          <img
            src="/background-courses.png"
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-top opacity-50"
            style={{ maxWidth: "600px" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Title Section - Centered */}
        <div className="container mx-auto px-4 pt-8 pb-4 text-end">
          <div className="relative inline-block">
            <p className="text-3xl font-bold text-primary md:mx-40">
              كورساتي
            </p>
                <img src="/underline.png" alt="underline" className='object-contain' />
          </div>
        </div>

        {/* Search and Filters Section - Right aligned */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <button className="btn btn-primary btn-sm rounded-md">اختيارات البحث</button>
              <Search className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl ml-auto">
            <div className="text-right">
              <p className="mb-1 text-sm">اختر مرحلتك الدراسية</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  المرحلة الدراسية
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>المرحلة الابتدائية</button>
                  </li>
                  <li>
                    <button>المرحلة الإعدادية</button>
                  </li>
                  <li>
                    <button>المرحلة الثانوية</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر الصف الدراسي</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  الصف الدراسي
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>الصف الأول</button>
                  </li>
                  <li>
                    <button>الصف الثاني</button>
                  </li>
                  <li>
                    <button>الصف الثالث</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر الترم الدراسي</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  الترم الدراسي
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>الترم الأول</button>
                  </li>
                  <li>
                    <button>الترم الثاني</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر المادة الدراسية</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  <Book className="h-4 w-4" />
                  المادة الدراسية
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>الرياضيات</button>
                  </li>
                  <li>
                    <button>العلوم</button>
                  </li>
                  <li>
                    <button>اللغة العربية</button>
                  </li>
                  <li>
                    <button>اللغة الإنجليزية</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر نوع الكورس</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  نوع الكورس
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>شرح</button>
                  </li>
                  <li>
                    <button>مراجعة</button>
                  </li>
                  <li>
                    <button>تدريبات</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-right">
              <p className="mb-1 text-sm">اختر حالة الكورس</p>
              <div className="dropdown dropdown-bottom dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  حالة الكورس
                  <ChevronDown className="h-4 w-4" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  <li>
                    <button>مجاني</button>
                  </li>
                  <li>
                    <button>مدفوع</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button className="btn btn-accent btn-md rounded-full px-8">
              <Search className="h-5 w-5 ml-2" />
              لعرض الكورسات
            </button>
          </div>
        </div>

        {/* Courses Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">اكتشف كورساتك المفضلة الآن!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course Cards */}
            {[...Array(6)].map((_, index) => (
              <CourseCard
                key={index}
                image={`/course-${index + 1}.png`}
                teacherName={`أ/معلم ${index + 1}`}
                subject="اللغة العربية"
                level="الصف الأول"
                duration={12}
                rating={4.5}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Course Card Component
function CourseCard({ image, teacherName, subject, level, duration, rating }) {
  return (
    <div className="card bg-base-100 shadow-lg overflow-hidden border border-base-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <figure className="relative h-48">
        <img src={image} alt={subject} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-base-100 p-1 rounded-md">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
          </div>
        </div>
      </figure>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-end text-right">
            <h3 className="font-bold">{teacherName}</h3>
            <p className="text-sm">
              {subject} - {level}
            </p>
          </div>
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
                <circle cx="12" cy="10" r="3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="badge badge-outline badge-sm">{duration} ساعة دراسية</div>
          <div className="flex items-center gap-1 text-right">
            <Book className="h-4 w-4" />
            <span className="text-xs">{subject}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-bold ml-1">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.floor(rating) ? "text-warning fill-warning" : "text-base-300"}`}
                />
              ))}
            </div>
          </div>
          <Link to="/course-details" className="btn btn-sm btn-outline btn-accent">
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </div>
  )
}