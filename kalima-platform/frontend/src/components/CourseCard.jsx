import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const CourseCard = ({
  image,
  title,
  subject,
  teacher,
  teacherRole,
  grade,
  rating,
  type,
  status,
  price,
  childrenCount,
  isRTL,
}) => {
  const { t, i18n } = useTranslation('home')

  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ))

  const formatPrice = () => {
    if (typeof price !== 'number') return t('priceUnavailable') 
    if (price === 0) return t('free')
    const formattedNumber = price.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')
    return i18n.language === 'ar'
      ? `${formattedNumber} ${t('currency')}`
      : `${t('currency')} ${formattedNumber}`
  }
  

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all h-full" dir={isRTL ? "rtl" : "ltr"}>
      <figure className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
        {status && (
          <div className="absolute top-2 right-2">
            <div className={`badge ${status === 'free' ? "badge-success !text-white" : "badge-secondary"}`}>
              {status === 'free' ? t('free') : t('paid')}
            </div>
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title || t('titleFallback')}</h2>
        <div className="flex flex-wrap gap-2 mt-1">
          {subject && <div className="badge badge-primary">{subject}</div>}
          {grade && <div className="badge badge-secondary">{grade}</div>}
          {type && <div className="badge badge-outline">{type}</div>}
        </div>
        
        <div className="flex items-center mt-2">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-8">
              <span>{teacher?.[0] || '?'}</span>
            </div>
          </div>
          <div className={isRTL ? 'mr-2' : 'ml-2'}>
            <p className="text-sm font-medium">{teacher || t('teacherFallback')}</p>
            <p className="text-xs text-gray-500">{teacherRole || t('roleFallback')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex">{stars}</div>
          <div className={`text-lg font-bold ${price === 0 ? 'text-green-500' : ''}`}>
            {formatPrice()}
          </div>
        </div>

        {childrenCount > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {t('lessonsCount', { count: childrenCount })}
          </div>
        )}
      </div>
    </div>
  )
}