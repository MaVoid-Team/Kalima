"use client"

import { useState } from "react"
import SectionHeader from "./SectionHeader"

function SecuritySection({ formData, handleInputChange }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const updatePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("كلمات المرور غير متطابقة")
      return
    }

    if (formData.newPassword.length < 8) {
      alert("كلمة المرور يجب أن تكون على الأقل 8 أحرف")
      return
    }

    setLoading(true)
    try {
      // Example API call with axios
      // const response = await axios.post('/api/update-password', {
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("تم تحديث كلمة المرور بنجاح")
      handleInputChange({
        target: {
          name: "currentPassword",
          value: "",
        },
      })
      handleInputChange({
        target: {
          name: "newPassword",
          value: "",
        },
      })
      handleInputChange({
        target: {
          name: "confirmPassword",
          value: "",
        },
      })
    } catch (error) {
      console.error("Error updating password:", error)
      alert("حدث خطأ أثناء تحديث كلمة المرور")
    } finally {
      setLoading(false)
    }
  }

  const lockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )

  return (
    <div className="mb-8">
      <SectionHeader title="أمان الحساب" icon={lockIcon} />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">تغيير كلمة السر</h3>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">أدخل كلمة المرور الحالية</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="input input-bordered w-full text-right"
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">كلمة السر الجديدة</span>
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="input input-bordered w-full text-right"
              placeholder="كلمة السر الجديدة"
            />
          </div>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">تأكيد كلمة السر الجديدة</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="input input-bordered w-full text-right"
              placeholder="تأكيد كلمة السر الجديدة"
            />
            <div className="text-xs text-right mt-1 text-gray-500">كلمة المرور يجب أن تكون على الأقل 8 أحرف</div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-end">
              <span className="label-text">تأكيد كلمة السر الجديدة</span>
              <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            </label>
          </div>

          <PasswordStrengthIndicator strength={2} />

          <div className="flex justify-center mt-6">
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={updatePassword}
              disabled={loading}
            >
              تحديث كلمة السر
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordStrengthIndicator({ strength }) {
  // strength: 0 = weak, 1 = medium, 2 = strong
  const widths = ["w-1/3", "w-1/2", "w-2/3"]
  const colors = ["bg-error", "bg-warning", "bg-primary"]

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colors[strength]} ${widths[strength]} h-2.5 rounded-full`}></div>
      </div>
    </div>
  )
}

export default SecuritySection

