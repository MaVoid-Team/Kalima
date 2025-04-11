// components/Dashboard.jsx
import { useState } from "react"
import Hero from "./hero"
import Charts from "./chartsSection"
import StudentsSection from "./studentsSection"
import AdminSidebar from "../../components/AdminSidebar"
import UserManagementTable from "./userManageTable"
const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true)
  const isRTL = true // Assuming Arabic language based on RTL direction
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="mx-auto w-full max-w-full px-6 bg-base-100 min-h-screen bg-gradient-to-br " dir="rtl">
      {/* Import the UserSidebar component */}
      <AdminSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content with margin to accommodate sidebar */}
      <div 
        className={`transition-all duration-300 space-y-8 ${
          isOpen ? (isRTL ? 'mr-52' : 'ml-52') : 'ml-0 mr-0'
        }`}
      >
          <Hero/>
          <Charts/>
          <StudentsSection/>
          <UserManagementTable/>


        <div className="flex justify-center items-center pb-36 max-sm:pt-20 rounded-3xl">
          <a target="_blank" href="https://api.whatsapp.com/send/?phone=01279614767&text&type=phone_number&app_absent=0 " rel="noreferrer" >
          <img alt="arrow" src="whatsApp.png" className="w-14 right-6 max-sm:w-16"></img>
          </a>
        <img alt="arrow" src="AdminA.png" className="w-36"></img>
        
          <button className="btn btn-primary w-44 rounded-xl">ارسل عرضك الان!</button>
          
        </div>
        <div className="relative">
          <img alt="" src="rDots.png" className="absolute h-32 w-20 left-16 bottom-20 max-sm:left-0 animate-float-up-dottedball "/>
        </div>
        <div className="relative">
          <img alt="" src="bDots.png" className="absolute h-32 w-20 right-16 bottom-44 max-sm:bottom-72 max-sm:right-0 animate-float-down-dottedball"/>
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard