import { useTranslation } from "react-i18next"

export function AppDownloadSection() {
  const { t, i18n } = useTranslation("home")
  const isRTL = i18n.language === "ar"

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-12">
      <section
        className="border-primary border-2 rounded-full w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            {/* Image Section - Order changes based on RTL */}
            <div className={`flex justify-center ${isRTL ? "md:order-1" : "md:order-2"}`}>
              <div className="relative">
                <img
                  src="/qr-code.png"
                  alt="Mobile App"
                  className="h-60 sm:h-70 md:h-80 object-contain hover:scale-110 transition-all duration-500"
                />
                <div
                  className={`absolute -top-4 ${isRTL ? "-right-4" : "-left-4"} w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 border-2 border-dashed border-primary rounded-full`}
                ></div>
                <div
                  className={`absolute -bottom-4 ${isRTL ? "-left-4" : "-right-4"} w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 border-2 border-dashed border-primary rounded-full`}
                ></div>
              </div>
            </div>

            {/* Text Content - Order changes based on RTL */}
            <div className={`${isRTL ? "text-right md:order-2" : "text-left md:order-1"}`}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
                {t("appDownload.title")}
                <span className="text-primary"> {t("appDownload.now")}</span>
              </h2>
              <p className="mb-4 sm:mb-6 text-base-content/80 text-lg sm:text-xl md:text-2xl">
                {t("appDownload.content1")}
                <span className="text-primary"> {t("appDownload.now")}</span> {t("appDownload.content2")}
                <span className="text-primary"> {t("appDownload.everywhere")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Curved Arrow - Responsive positioning */}
        <div className="relative mt-4 flex">
          <div className={`h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 ${isRTL ? "ml-auto" : "mr-auto"} animate-pulse`}>
            <img
              src="curved-arrow-services.png"
              alt="curved-arrow"
              className={`transform ${isRTL ? "" : "scale-x-[-1]"} translate-y-8 sm:translate-y-16 md:translate-y-24 ${isRTL ? "-translate-x-1/4" : "translate-x-1/4"}`}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

