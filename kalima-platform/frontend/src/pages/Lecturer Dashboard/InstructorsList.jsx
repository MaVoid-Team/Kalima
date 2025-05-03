"use client"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { AssistantService } from "../../routes/assistants-services"
import { BookOpen, Plus } from "lucide-react"
import axios from "axios"

export default function InstructorsList() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const [assistants, setAssistants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [lecturerId, setLecturerId] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    password: "",
    role: "Assistant"
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const myData = await AssistantService.getMyData()
        if (!myData.success) throw new Error(myData.error)
        
        setLecturerId(myData.data.id)
        const assistantsRes = await AssistantService.getAssistantsByLecturer(myData.data.id)
        
        if (assistantsRes.success) {
          setAssistants(assistantsRes.data)
        } else {
          throw new Error(assistantsRes.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = t("Name is required")
    if (!formData.email.trim()) {
      errors.email = t("Email is required")
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t("Invalid email format")
    }
    if (!formData.password) {
      errors.password = t("Password is required")
    } else if (formData.password.length < 6) {
      errors.password = t("Password must be at least 6 characters")
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const payload = { ...formData, assignedLecturer: lecturerId }
      const result = await AssistantService.CreateAssistant(payload)
      
      if (result.success) {
        setAssistants(prev => [...prev, result.data])
        setShowAddModal(false)
        setFormData({
          name: "",
          email: "",
          gender: "male",
          password: "",
          role: "Assistant"
        })
      } else {
        throw new Error(result.error || t("Failed to create assistant"))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-24 h-24 bg-base-200 rounded-full flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold">{t("No assistants found")}</h3>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          {t("Try again")}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("Assistants")}</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />
          {t("Add Assistant")}
        </button>
      </div>

      {assistants.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <BookOpen className="text-primary" size={48} />
            <p className="text-lg">{t("noAssistants")}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir={isRTL ? "rtl" : "ltr"}>
          {assistants.map((assistant) => (
            <div key={assistant._id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center p-6">
                <div className="avatar mb-3">
                  <div className="w-20 rounded-full bg-base-200">
                    <img 
                      src={assistant.image || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(assistant.name)}&background=random`} 
                      alt={assistant.name}
                    />
                  </div>
                </div>
                <h3 className="card-title">{assistant.name}</h3>
                <p className="text-sm opacity-70">
                  {assistant.assignedLecturer?.expertise || t("assistantSpecialty")}
                </p>
                <div className="mt-2">
                  <span className={`badge ${assistant.gender === "male" ? 'badge-info' : 'badge-accent'}`}>
                    {assistant.gender === "male" ? t("male") : t("female")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Assistant Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("Add New Assistant")}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("Name")}</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input input-bordered ${formErrors.name ? 'input-error' : ''}`}
                />
                {formErrors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.name}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("Email")}</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input input-bordered ${formErrors.email ? 'input-error' : ''}`}
                />
                {formErrors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.email}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("Gender")}</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleInputChange}
                      className="radio radio-primary"
                    />
                    <span className="label-text">{t("male")}</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleInputChange}
                      className="radio radio-primary"
                    />
                    <span className="label-text">{t("female")}</span>
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("Password")}</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input input-bordered ${formErrors.password ? 'input-error' : ''}`}
                />
                {formErrors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.password}</span>
                  </label>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitting}
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    t("Add Assistant")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}