import { ArrowRight } from 'lucide-react'
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden md:p-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side with image */}
          <div className="w-full md:w-1/2 relative mb-10 md:mb-0">
            <div className="relative z-10">
              <img src="/big-hero.png" alt="Teacher with books" className="mx-auto" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-4 border-primary opacity-70 animate-bounce transition-all"></div>
            <div className="absolute bottom-20 left-0 w-8 h-8 rounded-full bg-warning animate-bounce"></div>
            <div className="absolute top-0 left-0 animate-bounce">
              <svg width="80" height="40" viewBox="0 0 80 40" className="text-primary">
                <path d="M0 20 Q 20 0, 40 20 Q 60 40, 80 20" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-10">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">10+</span>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-base-200 border-2 border-base-100"></div>
                  <div className="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100"></div>
                  <div className="w-6 h-6 rounded-full bg-base-200 border-2 border-base-100"></div>
                </div>
              </div>
              <div className="text-xs font-medium">معلمين</div>
            </div>

            {/* Dotted pattern */}
            <div className="absolute top-1/4 left-0 grid grid-cols-5 gap-1">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-error"></div>
              ))}
            </div>
          </div>

          {/* Right side with text */}
          <div className="w-full md:w-1/2 text-right">
            <h2 className="text-xl font-bold text-primary mb-2">اقصر طريق نحو النجاح الباهر</h2>
            <h1 className="text-3xl font-bold mb-2">
              مرحبا بك في منصة <span className="text-primary">كلمـــة</span>
            </h1>
            <p className="mb-6 text-base-content/80">
              منصة كلمة هي منصة تعليم إلكتروني توفر المتعة مواكبة الطلاب من الصف الرابع الابتدائي حتى الصف الثالث
              الثانوي
            </p>
            <Link to="/landing">
              <button className="btn btn-primary rounded-full">
                تسجيل الدخول
                <ArrowRight className="h-4 w-4 mr-2" />
              </button>
            </Link>

            {/* Curved arrow */}
            <div className="relative h-24 w-24 ml-auto mt-4 animate-pulse">
              <svg viewBox="0 0 100 100" className="text-primary">
                <path
                  d="M10,30 Q50,90 90,50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polygon points="85,55 95,50 85,45" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
