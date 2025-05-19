"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import Step1 from "./step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import StepParent from "./StepParent"
import StepTeacher from "./StepTeacher"
import Step4 from "./Step4"
import StepsIndicator from "./StepsIndicator"
import NavigationButtons from "./NavigationButtons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import RoleSelectionModal from "./RoleSelctionModal"
import { getAllLevels } from "../../routes/levels"
const apiUrl = import.meta.env.VITE_API_URL
const hobbiesList = [
  { id: 1, name: "reading", img: "/hobbies/reading.jpg" },
  { id: 2, name: "sports", img: "/hobbies/sports.jpg" },
  { id: 3, name: "music", img: "/hobbies/music.jpg" },
  { id: 4, name: "art", img: "/hobbies/art.jpg" },
  { id: 5, name: "gaming", img: "/hobbies/gaming.jpg" },
  { id: 6, name: "cooking", img: "/hobbies/cooking.jpg" },
  { id: 7, name: "photography", img: "/hobbies/photography.jpg" },
  { id: 8, name: "bicycling", img: "/hobbies/bicycle.jpg" },
  { id: 9, name: "technology", img: "/hobbies/technology.jpg" },
]

const totalSteps = {
  student: 4,
  parent: 3,
  teacher: 3,
}

export default function StudentRegistration() {
  const [showRoleModal, setShowRoleModal] = useState(true)
  const [roleLocked, setRoleLocked] = useState(false)
  const { t, i18n } = useTranslation("register")
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const [role, setRole] = useState("student")
  const [formData, setFormData] = useState({
    role: "student",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    phoneNumber2: "",
    gender: "",
    faction: "Alpha",
    level: "",
    hobbies: [],
    parentPhoneNumber: "",
    children: [""],
    subject: "",
    teachesAtType: "",
    centers: [""],
    school: "",
    socialMedia: [{ platform: "", account: "" }],
    government: "",
    administrationZone: "",
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [gradeLevels, setGradeLevels] = useState([])

  useEffect(() => {
    setErrors({})
    setApiError(null)
  }, [currentStep])

  const getStepErrors = (step) => {
    const errors = {}
    const { role } = formData
    const phoneRegex = /^\+?[0-9]\d{7,14}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const passwordRegex = /^.{8,}$/

    if (step === 1) {
      if (!formData.fullName?.trim()) errors.fullName = "required"
      if (!formData.gender) errors.gender = "required"
      if (!formData.government) errors.government = "required"
      if(!formData.administrationZone) errors.administrationZone = "required"
      if (!formData.phoneNumber) {
        errors.phoneNumber = "required"
      } else if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "phoneInvalid"
      }

      if (role === "student" && !formData.level) {
        errors.level = "required"
      }
    }


    if (step === 2) {
      if (!formData.email) {
        errors.email = "required"
      } else if (!emailRegex.test(formData.email)) {
        errors.email = "emailInvalid"
      }

      if (!formData.password) {
        errors.password = "required"
      } else if (!passwordRegex.test(formData.password)) {
        errors.password = "passwordRequirements"
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "required"
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "passwordsMismatch"
      }

      if (role === "student" && !formData.parentPhoneNumber) {
        errors.parentPhoneNumber = "parentPhoneRequired"
      }

     

      if (role === "teacher") {
        if (!formData.subject?.trim()) {
          errors.subject = "subjectRequired"
        }

        if (!formData.level || formData.level.length === 0) {
          errors.level = "required"
        }

        if (!formData.teachesAtType) {
          errors.teachesAtType = "required"
        } else {
          if (
            (formData.teachesAtType === "Center" || formData.teachesAtType === "Both") &&
            (!formData.centers || formData.centers.length === 0 || !formData.centers.some((c) => c.trim()))
          ) {
            errors.centers = "required"
          }

          if (
            (formData.teachesAtType === "School" || formData.teachesAtType === "Both") &&
            (!formData.school || !formData.school.trim())
          ) {
            errors.school = "required"
          }
        }

        // Validate social media entries if any are provided
        if (formData.socialMedia && formData.socialMedia.some((s) => s.platform || s.account)) {
          formData.socialMedia.forEach((social, index) => {
            if ((social.platform && !social.account) || (!social.platform && social.account)) {
              errors.socialMedia = {
                ...(errors.socialMedia || {}),
                [index]: {
                  ...(errors.socialMedia?.[index] || {}),
                  platform: !social.platform ? "required" : undefined,
                  account: !social.account ? "required" : undefined,
                },
              }
            }
          })
        }
      }
    }

    if (step === 3 && role === "student" && formData.hobbies.length === 0) {
      errors.hobbies = "hobbiesRequired"
    }

    return errors
  }

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getAllLevels()
        if (response.success) {
          const levels = response.data.map((level) => ({
          value: level._id,
          label: level.name
        }));
        setGradeLevels(levels);
        }
      } catch (error) {
        console.error("Error fetching levels:", error)
      }
    }

    fetchLevels()
  }, [])

  const toggleHobby = (hobbyId) => {
    try {
      setFormData((prev) => ({
        ...prev,
        hobbies: prev.hobbies.includes(hobbyId)
          ? prev.hobbies.filter((id) => id !== hobbyId)
          : [...prev.hobbies, hobbyId],
      }))
      setErrors((prev) => ({ ...prev, hobbies: undefined }))
    } catch (error) {
      console.error("Error toggling hobby:", error)
      setApiError("Failed to update hobby selection")
    }
  }

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep)

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setApiError(t("validation.submissionError"))
      return
    }

    if (currentStep < totalSteps[formData.role]) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleInputChange = (e) => {
    try {
      const { name, value, type } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? e.target.checked : value,
      }))
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    } catch (error) {
      console.error("Error handling input change:", error)
      setApiError("Failed to process input")
    }
  }

  const handleChildrenChange = (index, value) => {
    try {
      const newChildren = [...formData.children]
      newChildren[index] = value
      setFormData((prev) => ({ ...prev, children: newChildren }))
      setErrors((prev) => ({
        ...prev,
        children: { ...prev.children, [index]: undefined },
      }))
    } catch (error) {
      console.error("Error handling children change:", error)
      setApiError("Failed to update child sequence ID")
    }
  }

  const handleSubmit = async () => {
    try {
      setApiError(null)
      setErrors({})
      let payload

      switch (formData.role) {
        case "student":
          payload = {
            role: "student",
            name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            level: formData.level,
            hobbies: formData.hobbies
              .map((id) => hobbiesList.find((hobby) => hobby.id === id)?.name || "")
              .filter((name) => name !== ""),
            parentPhoneNumber: formData.parentPhoneNumber,
            phoneNumber: formData.phoneNumber,
            faction: formData.faction || "Alpha",
            gender: formData.gender,
            government: formData.government,
            administrationZone: formData.administrationZone,
          }
          break

        case "parent":
          payload = {
            role: "parent",
            children: formData.children.filter((c) => c.trim() !== ""),
            name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phoneNumber: formData.phoneNumber,

            gender: formData.gender,
            government: formData.government,
            administrationZone: formData.administrationZone,
          }
          break

        case "teacher":
          payload = {
            role: "teacher",
            name: formData.fullName.trim(),
            gender: formData.gender,
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phoneNumber: formData.phoneNumber,
            phoneNumber2: formData.phoneNumber2,
            subject: formData.subject.trim(),
            level: formData.level,
            teachesAtType: formData.teachesAtType,
            centers:
              formData.teachesAtType === "Center" || formData.teachesAtType === "Both"
                ? formData.centers.filter((c) => c.trim() !== "")
                : undefined,
            school:
              formData.teachesAtType === "School" || formData.teachesAtType === "Both"
                ? formData.school.trim()
                : undefined,
            socialMedia: formData.socialMedia
              .filter((s) => s.platform && s.account)
              .map((s) => ({ platform: s.platform, account: s.account.trim() })),
            government: formData.government,
            administrationZone: formData.administrationZone,
          }
          break

        default:
          throw new Error("Invalid role selected")
      }

      const url = `${apiUrl}/register`
      const response = await axios.post(url, payload)
      navigate("/login", {
        state: { message: "Registration successful" },
      })
    } catch (error) {
      let errorMessage = t("errors.unexpectedError")
      const fieldErrors = {}

      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 400:
            errorMessage = data.message || t("errors.invalidData")
            if (data.message?.includes("phone number")) {
              errorMessage = t("errors.phoneExists")
            }
            if (data.message?.includes("at least one special character")) {
              errorMessage = t("errors.PasswordSpecialChar")
            }
            if (data.message?.includes("at least one uppercase")) {
              errorMessage = t("errors.PasswordCapitalLetter")
            }
            if (data.field) {
              fieldErrors[data.field] = data.errorKey || "invalidInput"
            }
            break
          case 409:
            errorMessage = data.message || t("errors.emailExists")
            if (data.field) {
              fieldErrors[data.field] = data.errorKey || "duplicate"
            }
            if (data.message?.includes("E-Mail")) {
              errorMessage = t("errors.emailExists")
            }
            break

          case 500:
            errorMessage = t("errors.apiError")
            break
        }
      } else if (error.request) {
        errorMessage = t("errors.networkError")
      }

      setApiError(errorMessage)
      setErrors(fieldErrors)
    }
  }

  const renderStepContent = () => {
    try {
      const { role } = formData

      switch (role) {
        case "student":
          switch (currentStep) {
            case 1:
              return (
                <Step1
                  formData={formData}
                  handleInputChange={handleInputChange}
                  t={t}
                  errors={errors}
                  role={role}
                  gradeLevels={gradeLevels}
                />
              )
            case 2:
              return <Step2 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} />
            case 3:
              return (
                <Step3 formData={formData} toggleHobby={toggleHobby} t={t} hobbiesList={hobbiesList} errors={errors} />
              )
            case 4:
              return <Step4 formData={formData} t={t} hobbiesList={hobbiesList} gradeLevels={gradeLevels} />
            default:
              return null
          }
        case "parent":
          switch (currentStep) {
            case 1:
              return (
                <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />
              )
            case 2:
              return (
                <StepParent
                  formData={formData}
                  handleChildrenChange={handleChildrenChange}
                  handleInputChange={handleInputChange}
                  t={t}
                  gradeLevels={gradeLevels} 
                  errors={errors}
                />
              )
            case 3:
              return <Step4 formData={formData} t={t} />
            default:
              return null
          }
        case "teacher":
          switch (currentStep) {
            case 1:
              return (
                <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />
              )
            case 2:
              return (
                <StepTeacher
                  formData={formData}
                  handleInputChange={handleInputChange}
                  t={t}
                  errors={errors}
                  gradeLevels={gradeLevels}
                />
              )
            case 3:
              return <Step4 formData={formData} t={t} gradeLevels={gradeLevels} />
            default:
              return null
          }
        default:
          return null
      }
    } catch (error) {
      console.error("Error rendering step content:", error)
      setApiError("Failed to render form content")
      return null
    }
  }

  return (
    <div className="flex bg-primary" dir={i18n.language === "ar" ? "ltr" : "rtl"}>
      <div className="sm:hidden absolute inset-0 overflow-hidden z-0">
        <img
          src="/registration-image.png"
          alt="Background"
          className="absolute bottom-0 right-0 object-bottom opacity-50"
        />
      </div>

      <div className="w-1/3  2xl:w-1/2 relative sm:block hidden">
        <img
          src="/registration-image.png"
          alt="Background"
          className="absolute bottom-20 object-cover object-bottom h-[500px] w-[500px]"
        />
      </div>

      <div className={`sm:w-2/3  py-2 2xl:w-1/2 `} dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <div
          className="mx-auto bg-base-100 rounded-tr-[50px] rounded-bl-[50px] w-full p-10 relative shadow-xl"
          style={{
            borderTopRightRadius: i18n.language === "ar" ? 0 : "50px",
            borderBottomRightRadius: i18n.language === "ar" ? 0 : "50px",
            borderTopLeftRadius: i18n.language === "ar" ? "50px" : 0,
            borderBottomLeftRadius: i18n.language === "ar" ? "50px" : 0,
          }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-8 relative">
            {t(`${role}Register`)}
            <div
              className="top-full right-0 w-64 lg:w-[400px] h-4 mt-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='20' viewBox='0 0 600 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M596 12.5C577.5 3.5 453 -4 354 9.5C255 23 70 16.5 4 11.5' stroke='%23F7DC6F' strokeWidth='10' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "right",
              }}
            />
          </h1>

          {showRoleModal && (
            <RoleSelectionModal
              onSelectRole={(selectedRole) => {
                try {
                  setRole(selectedRole)
                  setFormData((prev) => ({ ...prev, role: selectedRole }))
                  setShowRoleModal(false)
                  setRoleLocked(true)
                } catch (error) {
                  console.error("Error selecting role:", error)
                  setApiError("Failed to select role")
                }
              }}
              t={t}
            />
          )}
          {apiError && (
            <div className="alert alert-error mb-4 animate-fade-in w-1/2" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold">{t("errors.errorTitle")}</h3>
                    <p className="text-sm">{t(apiError)}</p>
                  </div>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 pl-8">
                    <ul className="list-disc space-y-1">
                      {Object.entries(errors).map(
                        ([field, message]) =>
                          typeof message === "string" && (
                            <li
                              key={field}
                              className="flex gap-2 items-start"
                              dir={i18n.language === "ar" ? "rtl" : "ltr"}
                            >
                              <span className="font-medium">{t(`form.${field}`)}:</span>
                              <span className="text-opacity-80">{t(`validation.${message}`)}</span>
                            </li>
                          ),
                      )}
                    </ul>
                    <div className="flex items-center justify-center mt-4">
                      <button
                        className="btn btn-sm btn-ghost hover:bg-error-content/10 mx-auto"
                        onClick={() => {
                          setApiError(null)
                          setErrors({})
                        }}
                      >
                        {t("dismiss")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {renderStepContent()}

          <NavigationButtons
            currentStep={currentStep}
            handlePrev={() => setCurrentStep((prev) => prev - 1)}
            handleNext={handleNext}
            t={t}
            totalSteps={totalSteps}
            role={formData.role}
          />

          <StepsIndicator currentStep={currentStep} t={t} role={formData.role} />
        </div>
      </div>
    </div>
  )
}
