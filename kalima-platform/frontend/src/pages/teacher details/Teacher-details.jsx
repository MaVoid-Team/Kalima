import React from 'react';
import { FileText, Clock, Star } from 'lucide-react';

// Separate component for the teacher information header
const TeacherInfoHeader = () => (
  <div className="w-full flex flex-col items-center py-32 -z-10 absolute top-0">
    <div className="flex items-center gap-x-2">
      <img className="h-1 mt-4" src="/Line 5.png" alt="" />
      <h1 className="text-center text-2xl font-bold text-primary ">معلومات المعلم</h1>
    </div>
    <img className="h-auto mt-16 sm:mr-56 mr-60 md:mr-0" src="/vector 21.png" alt="" />
  </div>
);

// Separate component for the rating display
const RatingDisplay = ({ rating }) => (
  <div className="border-[1px rounded-lg flex flex-col">
    <div className="text-center">
      <h1 className="font-bold">التقيم:4.0{rating}</h1>
    </div>
    <div className="rating">
      {[...Array(4)].map((_, i) => (
        <input 
          key={i}
          className="mask mask-star-2 bg-warning" 
          aria-label={`${i+1} star`} 
        />
      ))}
    </div>
  </div>
);

// Separate component for section headers
const SectionHeader = ({ title }) => (
  <div className="flex justify-center">
    <img className="h-1 mt-4 mr-2" src="/Line 5.png" alt="" />
    <h1 className="text-center text-2xl font-bold text-primary ">{title}</h1>
  </div>
);

// Course card component - Reduced size
const CourseCard = ({ course }) => (
  <div className="rounded-lg overflow-hidden border-2 border-warning  bg-slate-50 z-10 hover:scale-105 hover:shadow-xl shadow-lg duration-500 max-w-md relative">
    <div className="relative">
      <img
        src={course.image || "/placeholder.svg"}
        alt={course.title}
        className="w-full h-36 object-cover" // Reduced height
      />
      {/* <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
        {course.subject}
      </div> */}
      {/* Added image at the left side */}
      <div className="absolute left-2 bottom-[-70px]">
        <img src="/Frame 81.png" alt="" className="h-13 w-13" />
      </div> <div className="absolute right-24 bottom-[-33px]">
        <img src="/teacher.png" alt="" className="h-13 w-13" />
      </div>  
    </div>
    <div className="p-3"> {/* Reduced padding */}
      <h4 className="font-bold text-md mb-1 text-right">{course.title} </h4> {/* Smaller text */}
      <h5 className='  text-right text-sm'> {course.subject}-{course.class}</h5>
      <div className="flex justify-end">
  <div className="flex items-start justify-evenly gap-1 mb-2 bg-[#E0F5F5] rounded-xl w-36 text-right mt-2">
    <h4 className="text-xs text-right">{course.grade}</h4>
    <div className="w-5 h-5 rounded-full bg-transparent flex items-start justify-evenly">
      <img src="/school.png" alt="" />
    </div>
  </div>
</div>
 
      <div className="flex justify-end items-center gap-1 mb-1"> {/* Reduced gaps and margins */}
        <span className="text-xs"> المدة: {course.duration} <span>ساعة تدريبية</span></span> {/* Smaller text */}
        <div className="w-5 h-5 rounded-full bg-base-200 flex items-center justify-center"> {/* Smaller icon container */}
          <Clock className="h-2.5 w-2.5" /> {/* Smaller icon */}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button className="btn btn-md btn-primary rounded-full text-xs"> {/* Smaller button */}
          عرض التفاصيل
        </button>
        <div className="flex">
        <RatingDisplay/>
        </div>
      </div>
    </div>
  </div>
);

// Social media icons component
const SocialMediaIcons = () => (
  <div className="flex flex-row gap-x-2 mt-9 justify-start ml-8 size-80">
    {[76, 77, 78, 79].map((num) => (
      <div key={num}>
        <img src={`/Frame ${num}.png`} alt={`Social media ${num}`} />
      </div>
    ))}
  </div>
);

