// components/Dashboard.jsx
import { useState } from "react"
import Hero from "./hero"
import BarChart from "./bar"
import Students from "./students"
import AdminSidebar from "../../components/AdminSidebar"

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true)
  const isRTL = true // Assuming Arabic language based on RTL direction
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br" dir="rtl">
      {/* Import the UserSidebar component */}
      <AdminSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content with margin to accommodate sidebar */}
      <div 
        className={`transition-all duration-300 ${
          isOpen ? (isRTL ? 'mr-52' : 'ml-52') : 'ml-0 mr-0'
        }`}
      >
        
        {/* Hero */}
        <div>
          <Hero/>
        </div>
        
        
        {/* BarChart */}
        <div>
          <BarChart/>
        </div>
        
        {/* Student */}
        <div>
          <Students/>
        </div>
        <div className="flex justify-center items-center py-6 rounded-3xl">
          <a href="https://api.whatsapp.com/send/?phone=01279614767&text&type=phone_number&app_absent=0 " target="_blank">
          <img alt="arrow" src="whatsApp.png" className="w-14 right-6"></img>
          </a>
        <img alt="arrow" src="AdminA.png" className="w-36"></img>
        
          <button className="btn btn-primary w-44 rounded-xl text-black">ارسل عرضك الان!</button>
          
        </div>
        {/* <div className="relative">
          <img alt="" src="rDots.png" className="absolute h-32 w-20 right-16 bottom-5"/>
        </div> */}
      </div>

    </div>
  )
}

export default Dashboard