"use client"

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react"
import { Clock, Loader } from "lucide-react"
import { useParams } from "react-router-dom"
import { getUserById } from "../../routes/fetch-users" // Import from our API services file

// Separate component for the teacher information header
const TeacherInfoHeader = () => {
  const { t, i18n } = useTranslation("teacherDetails");
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="w-full flex flex-col items-center py-32 -z-10 absolute top-0">
      <div className="flex items-center gap-x-2">
        <img className="h-1 mt-4" src="/Line 5.png" alt="" />
        <h1 className="text-center text-2xl font-bold text-primary">
          {t('teacherInfo')}
        </h1>
      </div>
      <img className="h-auto mt-16 sm:mr-56 mr-60 md:mr-0" src="/vector 21.png" alt="" />
    </div>
  )
}

// Separate component for the rating display
const RatingDisplay = ({ rating = 4 }) => {
  const { t } = useTranslation("teacherDetails");
  
  return (
    <div className="border-[1px] rounded-lg flex flex-col">
      <div className="text-center">
        <h1 className="font-bold">{t('rating')} { rating }</h1>
      </div>
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <input
            key={i}
            type="radio"
            name="rating"
            className="mask mask-star-2 bg-warning"
            checked={i < rating}
            readOnly
            aria-label={`${i + 1} star`}
          />
        ))}
      </div>
    </div>
  )
}

const SectionHeader = ({ titleKey }) => {
  const { t } = useTranslation("teacherDetails");
  
  return (
    <div className="flex justify-center">
      <img className="h-1 mt-4 mr-2" src="/Line 5.png" alt="" />
      <h1 className="text-center text-2xl font-bold text-primary">
        {t(titleKey)}
      </h1>
    </div>
  )
}
// Course card component - Reduced size
const CourseCard = ({ course }) => {
  const { t, i18n } = useTranslation("teacherDetails");
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`rounded-lg overflow-hidden border-2 border-warning bg-slate-50 z-10 hover:scale-105 hover:shadow-xl shadow-lg duration-500 max-w-md relative ${isRTL ? 'text-right' : 'text-left'}`}>
    <div className="relative">
      <img
        src={course.image || "/placeholder.svg"}
        alt={course.title}
        className="w-full h-36 object-cover" // Reduced height
      />
      {/* Added image at the left side */}
      <div className="absolute left-2 bottom-[-70px]">
        <img src="/Frame 81.png" alt="" className="h-13 w-13" />
      </div>
      <div className="absolute right-24 bottom-[-33px]">
        <img src="/teacher.png" alt="" className="h-13 w-13" />
      </div>
    </div>
    <div className="p-3 text-right">
        <h4 className="font-bold text-md mb-1">{course.title}</h4>
        <h5 className="text-sm">
          {course.subject}-{course.class}
        </h5>
        <div className="flex justify-end">
          <div className="flex items-start justify-evenly gap-1 mb-2 bg-[#E0F5F5] rounded-xl w-36 mt-2">
            <h4 className="text-xs">{course.grade}</h4>
            <div className="w-5 h-5 rounded-full bg-transparent flex items-start justify-evenly">
              <img src="/school.png" alt="" />
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-1 mb-1">
          <span className="text-xs">
        {t('duration')} : {course.duration}    
          </span>
          <div className="w-5 h-5 rounded-full bg-base-200 flex items-center justify-center">
            <Clock className="h-2.5 w-2.5" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button className="btn btn-md btn-primary rounded-full text-xs">
            {t('viewDetails')}
          </button>
          <div className="flex">
            <RatingDisplay rating={course.rating} />
          </div>
        </div>
      </div>
    </div>
  )
}
// Social media icons component
const SocialMediaIcons = () => (
  <div className="flex flex-row gap-x-2 mt-9 justify-start ml-8 size-80">
    {[76, 77, 78, 79].map((num) => (
      <div key={num}>
        <img src={`/Frame ${num}.png`} alt={`Social media ${num}`} />
      </div>
    ))}
  </div>
)

// Teacher profile image component with decorations
const TeacherProfileImage = () => (
  <div className="indicator">
    <img
      className="indicator-item indicator-top indicator-start animate-float-up-dottedball  badge  bg-transparent border-transparent h-[240px] w-[170px] mt-[-160px] floating ml-[-40px]"
      src="/rDots.png"
      alt=""
    />
    <img
      className="indicator-item indicator-top indicator-center animate-float-zigzag badge bg-transparent border-transparent h-[60px] w-[130px] mt-[-140px]"
      src="/waves.png"
      alt=""
    />
    <img
      className="indicator-item indicator-top indicator-end badge animate-float-up-dottedball bg-transparent border-transparent h-[140px] w-[120px] mt-[-130px] mr-[-55px]"
      src="/ring.png"
      alt=""
    />
    <img
      className="h-[80px] w-[80px] indicator-item indicator-bottom indicator-start animate-float-down-dottedball badge bg-transparent border-transparent ml-[-30px] mb-[-110px]"
      src="/ball.png"
      alt=""
    />
    <img
      className="indicator-item indicator-bottom indicator-end mr-[-50px] bg-transparent animate-float-down-dottedball border-transparent h-[240px] w-[170px] mb-[-20px] z-0"
      src="/bDots.png"
      alt=""
    />

    <div className="relative z-10 grid h-[300px] w-[300px] place-items-center">
      <img className="h-full w-full" src="/Ellipse 103.png" alt="" />
    </div>
  </div>
)

