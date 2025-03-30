"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import SectionHeader from "./SectionHeader"

function LanguageAppearanceSection() {
  const { t, i18n } = useTranslation("settings")
  const [selectedTheme, setSelectedTheme] = useState("light")
  const [isLangOpen, setIsLangOpen] = useState(false)
  const isRTL = i18n.language === 'ar'

  const themes = [
   
    { name: "cyberpunk", colors: ["#0f172a", "#67e8f9", "#c084fc", "#fb7185"] },
    { name: "dark", colors: ["#6d28d9", "#ec4899", "#14b8a6", "#1e293b"] },
    { name: "light", colors: ["#6d28d9", "#ec4899", "#14b8a6", "#1e293b"] },
    { name: "retro", colors: ["#f87171", "#a7f3d0", "#fcd34d", "#92400e"] },
    { name: "synthwave", colors: ["#ec4899", "#38bdf8", "#facc15", "#1e1b4b"] },
    { name: "bumblebee", colors: ["#facc15", "#fb923c", "#22d3ee", "#1e293b"] },
    { name: "emerald", colors: ["#34d399", "#3b82f6", "#fb923c", "#1e293b"] },
    { name: "corporate", colors: ["#4f46e5", "#64748b", "#10b981", "#0f172a"] },
    { name: "cupcake", colors: ["#22d3ee", "#f9a8d4", "#f59e0b", "#1e1b4b"] },
  ]

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    const savedLang = localStorage.getItem("lng") || "ar"
    setSelectedTheme(savedTheme)
    i18n.changeLanguage(savedLang)
    document.documentElement.setAttribute("data-theme", savedTheme)
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr"
  }, [i18n])

  const handleThemeSelect = (themeName) => {
    setSelectedTheme(themeName)
    localStorage.setItem("theme", themeName)
    document.documentElement.setAttribute("data-theme", themeName)
  }

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
            <div className={`flex justify-end`}>
              <div className={`dropdown ${isLangOpen ? "dropdown-open" : ""}`}>
                <div 
                  tabIndex={0}
                  role="button"
                  className={`btn m-1 min-w-40 justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
                  onClick={() => setIsLangOpen(!isLangOpen)}
                >
                  <span>{t(`languageAppearance.languages.${i18n.language}`)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <ul className={`dropdown-bottom z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 ${isLangOpen ? "block" : "hidden"}`}>
                  <li>
                    <button onClick={() => changeLanguage("ar")} className="flex justify-between">
                      <span>{t("languageAppearance.languages.ar")}</span>
                      <span>🇸🇦</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => changeLanguage("en")} className="flex justify-between">
                      <span>{t("languageAppearance.languages.en")}</span>
                      <span>🇺🇸</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="my-6">
            <label className={`label ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="label-text">{t("languageAppearance.options.theme")}</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.name}
                  theme={theme}
                  onSelect={handleThemeSelect}
                  isSelected={selectedTheme === theme.name}
                  isRTL={isRTL}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeCard({ theme, onSelect, isSelected, isRTL }) {
  const { t } = useTranslation("settings")
  
  return (
    <div className={`card border ${isSelected ? "border-primary" : "border-base-300"}`}>
      <div className="card-body p-4">
        <div className="flex gap-2 mb-2">
          {theme.colors.map((color, index) => (
            <div key={index} className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
          <button
            className={`btn btn-sm ${isSelected ? "btn-secondary" : "btn-primary"}`}
            onClick={() => onSelect(theme.name)}
          >
            {isSelected ? t("languageAppearance.theme.selected") : t("languageAppearance.theme.select")}
          </button>
          <span className="capitalize">{theme.name}</span>
        </div>
      </div>
    </div>
  )
}

export default LanguageAppearanceSection