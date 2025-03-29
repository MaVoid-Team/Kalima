import { useTranslation } from 'react-i18next';
import { Book, Star, User } from "lucide-react";
import { Link } from "react-router-dom";

export function CourseCard({ id, image, teacherName, subject, subjectId, level, duration, rating }) {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`card bg-base-100 shadow-lg overflow-hidden border border-base-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
      <figure className="relative h-48">
        <img src={image || "/placeholder.svg"} alt={subject} className="w-full h-full object-cover" />
        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} bg-base-100 p-1 rounded-md`}>
          <div className="flex gap-1">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="w-3 h-3 bg-primary"></div>
            ))}
          </div>
        </div>
      </figure>
      <div className="card-body p-4">
        <div className={`flex ${isRTL ? 'flex-row' : 'flex-row-reverse'} justify-between items-start`}>
          <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} `} dir='rtl'>
            <h3 className="font-bold">{teacherName}</h3>
            <p className="text-sm">
              {subject} - {level}
            </p>
          </div>
          <div className='flex items-center bg-base-200 p-1 rounded-full'>
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className={`flex ${isRTL ? 'flex-row' : 'flex-row-reverse'} justify-between items-center mt-2`}>
          <div className="badge badge-outline badge-sm">
           {duration} {t('courses.duration')} 
          </div>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Book className="h-4 w-4" />
            <span className="text-xs">{subject}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className={`flex  justify-between items-center`}>
          <div className="flex items-center">
            <span className={`text-sm font-bold ${isRTL ? 'ml-1' : 'mr-1'}`}>
              {rating}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.floor(rating) ? "text-warning fill-warning" : "text-base-300"}`}
                />
              ))}
            </div>
          </div>
          <Link to={`/courses/${id}`} className="btn btn-sm btn-outline btn-accent">
            {t('courses.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
}