"use client"

import { useState } from "react"
import SectionHeader from "./SectionHeader"
import { Link } from "react-router-dom"

function LanguageAppearanceSection() {
  const [selectedTheme, setSelectedTheme] = useState("")

  const themes = [
    {
      name: "Cyberpunk",
      colors: ["#0f172a", "#67e8f9", "#c084fc", "#fb7185"],
    },
    {
      name: "Retro",
      colors: ["#f87171", "#a7f3d0", "#fcd34d", "#92400e"],
    },
    {
      name: "Synthwave",
      colors: ["#ec4899", "#38bdf8", "#facc15", "#1e1b4b"],
    },
    {
      name: "Bumblebee",
      colors: ["#facc15", "#fb923c", "#22d3ee", "#1e293b"],
    },
    {
      name: "Emerald",
      colors: ["#34d399", "#3b82f6", "#fb923c", "#1e293b"],
    },
    {
      name: "Corporate",
      colors: ["#4f46e5", "#64748b", "#10b981", "#0f172a"],
    },
    {
      name: "Light",
      colors: ["#6d28d9", "#ec4899", "#14b8a6", "#1e293b"],
    },
    {
      name: "Dark",
      colors: ["#6d28d9", "#ec4899", "#14b8a6", "#1e293b"],
    },
    {
      name: "Cupcake",
      colors: ["#22d3ee", "#f9a8d4", "#f59e0b", "#1e1b4b"],
    },
  ]

  const handleThemeSelect = (themeName) => {
    setSelectedTheme(themeName)
    // This would update the theme preference via API
    console.log(`Selected theme: ${themeName}`)
  }

  return (
    <div className="mb-8">
      <SectionHeader title="اللغة والمظهر" />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">اللغة والمظهر</h3>

          <div className="form-control mb-6">
            <label className="label justify-end">
              <span className="label-text">اختر اللغة</span>
            </label>
            <div className="flex justify-end">
              <div className="dropdown dropdown-top dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1 min-w-40 justify-between">
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
                  مثال: العربية
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link>العربية</Link>
                  </li>
                  <li>
                    <Link>English</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="label justify-end">
              <span className="label-text">اختر المظهر</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.name}
                  theme={theme}
                  onSelect={handleThemeSelect}
                  isSelected={selectedTheme === theme.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeCard({ theme, onSelect, isSelected }) {
  return (
    <div className={`card border ${isSelected ? "border-primary" : "border-base-300"}`}>
      <div className="card-body p-4">
        <div className="flex gap-2 mb-2">
          {theme.colors.map((color, index) => (
            <div key={index} className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button
            className={`btn btn-sm ${isSelected ? "btn-secondary" : "btn-primary"}`}
            onClick={() => onSelect(theme.name)}
          >
            {isSelected ? "تم الاختيار" : "إضافة"}
          </button>
          <span>{theme.name}</span>
        </div>
      </div>
    </div>
  )
}

export default LanguageAppearanceSection

