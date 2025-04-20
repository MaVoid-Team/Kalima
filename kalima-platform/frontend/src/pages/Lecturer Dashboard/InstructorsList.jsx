"use client"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { AssistantService } from "../../routes/assistants-services"

export default function InstructorsList() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const [assistants, setAssistants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssistants = async () => {
      setLoading(true)
      try {
        // First get lecturer ID
        const myData = await AssistantService.getMyData()
        if (!myData.success) throw new Error(myData.error)

        // Then get assistants
        const result = await AssistantService.getAssistantsByLecturer(myData.data.id)
        
        if (result.success) {
          setAssistants(result.data)
          setError(null)
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
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

  if (assistants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("noAssistants")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" dir={isRTL ? "rtl" : "ltr"}>
      {assistants.map((assistant) => (
        <div key={assistant._id} className="card bg-base-100 shadow-lg hover:shadow-2xl duration-300 transition-shadow">
          <div className="card-body items-center text-center p-6">
            <div className="avatar mb-3">
              <div className="w-24 rounded-full">
                <img 
                  src={assistant.image || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(assistant.name)}&background=random`} 
                  alt={assistant.name}
                />
              </div>
            </div>
            <h3 className="font-bold text-lg">{assistant.name}</h3>
            <p className="text-sm text-base-content/70">
              {assistant.assignedLecturer?.expertise || t("assistantSpecialty")}
            </p>
            <div className="mt-2">
              <span className="badge badge-outline">
                {assistant.gender === "male" ? t("male") : t("female")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}