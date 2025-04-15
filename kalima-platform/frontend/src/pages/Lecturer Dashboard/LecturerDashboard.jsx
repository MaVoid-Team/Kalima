"use client"

import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import CourseGrid from "./CourseGrid"
import InstructorsList from "./InstructorsList"
import CourseCategories from "./CourseCategories"
import FeaturedCourses from "./FeaturedCourses"
import UserSidebar from "../../components/UserSidebar"
export default function LecturerDashboard() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate();
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      }
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex flex-col min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? (isRTL ? 'mr-52' : 'ml-52') : 'ml-0 mr-0'
        } pt-14`}
      >
        <div className="mx-auto p-10">
          

          {/* Course Categories */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("top_categories")}</h2>
              <span className="text-sm text-base-content/70">{t("most_popular")}</span>
            </div>
            <CourseCategories />
          </div>

          {/* Featured Courses */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("featured_courses")}</h2>
              <button className="btn btn-ghost btn-sm text-primary">{t("view_all")}</button>
            </div>
            <FeaturedCourses />
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 mb-8">
            <div className="join">
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? "btn-primary" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button className="join-item btn btn-sm" onClick={() => setCurrentPage((p) => p + 1)}>
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
