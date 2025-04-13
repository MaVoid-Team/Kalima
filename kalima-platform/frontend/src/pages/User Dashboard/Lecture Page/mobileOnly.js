"use client"
import { useNavigate } from "react-router-dom"

const MobileOnly = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold text-primary mb-4">محتوى للهاتف المحمول فقط</h1>
      <p className="text-base-content mb-6">هذا المحتوى متاح فقط على الأجهزة المحمولة.</p>
      <button onClick={handleBack} className="btn btn-primary">
        العودة إلى الصفحة الرئيسية
      </button>
    </div>
  )
}

export default MobileOnly

