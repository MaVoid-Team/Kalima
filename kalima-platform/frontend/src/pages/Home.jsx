import { ArrowRight, Clock, FileText, Users, Award } from "lucide-react"
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="w-full overflow-x-hidden p-14">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left side with image */}
            <div className="w-full md:w-1/2 relative mb-10 md:mb-0">
              <div className="relative z-10">
                <img src="/big-hero.png" alt="Teacher with books" className="mx-auto" />
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-4 border-primary opacity-70 animate-bounce"></div>
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

      {/* Second Section */}
      <section className="py-16 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse md:flex-row items-center">
            {/* Left side with text */}
            <div className="w-full md:w-1/2 text-right relative">
              <div className="absolute top-0 left-0">
                <svg width="80" height="40" viewBox="0 0 80 40" className="text-primary animate-bounce">
                  <path d="M0 20 Q 20 0, 40 20 Q 60 40, 80 20" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <h3 className="text-lg font-medium mb-2">معلومات عنا</h3>
              <h2 className="text-3xl font-bold mb-2">
                أتعلم وجيب الدرجات
                <br />
                النهائية<span className="text-primary">مجانـــا</span>
              </h2>
              <p className="mb-6 text-base-content/80">
                تتعامل كلمة مع منصة تعلم إلكتروني بشكل فعال للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي.
                إننا نقدم لك أفضل الحلول لضمان تفوقك بالطالب
              </p>

              <div className="flex flex-col gap-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm">معلمين محترفين</span>
                  <div className="w-4 h-4 rounded-full bg-base-300"></div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm">اختبارات على كل درس</span>
                  <div className="w-4 h-4 rounded-full bg-base-300"></div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm">شرح وافي للمناهج</span>
                  <div className="w-4 h-4 rounded-full bg-base-300"></div>
                </div>
              </div>

              {/* Curved arrow */}
              <div className="relative h-24 w-24 mt-4 animate-bounce">
                <svg viewBox="0 0 100 100" className="text-primary">
                  <path
                    d="M90,30 Q50,90 10,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polygon points="15,55 5,50 15,45" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Right side with image */}
            <div className="w-full md:w-1/2 mb-10 md:mb-0 relative">
              <img src="/small-hero.png" alt="Students studying" className="rounded-lg mx-auto" />

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 border-2 border-dashed border-primary"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-dashed border-primary"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 shadow-xl">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold mb-2">خدماتنا</h2>
          <h3 className="text-center text-3xl font-bold mb-12">
            هدفنا هو تبسيط المواد لضمان
            <br />
            تفوقك <span className="text-primary border-b-2 border-primary pb-1">مجانـــا</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h4 className="font-bold mb-2">متابعة الأداء</h4>
              <h5 className="text-primary font-medium mb-2">في أي وقت</h5>
              <p className="text-sm text-base-content/70">
                نقدم متابعة مستمرة لأداء الطلاب من خلال تقارير دورية توضح مستوى التقدم والنقاط التي تحتاج إلى تحسين
              </p>
            </div>

            {/* Service 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h4 className="font-bold mb-2">اختبارات ثابتة</h4>
              <h5 className="text-primary font-medium mb-2">في منصتنا</h5>
              <p className="text-sm text-base-content/70">
                نقدم اختبارات متنوعة لقياس مستوى الطلاب في كل مادة مع تصحيح فوري وشرح للإجابات الصحيحة
              </p>
            </div>

            {/* Service 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h4 className="font-bold mb-2">معلمين على</h4>
              <h5 className="text-primary font-medium mb-2">أعلى مستوى</h5>
              <p className="text-sm text-base-content/70">
                نقدم فريق من المعلمين المتميزين ذوي الخبرة في شرح المناهج الدراسية بطريقة مبسطة وممتعة
              </p>
            </div>

            {/* Service 4 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h4 className="font-bold mb-2">توفير كورسات</h4>
              <h5 className="text-primary font-medium mb-2">عالية الجودة</h5>
              <p className="text-sm text-base-content/70">
                نقدم كورسات تعليمية متكاملة تغطي جميع أجزاء المنهج مع شرح مفصل للمفاهيم الأساسية والتطبيقات العملية
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home;
