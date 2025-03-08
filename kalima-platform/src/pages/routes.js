import { Link, useNavigate } from "react-router-dom"

// Wavy line SVG component
const WavyLine = ({ className }) => (
    <svg viewBox="0 0 100 20" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0,10 C30,20 70,0 100,10" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M0,15 C30,25 70,5 100,15" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M0,5 C30,15 70,-5 100,5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
  
  function CivilcoLanding() {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen bg-[#f5fbfc] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 z-0">
          <div className="w-40 h-40 rounded-full bg-teal-600 translate-x-1/4 -translate-y-1/4"></div>
          <div className="w-60 h-60 rounded-full bg-teal-100/70 -translate-y-1/2 -translate-x-1/4"></div>
        </div>
  
        {/* Decorative wavy line */}
        <div className="absolute top-40 left-10 z-0">
          <WavyLine className="text-teal-500 w-40" />
        </div>
  
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-12 mt-8">
            <img src="/logo.png" alt="CIVILCO Logo" className="h-16 object-contain" />
          </div>
  
          {/* Main content */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">
              <span className="text-teal-500">كلمة</span> مرحبا بك في منصة
            </h1>
  
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto" dir="rtl">
              منصة كلمة هي منصة تعليم إلكتروني. توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي.
            </p>
  
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-800">من انت ؟</h2>
  
            {/* Role selection cards */}
            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Background wavy lines */}
              <div className="absolute inset-0 -z-10">
                <svg className="w-full h-full" viewBox="0 0 800 400">
                  <path
                    d="M0,100 C150,200 350,0 500,100 C650,200 750,100 800,150"
                    fill="none"
                    stroke="#e0f7f7"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,150 C150,250 350,50 500,150 C650,250 750,150 800,200"
                    fill="none"
                    stroke="#e0f7f7"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,200 C150,300 350,100 500,200 C650,300 750,200 800,250"
                    fill="none"
                    stroke="#e0f7f7"
                    strokeWidth="2"
                  />
                </svg>
              </div>
  
              {/* Teacher card */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-sm mx-auto">
                  <img src="/teacher.png" alt="Teacher illustration" className="mx-auto mb-4 w-full max-w-[200px]" />
                </div>
                <button
                  onClick={() => console.log("Teacher selected")}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors"
                >
                  معلم
                </button>
              </div>
  
              {/* Student card */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-sm mx-auto">
                  <img src="/student.png" alt="Student illustration" className="mx-auto mb-4 w-full max-w-[200px]" />
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors"
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
  
  export default CivilcoLanding
  
  