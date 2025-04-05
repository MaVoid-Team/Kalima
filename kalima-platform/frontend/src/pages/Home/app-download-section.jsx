import { useTranslation } from 'react-i18next';

export function AppDownloadSection() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';

  return (
    <section className="border-primary border-2 rounded-full md:w-3/4 w-full mx-auto md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 md:grid-cols-2 items-center gap-8 ${isRTL ? '' : 'md:direction-reverse'}`}>
          {/* Image Section */}
          <div className={`flex justify-center ${isRTL ? 'md:order-1' : 'md:order-2'}`}>
            <div className="relative">
              <img 
                src="/qr-code.png" 
                alt="Mobile App" 
                className="h-80 object-contain hover:scale-125 transition-all duration-500" 
              />
              <div className={`absolute -top-4 ${isRTL ? '-right-4' : '-left-4'} w-12 h-12 border-2 border-dashed border-primary rounded-full`}></div>
              <div className={`absolute -bottom-4 ${isRTL ? '-left-4' : '-right-4'} w-12 h-12 border-2 border-dashed border-primary rounded-full`}></div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className={`${isRTL ? 'text-right md:order-2' : 'text-left md:order-1'}`}>
            <h2 className="text-4xl font-bold mb-4">
              {t("appDownload.title")}
              <span className="text-primary">{t("appDownload.now")}</span>
             
            </h2>
            <p className="mb-6 text-base-content/80 text-2xl">
              {t("appDownload.content1")} 
                <span className="text-primary">{t("appDownload.now")}</span> {t("appDownload.content2")}
                 <span className="text-primary">{t("appDownload.everywhere")}</span>
              
            </p>
          </div>
        </div>
      </div>
      
      {/* Curved Arrow */}
      <div className={`relative h-24 w-24 ${isRTL ? 'ml-auto' : 'mr-auto'} mt-4 animate-pulse`}>
        <img 
          src="curved-arrow-services.png" 
          alt="curved-arrow" 
          className={`translate-y-32 ${isRTL ? '-translate-x-1/2' : 'translate-x-1/2'} ${!isRTL ? 'scale-x-[-1]' : ''}`}
        />
      </div>
    </section>
  )
}