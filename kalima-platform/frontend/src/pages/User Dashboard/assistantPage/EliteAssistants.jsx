"use client"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { AssistantService } from "../../../routes/assistants-services"

const EliteAssistants = () => {
  const { t, i18n } = useTranslation("assistantPage")
  const isRTL = i18n.language === "ar"
  const [assistants, setAssistants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssistants = async () => {
      setLoading(true)

      const result = await AssistantService.getAssistants()

      if (result.success) {
        setAssistants(result.data)
        setError(null)
      } else {
        setError(result.error)
      }

      setLoading(false)
    }

    fetchAssistants()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-spinner loading-lg text-teal-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="mb-12 p-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className={`flex items-center mb-8 ${isRTL ? "justify-between" : "justify-between"}`}>
        <h2 className="text-2xl font-bold">{t("eliteAssistants.title")}</h2>
        <button className="text-teal-600 hover:underline font-medium">{t("eliteAssistants.viewAll")}</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant, index) => (
          <div key={assistant._id || index} className="bg-white shadow-md rounded-md p-6 text-center">
            <img
              src={
                assistant.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(assistant.name) || "/placeholder.svg"}&background=random`
              }
              alt={assistant.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-1">{assistant.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{assistant.bio || t("eliteAssistants.defaultBio")}</p>
            <div className="badge badge-outline badge-accent">
              {assistant.assignedLecturer?.expertise || t("eliteAssistants.expertise")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EliteAssistants
