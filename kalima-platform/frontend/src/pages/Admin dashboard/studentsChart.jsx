"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const StudentsChart = () => {
  // Reference to the container for RTL adjustment
  const containerRef = useRef(null)

  // Set RTL direction for the container
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = "rtl"
    }
  }, [])

  // Data for the doughnut chart
  const doughnutData = {
    labels: ["بنين", "بنات"],
    datasets: [
      {
        data: [850, 650],
        backgroundColor: ["#9783ff", "#B5E8E0"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  }

  return (
    <div ref={containerRef}>
      {/* Students Doughnut Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card shadow-lg rounded-2xl overflow-hidden border border-slate-100 h-full"
      >
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-6">
          <h2 className="card-title text-xl font-bold">الطلاب</h2>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#9783ff]"></span>
                <span className="text-sm font-medium">بنين</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#B5E8E0]"></span>
                <span className="text-sm font-medium">بنات</span>
              </div>
            </div>
            
          </div>
          <div className="flex justify-center items-center h-64 relative">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "75%",
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 12,
                    titleFont: {
                      size: 14,
                      family: "Arial",
                    },
                    bodyFont: {
                      size: 14,
                      family: "Arial",
                    },
                    cornerRadius: 8,
                    displayColors: false,
                  },
                },
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-lg font-medium">Total</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                1500
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StudentsChart

