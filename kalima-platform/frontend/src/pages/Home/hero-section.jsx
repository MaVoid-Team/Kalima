import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import TeacherCounter from "../../components/teacher-counter"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side with image */}
          <div className="w-full md:w-1/3 relative mb-10 md:mb-0">
            <div className="relative z-10 w-full h-full">
              
              <img src="/hero.png" alt="Teacher with books" className="relative mx-auto w-full h-auto z-10" />
            </div>

            {/* Teacher counter positioned at bottom left */}
            <div className="absolute bottom-0 right-10 z-20 ">
              <TeacherCounter />
            </div>
          </div>

          {/* Right side with text */}
          <div className="w-full md:w-1/3 text-right md:ml-auto">
            <h2 className="text-xl font-bold text-primary mb-2">اقصر طريق نحو النجاح الباهر</h2>
            <h1 className="text-4xl font-bold mb-2">
              مرحبا بك في منصة <span className="text-primary">كلمـــة</span>
            </h1>
            <p className="mb-6 text-base-content/80 text-lg">
              منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب
              <br />
              من الصف الرابع الابتدائي حتى الصف الثالث الثانوي.
            </p>

            <Link to="/landing">
              <button className="btn btn-lg bg-primary hover:bg-accent rounded-full">
                تسجيل الدخول
                <ArrowLeft className="h-5 w-5 ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

