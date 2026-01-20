"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import SectionHeader from "./SectionHeader"

function LanguageAppearanceSection() {
  const { t, i18n } = useTranslation("settings");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const isRTL = i18n.language === "ar";
  useEffect(() => {
    const savedLang = localStorage.getItem("lng") || "ar";
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.removeAttribute("data-theme");
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem("lng", lng)
    setIsLangOpen(false)
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr"
  }

  return (
    <div className="mb-8">
      <SectionHeader title={t("languageAppearance.title")} />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("languageAppearance.title")}
          </h3>

          <div className="form-control mb-6">
            <label className={`label ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="label-text">{t("languageAppearance.options.language")}</span>
            </label>
            <div className="flex justify-end ">
              <select
                className="select select-bordered min-w-40 px-8"
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value)}
              >
                <option value="ar">{t("languageAppearance.languages.ar")}  🇸🇦</option>
                <option value="en">{t("languageAppearance.languages.en")}  🇺🇸</option>
              </select>
            </div>
          </div>

          <div className="my-6">
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-4`}>
              <label className={`label ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <span className="label-text">{t("languageAppearance.options.theme")}</span>
              </label>
              <button 
                className="btn btn-sm btn-ghost text-lg"
                onClick={() => setShowThemes(!showThemes)}
              >
                {showThemes ? t("languageAppearance.hideThemes") : t("languageAppearance.showThemes")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform ${showThemes ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {showThemes && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme}
                    theme={theme}
                    onSelect={handleThemeSelect}
                    isSelected={selectedTheme === theme}
                    isRTL={isRTL}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 

function ThemeCard({ theme, onSelect, isSelected, isRTL }) {
  const { t } = useTranslation("settings")
  
  return (
    <div className={`card border ${isSelected ? "border-primary" : "border-base-300"}`} data-theme={theme}>
      <div className="card-body p-4">
        <div className="flex gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary" />
          <div className="w-8 h-8 rounded-full bg-secondary" />
          <div className="w-8 h-8 rounded-full bg-accent" />
          <div className="w-8 h-8 rounded-full bg-neutral" />
        </div>
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
          <button
            className={`btn btn-sm ${isSelected ? "btn-secondary" : "btn-primary"}`}
            onClick={() => onSelect(theme)}
          >
            {isSelected ? t("languageAppearance.theme.selected") : t("languageAppearance.theme.select")}
          </button>
          <span className="capitalize">{theme}</span>
        </div>
      </div>
    </div>
  )
}

export default LanguageAppearanceSection