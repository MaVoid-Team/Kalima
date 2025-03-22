export function AboutSection() {
    return (
      <section className="p-8">
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
                تتعامل كلمة مع منصة تعلم إلكتروني بشكل فعال للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي. إننا
                نقدم لك أفضل الحلول لضمان تفوقك بالطالب
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
                  <path d="M90,30 Q50,90 10,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="15,55 5,50 15,45" fill="currentColor" />
                </svg>
              </div>
            </div>
  
            {/* Right side with image */}
            <div className="w-full md:w-1/2 mb-10 md:mb-0 left-5 md:left-20 relative">
              <img src="/about.png" alt="Students studying" className="rounded-lg mx-auto" />
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  