import { Star } from "lucide-react"

export const CourseCard = ({
  image,
  title,
  subject,
  teacher,
  teacherRole,
  grade,
  rating,
  type,
  price,
  childrenCount,
  isRTL,
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ))

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all h-full">
      <figure className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
        {/* Removed status badge as it's not in container data */}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="flex flex-wrap gap-2 mt-1">
          <div className="badge badge-primary">{subject}</div>
          <div className="badge badge-secondary">{grade}</div>
          <div className="badge badge-outline">{type}</div>
        </div>
        
        <div className="flex items-center mt-2">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-8">
              <span>{teacher?.[0] || '?'}</span>
            </div>
          </div>
          <div className={isRTL ? 'mr-2' : 'ml-2'}>
            <p className="text-sm font-medium">{teacher || 'معلّم غير معروف'}</p>
            <p className="text-xs text-gray-500">{teacherRole || 'محاضر'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex">{stars}</div>
          {price > 0 ? (
            <div className="text-lg font-bold">{price.toLocaleString()} جنيه</div>
          ) : (
            <div className="text-lg font-bold text-green-600">مجاني</div>
          )}
        </div>

        {childrenCount > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            يحتوي على {childrenCount} {type === 'lecture' ? 'مادة' : 'محتوى فرعي'}
          </div>
        )}
      </div>
    </div>
  )
}