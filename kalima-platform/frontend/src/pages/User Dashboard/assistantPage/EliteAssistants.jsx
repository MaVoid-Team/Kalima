"use client"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { getUserDashboard } from "../../../routes/auth-services" // Adjust import path

const EliteAssistants = () => {
  const { t, i18n } = useTranslation("assistantPage")
  const isRTL = i18n.language === "ar"
  const [lecturer, setLecturer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLecturer = async () => {
      setLoading(true)
      try {
        const result = await getUserDashboard()
        if (result.success) {
          setLecturer(result.data.data.userInfo.assignedLecturer)
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

    fetchLecturer()
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
      <div className={`flex items-center mb-8 ${isRTL ? "justify-between" : "justify-between"}`}>
        <h2 className="text-2xl font-bold">{t("yourSupervisor")}</h2>
        <button className="text-teal-600 hover:underline font-medium">
          {t("contact")}
        </button>
      </div>

      {lecturer ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-md p-6 text-center">
            <div className="avatar mb-4">
              <div className="w-32 rounded-full">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lecturer.name)}&background=random`}
                  alt={lecturer.name}
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">{lecturer.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{lecturer.expertise}</p>
            <div className="badge badge-accent">{t("lecturer")}</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">{t("noLecturerAssigned")}</p>
        </div>
      )}
    </div>
  )
}

export default EliteAssistants