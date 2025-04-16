import { Users } from 'lucide-react'

const CourseCard = ({ course }) => {
  return (
    <div className="relative bg-base-200 rounded-3xl mb-4 overflow-hidden">
      {/* Teal accent on the right side */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary"></div>
      
      <div className="flex flex-col md:flex-row justify-between p-4">
        {/* Left side - Teacher info */}
        <div className="text-right md:text-left">
          <h3 className="font-medium text-lg">{course.teacher.name}</h3>
          <p className="text-sm text-base-content/70">{course.teacher.email}</p>
          <div className="flex items-center mt-2">
            <span className="text-sm">{course.teacher.group}</span>
            <Users className="w-4 h-4 mr-1" />
          </div>
        </div>
        
        {/* Right side - Course info */}
        <div className="text-right mt-4 md:mt-0">
          <div className="flex items-center justify-end">
            <h3 className="font-medium text-lg">{course.subject}</h3>
            <span className="badge">{`الحصة ${course.session}`}</span>
          </div>
          <p className="text-sm text-base-content/70">{course.type}</p>
          <p className="text-sm font-medium mt-1 text-base-content/80">{course.time}</p>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
