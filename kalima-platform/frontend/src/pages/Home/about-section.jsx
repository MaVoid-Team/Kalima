import { useTranslation } from 'react-i18next';

export function AboutSection() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';

  return (
    <section className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col-reverse md:flex-row items-center ${isRTL ? '' : 'md:flex-row-reverse'}`}>
          {/* Text Content */}
          <div className={`w-full md:w-1/2 relative ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
            <div className={`absolute ${isRTL ? 'left-12' : 'right-12'} top-0`}>
              <img 
                src="waves.png" 
                alt="waves" 
                className="w-20 h-20 object-cover animate-float-zigzag text-primary" 
              />
            </div>

            <h3 className="text-lg font-medium mb-2">{t("about.title")}</h3>
            <h2 className="text-3xl font-bold mb-2">
              {t("about.heading")} 
              <span className="text-primary border-b-4 border-primary">
                {isRTL ? "معانا" : "With Us"}
              </span>
            </h2>
            <p className="mb-6 text-base-content/80">
              {t("about.description")}
            </p>

            <div className={`flex flex-col gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {['teachers', 'tests', 'curriculum'].map((feature) => (
                <div key={feature} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className="text-sm">{t(`about.features.${feature}`)}</span>
                  <div className="w-4 h-4 rounded-full bg-base-300"></div>
                </div>
              ))}
            </div>

            {/* Curved arrow */}
            <div className={`relative h-24 w-24 mt-4 animate-pulse ${isRTL ? '' : 'scale-x-[-1]'}`}>
              <img 
                src="curved-arrow-about.png" 
                alt="curved arrow"
                className={isRTL ? '' : 'rotate-180'}
              />
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0 relative">
            <img 
              src="/about.png" 
              alt="Students studying" 
              className="rounded-lg mx-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  )
}