import React, {  useMemo } from "react";

const TestimonialsSection = React.memo(({ isRTL = false }) => {
  const testimonials = useMemo(
    () => ({
      en: [
        {
          text: "The learning experience on Kelma platform was excellent by all standards! I loved how the content was organized, presented gradually and smoothly, making learning enjoyable and easy to understand. The progress tracking system is also great.",
          name: "Sarah Ali",
          role: "Student",
          rating: 5,
          image: "/servicesherosection2.png",
        },
        {
          text: "The platform offers very useful educational content, and lessons are explained in a clear and simple way, making understanding easier. I liked the variety of available materials, but I hope more interactive options will be added.",
          name: "Omar Ahmed",
          role: "Teacher",
          rating: 4,
          image: "/servicesherosection2.png",
        },
        {
          text: "I loved learning through Kelma! The videos are of high quality, and the instructors are knowledgeable with valuable information that helps develop skills effectively. What I liked most was the ability to download needed documents.",
          name: "Aseel Safwan",
          role: "Designer",
          rating: 5,
          image: "/servicesherosection2.png",
        },
        {
          text: "The platform provides a unique learning experience with comprehensive content and excellent instructors. The interface is user-friendly and the community features are very helpful.",
          name: "Mohammed Khalid",
          role: "Developer",
          rating: 4,
          image: "/servicesherosection2.png",
        },
      ],
      ar: [
        {
          text: "تجربة التعلم على منصة كلمة كانت رائعة بكل المقاييس! أحبيت طريقة تنظيم المحتوى حيث يتم تقديم المعلومات بشكل تدريجي وسلس، مما يجعل التعلم ممتعاً ويسهل الفهم. أيضاً نظام متابعة التقدم رائع جداً.",
          name: "سارة علي",
          role: "طالبة",
          rating: 5,
          image: "/servicesherosection2.png",
        },
        {
          text: "المنصة تقدم محتوى تعليمي مفيد جداً، والدروس يتم شرحها بأسلوب واضح وسهل، مما يجعل الفهم أسهل. أعجبني التنوع في المواد التعليمية المتاحة، ولكن آمل أن يتم إضافة المزيد من الخيارات التفاعلية.",
          name: "عمر أحمد",
          role: "مدرس",
          rating: 4,
          image: "/servicesherosection2.png",
        },
        {
          text: "أحبيت التعلم عبر كلمة! الفيديوهات ذات جودة عالية، والمدرسون مليئون بالمعلومات القيمة التي تساعد في تطوير المهارات بشكل فعال. أكثر شيء أعجبني هو إمكانية تحميل المستندات المطلوبة.",
          name: "أصيل صفوان",
          role: "مصممة",
          rating: 5,
          image: "/servicesherosection2.png",
        },
        {
          text: "توفر المنصة تجربة تعلم فريدة مع محتوى شامل ومدرسين ممتازين. الواجهة سهلة الاستخدام وميزات المجتمع مفيدة جداً.",
          name: "محمد خالد",
          role: "مطور",
          rating: 4,
          image: "/servicesherosection2.png",
        },
      ],
    }),
    []
  );

  const lang = isRTL ? "ar" : "en";
  const data = testimonials[lang];

  return (
    <section
      className={`py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? "font-arabic" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-8 ${
            isRTL ? "text-right" : "text-left"
          } text-primary`}
        >
          {isRTL ? "آراء العملاء" : "Customer Testimonials"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((testimonial, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
            >
              <div className="card-body p-6 flex flex-col">
                <p
                  className={`text-base-content/80 mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  } text-sm sm:text-base`}
                >
                  {testimonial.text}
                </p>
                <div className="mt-auto">
                  <div
                    className={`flex items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-gray-300">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div
                      className={isRTL ? "ml-3 text-right" : "ml-3 text-left"}
                    >
                      <h4 className="font-medium text-base-content">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-base-content/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-3 flex ${
                      isRTL ? "justify-end" : "justify-start"
                    }`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < testimonial.rating
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
})
export default TestimonialsSection;