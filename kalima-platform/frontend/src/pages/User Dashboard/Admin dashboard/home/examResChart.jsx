"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const ExamResChart = () => {
  // Reference to the container for RTL adjustment
  const containerRef = useRef(null)

  // Set RTL direction for the container
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = "rtl"
    }
  }, [])

  // Data for the exam results chart
  const examResultsData = {
    labels: [
      "يناير",
      "فبراير",
      "مارس",
      "ابريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    datasets: [
      {
        label: "معلم",
        data: [800, 700, 50, 180, 250, 400, 380, 50, 650, 550, 100, 400],
        backgroundColor: "#9783ff", // Purple color
        borderRadius: 4,
        barThickness: 30,
        maxBarThickness: 40,
      },
      {
        label: "طالب",
        data: [500, 200, 650, 700, 400, 500, 780, 380, 550, 120, 450, 250],
        backgroundColor: "#B5E8E0", // Light teal color
        borderRadius: 4,
        barThickness: 30,
        maxBarThickness: 40,
      },
    ],
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Exam Results Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card shadow-lg rounded-2xl overflow-hidden border border-slate-100"
      >
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-6">
          <h2 className="card-title text-xl font-bold">نتائج الامتحانات</h2>
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#9783ff]"></span>
                <span className="text-sm font-medium">معلم</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#B5E8E0]"></span>
                <span className="text-sm font-medium">طالب</span>
              </div>
            </div>
            
          </div>
          <div className="text-sm mb-4 text-right">الطلاب و المعلمين</div>
          <div className="h-72">
            <Bar
              data={examResultsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 750,
                    ticks: {
                      stepSize: 250,
                      font: {
                        family: "Arial",
                        size: 12,
                      },
                    },
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "Arial",
                        size: 12,
                      },
                    },
                  },
                },
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
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ExamResChart

