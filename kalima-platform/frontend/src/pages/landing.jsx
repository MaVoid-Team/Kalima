"use client"
import { useNavigate } from "react-router-dom" // Assuming you're using React Router
// Wavy line SVG component with improved design
const WavyLine = ({ className }) => (
  <svg viewBox="0 0 100 20" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M0,10 C30,20 70,0 100,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M0,15 C30,25 70,5 100,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M0,5 C30,15 70,-5 100,5" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

// Curved line background component
const CurvedLineBackground = () => (
  <svg className="w-full h-full absolute inset-0 -z-10" viewBox="0 0 1000 600" preserveAspectRatio="none">
    <path d="M0,300 C200,100 400,500 600,300 C800,100 900,200 1000,250" fill="none" stroke="#e0f7f7" strokeWidth="2" />
    <path d="M0,350 C200,150 400,550 600,350 C800,150 900,250 1000,300" fill="none" stroke="#e0f7f7" strokeWidth="2" />
    <path d="M0,400 C200,200 400,600 600,400 C800,200 900,300 1000,350" fill="none" stroke="#e0f7f7" strokeWidth="2" />
  </svg>
)

// Arrow component
const Arrow = () => (
  <svg className="w-20 h-20 text-teal-600" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M20,80 C40,60 30,40 10,30 L15,25 C40,38 50,60 30,85 Z" fill="currentColor" />
  </svg>
)

function CivilcoLanding() {
  const navigate = useNavigate()

  const handleTeacherClick = () => {
    console.log("Teacher selected")
    navigate('/teacher-register');
  }

  const handleStudentClick = () => {
    console.log("Student selected")
    navigate('/register');
  }

  return (
    <div className="min-h-screen bg-[#f5fbfc] relative overflow-hidden">
     
      {/* Decorative circles - adjusted to match design */}
      <div className="absolute top-0 right-0 z-0">
        <div className="w-48 h-48 rounded-full bg-[#009688] opacity-90 translate-x-1/4 -translate-y-1/4"></div>
        <div className="w-72 h-72 rounded-full bg-[#b2dfdb] opacity-70 -translate-y-1/2 -translate-x-1/4"></div>
      </div>

      {/* Additional decorative circle */}
      <div className="absolute bottom-20 right-10 z-0">
        <div className="w-64 h-64 rounded-full bg-[#b2dfdb] opacity-40"></div>
      </div>

      {/* Decorative wavy line */}
      <div className="absolute top-40 left-10 z-0">
        <WavyLine className="text-[#009688] w-40" />
      </div>

      {/* Arrow decoration */}
      <div className="absolute bottom-20 left-10 z-0">
        <Arrow />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-12 mt-8">
          <img
            src="civilco_logo.png"
            alt="CIVILCO Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight" dir="rtl">
            مرحبا بك في منصة{" "}
            <span className="text-[#009688] relative">
              كلمة
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#009688] rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto" dir="rtl">
            منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي.
          </p>

          {/* Decorative wavy line */}
          <div className="flex justify-center mb-8">
            <WavyLine className="text-[#009688] w-40" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-800" dir="rtl">
            من انت ؟
          </h2>

          {/* Role selection cards with curved background */}
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Background curved lines */}
            <CurvedLineBackground />

            {/* Teacher card */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg shadow-md p-9 mb-6 w-full max-w-sm mx-auto">
                <img
                  src="teacher_illustration.png"
                  alt="Teacher illustration"
                  className="mx-auto mb-4 w-full max-w-[200px]"
                />
              </div>
              <button
                onClick={handleTeacherClick}
                className="bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 px-8 rounded-md text-lg transition-colors"
              >
                معلم
              </button>
            </div>

            {/* Student card */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-sm mx-auto">
                <img
                  src="student_illustration.png"
                  alt="Student illustration"
                  className="mx-auto mb-4 w-full max-w-[200px]"
                />
              </div>
              <button
                onClick={handleStudentClick}
                className="bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 px-8 rounded-md text-lg transition-colors"
              >
                طالب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CivilcoLanding;