export default function TeacherDetails() {
  const { t, i18n } = useTranslation("teacherDetails");
  const isRTL = i18n.language === 'ar';
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { userId } = useParams()

  // Fetch teacher data using the imported getUserById function
  useEffect(() => {
    const fetchTeacherData = async () => {
      // Check if userId exists before making the API call
      if (!userId) {
        setError(t('error.invalid_user_id'));
        setLoading(false);
        return;
      }
  
      setLoading(true);
      try {
        console.log("Fetching teacher with ID:", userId);
        
        const result = await getUserById(userId);
        
        console.log("API Response:", result);
        
        if (result.success && result.data) {
          setTeacher(result.data);
        } else {
          setError(result.error || t('error.failed'));
        }
      } catch (err) {
        console.error("Error in component:", err);
        setError(t('error.failed'));
      } finally {
        setLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [userId, t]);

  // Sample courses data - this would ideally come from an API as well
  const courses = [
    {
      id: 1,
      image: "/course-1.png",
      class: "الثاني",
      subject: "كيمياء",
      title: "أستاذ محمد",
      grade: "الصف الثالث الثانوي",
      rating: 5,
      duration: 12,
    },
    {
      id: 2,
      image: "/course-2.png",
      class: "الثاني",
      subject: "لغة إنجليزية",
      title: "أستاذ أحمد",
      grade: "الصف الثاني الثانوي",
      rating: 5,
      duration: 10,
    },
    {
      id: 3,
      image: "/course-3.png",
      class: "الثاني",
      subject: "فيزياء",
      title: "أستاذة سارة",
      grade: "الصف الأول الثانوي",
      rating: 5,
      duration: 15,
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className={isRTL ? 'mr-2' : 'ml-2'}>
          {t('error.loading')}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="alert alert-warning">
          <p>{t('error.notFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="overflow-hidden py-40" dir={isRTL ? 'ltr' : 'rtl'}>
      <TeacherInfoHeader />
      <div className="container mx-auto lg:px-32 sm:px-16 px-16 sm:py-52 py-56 md:py-32 lg:py-0">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side with image */}
          <div className="w-full md:w-1/2 relative sm:mb-0">
            <div className="relative z-10 w-full h-full">
              <TeacherProfileImage />
              <SocialMediaIcons />
            </div>
          </div>

          {/* Right side with text */}
          <div className={`w-full md:w-1/2 ${isRTL ? 'text-right' : 'text-left'} md:ml-auto lg:mb-72 mb-0 sm:mb-0`}>
            <h2 className="text-xl font-bold text-primary mb-2">/{teacher.role}</h2>
            <h1 className="text-4xl font-bold mb-2">{teacher.name}</h1>

            <div className="flex flex-row justify-end gap-x-3 mt-4 mb-4">
              <RatingDisplay />
              <div>
                <h3 className="font-bold">
                  {t('subject')} {teacher.expertise}
                </h3>
              </div>
            </div>

            <div className="flex justify-end">
              <img className="h-1 mt-4 mr-2" src="/Line 5.png" alt="" />
              <h1 className="text-center text-2xl font-bold text-primary mb-5">
                {t('bioHeader')}
              </h1>
            </div>
            <div className="flex justify-end">
              <p className="font-semibold text-xl sm:w-56 w-64 md:w-60 lg:w-auto">
                {teacher.bio || t('bioTemplate', {
                  name: teacher.name,
                  expertise: teacher.expertise || t('defaultSubject')
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader titleKey="coursesHeader" />
        <div className="flex justify-start ml-28">
          <img src="/vector22.png" alt="" />
        </div>
      </div>
      <div className="relative">
        {/* Background dots positioned absolutely */}
        <img className="absolute top-0 animate-float-up-dottedball right-16 z-0 opacity-100 h-[240px] w-[170px]" src="/bDots.png" alt="" />
        <img className="absolute top-1/3 animate-float-up-dottedball left-16 z-0 opacity-100 h-[240px] w-[170px]" src="/bDots.png" alt="" />

        {/* Card grid with higher z-index to appear above the dots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto px-4 max-w-6xl">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}