"use client"

import { useState, useEffect } from "react"
import UserSidebar from "../../components/UserSidebar"
import PageHeader from "./PageHeader"
import PersonalInfoSection from "./PersonalInfoSection"
import LanguageAppearanceSection from "./LanguageAppearanceSection"
import SecuritySection from "./SecuritySection"
import NotificationsSection from "./NotificationsSection"
import { FaBars } from "react-icons/fa"

function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "مثال: يوسف بن محمد علي",
    phoneNumber: "971-123-4567",
    email: "ahmad123@yahoo.com",
    idNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <div className={`flex flex-col lg:flex-row-reverse min-h-screen bg-base-100 text-right ${sidebarOpen && !isMobile ? `mr-52 transition-all duration-500` : `mr-0`}`} dir="rtl">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed top-16 left-4 z-50">
        <button
          id="sidebar-toggle"
          className="btn btn-circle btn-primary"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 md:pt-4 pt-16">
        <PageHeader title="الإعدادات" />

        <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />

        <LanguageAppearanceSection />

        <SecuritySection formData={formData} handleInputChange={handleInputChange} />

        <NotificationsSection />
      </div>

      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  )
}

export default SettingsPage

