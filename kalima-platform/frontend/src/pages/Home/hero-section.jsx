import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import TeacherCounter from "../../components/teacher-counter"

export function HeroSection() {
  return (
<section className="relative overflow-hidden py-8">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-center">
      {/* Left side with image */} 
      <div className="w-full md:w-1/2 relative mb-10 md:mb-0 flex justify-center">
        <div className="relative z-10 w-full h-full flex justify-center items-center">
          {/* Background decorative elements */}
          <img src="/waves.png" alt="" className="absolute top-0 left-[0%] xl:left-[22%] lg:left-[0%] md:left-[-3%] sm:left-[0%]  w-16 md:w-32 sm:w-24 h-auto z-0" />
          <img src="/ball.png" alt="" className="absolute bottom-[7%]  left-[0%]  lg:bottom-[0%] md:bottom-[0%] sm:bottom-96 xl:left-[20%] lg:left-[2%] md:left-[-2%] sm:left-[-9%] w-8 md:w-16 h-auto z-0" />
          <img src="/ring.png" alt="" className="absolute top-[1%] lg:top-[-4%] md:top-[-6%] sm:top-[0%] right-[0%] xl:right-[20%] lg:right-[0%] md:right-[0%] sm:right-[25%] w-12 md:w-24 sm:w-16 h-auto z-0" />
          <img src="/rDots.png" alt="" className="absolute top-[21%] left-[5%] xl:left-[24%] lg:left-[8%] md:left-[0%] sm:left-[25%] w-16 md:w-28 sm:w-24 h-auto z-0" />
          <img src="/bDots.png" alt="" className="absolute bottom-[19%] lg:bottom-[15%] md:bottom-[15%] sm:bottom-[20%] right-[-9%] xl:right-[20%] lg:right-[6%] md:right-[-5%] sm:right-[23%] w-16 md:w-28 sm:w-24 h-auto z-0" />

          {/* Main person image */}
          <img src="/person.png" alt="Teacher with books" className="relative mx-auto w-64   md:w-80  h-auto z-10" />
        </div>

        {/* Teacher counter positioned at bottom left */}
        <div className="absolute bottom-0 left-5 md:left-10 z-20 ">
          <TeacherCounter />
        </div>
      </div>

      {/* Right side with text */}
      <div className="w-full md:w-1/3 text-center md:text-right md:ml-auto">
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