// Teacher profile image component with decorations
const TeacherProfileImage = () => (
  <div className="indicator">
    <img className="indicator-item indicator-top indicator-start badge ml-14 bg-transparent border-transparent h-[240px] w-[170px] mt-[20px]" src="/rDots.png" alt="" />
    <img className="indicator-item indicator-top indicator-center badge bg-transparent border-transparent h-[60px] w-[130px] mt-[-110px]" src="/waves.png" alt="" />
    <img className="indicator-item indicator-top indicator-end badge bg-transparent border-transparent h-[120px] w-[100px] mt-[-10px] ml-40" src="/ring.png" alt="" />
    <img className="h-[80px] w-[80px] indicator-item indicator-bottom indicator-start badge bg-transparent border-transparent" src="/ball.png" alt="" />
    <img className="indicator-item indicator-bottom indicator-end mr-16 bg-transparent border-transparent h-[240px] w-[170px] mb-[100px] z-0" src="/bDots.png" alt="" />
    
    <div className="relative z-10 grid h-[300px] w-[300px] place-items-center">
      <img className="h-full w-full" src="/Ellipse 103.png" alt="" />
    </div>
  </div>
);

export default function TeacherDetails() {
  const courses = [
    {
      id: 1,
      image: "/course-1.png",
      class:"الثاني",
      subject: "كيمياء",
      title: "أستاذ محمد",
      grade: "الصف الثالث الثانوي",
      rating: 5,
      duration: 12,
    },
    {
      id: 2,
      image: "/course-2.png",
     class:"الثاني",
      subject: "لغة إنجليزية",
      title: "أستاذ أحمد",
      grade: "الصف الثاني الثانوي",
      rating: 5,
      duration: 10,
    },
    {
      id: 3,
      image: "/course-3.png",
      class:"الثاني",
      subject: "فيزياء",
      title: "أستاذة سارة",
      grade: "الصف الأول الثانوي",
      rating: 5,
      duration: 15,
    },
  ];
  
  return (
    <section className="overflow-hidden py-40">
      <TeacherInfoHeader />
      
      <div className="container mx-auto lg:px-32 sm:px-16 px-16 sm:py-52 py-56 md:py-32 lg:py-0">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side with image */}
          <div className="w-full md:w-1/2 relative  sm:mb-0">
            <div className="relative z-10 w-full h-full">
              <TeacherProfileImage />
              <SocialMediaIcons />
            </div>
          </div>
          
          {/* Right side with text */}
          <div className="w-full md:w-1/2 text-right md:ml-auto lg:mb-72 mb-0 sm:mb-0 ">
            <h2 className="text-xl font-bold text-primary mb-2">/استاذ</h2>
            <h1 className="text-4xl font-bold mb-2">محمد عبدالله</h1>
            
            <div className="flex flex-row justify-end gap-x-3 mt-4 mb-4">
              <RatingDisplay  />
              <div>
                <h3 className="font-bold">مادة الرياضيات</h3>
              </div>
            </div>
            
            <div className="flex justify-end">
              <img className="h-1 mt-4 mr-2" src="/Line 5.png" alt="" />
              <h1 className="text-center text-2xl font-bold text-primary mb-5">السيرة الذاتية</h1>
            </div>
            <div className="flex justify-end">

            <p className="font-semibold text-xl sm:w-56 w-64 md:w-60 lg:w-auto">
              "أعزائي الطلاب، يسعدني أن أقدم لكم نفسي، أستاذ الرياضيات محمد عبدالله. أنا هنا لأكون مرشدكم في عالم الأرقام والمعادلات. أمتلك خبرة واسعة في تدريس الرياضيات وأحرص دائمًا على تبسيط المفاهيم المعقدة بحيث تكون سهلة الفهم. أنا شغوف بتعليمكم وتطوير مهاراتكم، وأعدكم بأنني سأبذل قصارى جهدي لمساعدتكم على فهم المادة بشكل عميق وتطبيقها في حياتكم اليومية. أنا هنا لدعمكم وتوجيهكم نحو النجاح والتفوق."
            </p>
            </div>
            
          </div>
        </div>
      </div>
      
      <div >
        <SectionHeader title="كورسات المعلم" />
        <div className="flex justify-start ml-28">
          <img src="vector22.png" alt="" />
        </div>
      </div>
      <div className="relative">
  {/* Background dots positioned absolutely */}
  <img className="absolute top-0 right-16 z-0 opacity-100 h-[240px] w-[170px]" src="/bDots.png" alt="" />
  <img className="absolute top-1/3 left-16 z-0 opacity-100 h-[240px] w-[170px]" src="/bDots.png" alt="" />
  

  {/* Card grid with higher z-index to appear above the dots */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto px-4 max-w-6xl">
    {courses.map(course => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
</div>
    </section>
  );
}