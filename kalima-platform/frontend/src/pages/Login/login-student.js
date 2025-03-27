"use client"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import WaveBackground from "./WaveBackground"
import StudentReviews from "./StudentReviews"
import { loginUser } from "../../routes/auth-services"

function LoginStudent() {
  const { t, i18n } = useTranslation("login")
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loginMethod, setLoginMethod] = useState("email") // "email" or "phone"
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isAr = i18n.language === "ar"

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous errors
    setError("")

    if (!isOnline) {
      setError(t("offline_warning"))
      return
    }

    setLoading(true)

    try {
      // Create login payload based on selected method
      const loginPayload = {
        password,
        ...(loginMethod === "email" ? { email } : { phoneNumber })
      }

      const result = await loginUser(loginPayload)

      if (result.success) {
        // Login successful
        console.log("Login successful")

        // Redirect to dashboard or home page
        navigate("/dashboard") // Adjust this to your app's route structure
      } else {
        // Login failed
        setError(result.error)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(t("login_error"))
    } finally {
      setLoading(false)
    }
  }

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email")
    setError("") // Clear any errors when switching methods
  }

  return (
    <div
      className="min-h-screen flex flex-col sm:flex-row items-center justify-center p-4 overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      <WaveBackground />

      <div className="flex flex-col lg:flex-row w-full gap-4 md:gap-8 z-10 justify-center items-center">
        {/* Login Form Section */}
        <div className="mx-2 md:mx-[10%] flex flex-col items-center justify-center w-3/4 sm:w-auto">
          <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100 mx-4">
            <div className="card-body px-4 md:px-6 py-2 md:py-6">
              <div className="text-center mb-0 md:mb-6">
                <h1 className="text-lg md:text-4xl font-bold mb-1 sm:mb-2">{t("title")}</h1>
                <p className="text-xs sm:text-sm md:text-base text-base-600">{t("welcome")}</p>
              </div>

              {!isOnline && <div className="alert alert-warning mb-4">{t("offline_warning")}</div>}

              {error && <div className="alert alert-error mb-4">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Login Method Toggle */}
                <div className="tabs tabs-boxed mb-4 justify-center">
                  <Link
                    className={`tab ${loginMethod === "email" ? "tab-active" : ""}`}
                    onClick={() => setLoginMethod("email")}
                  >
                    {t("email_tab") || "Email"}
                  </Link>
                  <Link 
                    className={`tab ${loginMethod === "phone" ? "tab-active" : ""}`}
                    onClick={() => setLoginMethod("phone")}
                  >
                    {t("phone_tab") || "Phone"}
                  </Link>
                </div>

                {/* Email or Phone Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      {loginMethod === "email" 
                        ? t("email_label") 
                        : t("phone_label") || "Phone Number"}:
                    </span>
                  </label>
                  
                  {loginMethod === "email" ? (
                    <input
                      type="email"
                      placeholder={t("email_label")}
                      className="input input-sm sm:input-md input-bordered"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  ) : (
                    <input
                      type="tel"
                      placeholder={t("phone_label") || "Phone Number"}
                      className="input input-sm sm:input-md input-bordered "
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={loading}
                    />
                  )}
                </div>

                <div className="form-control md:mt-4">
                  <label className="label">
                    <span className="label-text">{t("password_label")}:</span>
                  </label>
                  <input
                    type="password"
                    placeholder={t("password_label")}
                    className="input input-sm sm:input-md input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <Link to="/forgot-password" className="label-text-alt link link-hover">
                      {t("forgot_password")}
                    </Link>
                  </label>
                </div>
                <div className="form-control md:mt-8">
                  <button
                    className={`btn btn-primary btn-sm sm:btn-md md:btn-lg ${loading ? "loading" : ""}`}
                    disabled={!isOnline || loading}
                  >
                    {loading ? t("logging_in") : t("login_button")}
                  </button>
                </div>
                <div className="text-center sm:mt-3">
                  <Link to="/register" className="link link-hover text-xs md:text-sm">
                    {t("register_prompt")}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Student Reviews Section */}
        <div className="my-10">
          <StudentReviews />
        </div>
      </div>
    </div>
  )
}

export default LoginStudent;