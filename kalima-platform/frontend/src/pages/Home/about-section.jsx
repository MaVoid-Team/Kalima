export function AboutSection() {
    return (
      <section className="p-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse md:flex-row items-center">
            {/* Left side with text */}
            <div className="w-full md:w-1/2 text-right relative">
              <div className="absolute top-0 left-12">
                <img src="waves.png" alt="waves" className="w-20 h-20 object-cover animate-float-zigzag text-primary" />
              </div>
  
              <h3 className="text-lg font-medium mb-2">معلومات عنا</h3>
              <h2 className="text-3xl font-bold mb-2">
                أتعلم وجيب الدرجات
                <br />
                النهائية<span className="text-primary border-b-4 border-primary">معانا</span>
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
              <div className="relative h-24 w-24 mt-4 animate-pulse">
                <img src="curved-arrow-about.png" alt="curved arrow"></img>
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
  
  