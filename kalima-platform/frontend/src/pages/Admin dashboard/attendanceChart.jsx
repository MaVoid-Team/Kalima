"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const AttendanceChart = () => {
  // Reference to the container for RTL adjustment
  const containerRef = useRef(null)

  // Set RTL direction for the container
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = "rtl"
    }
  }, [])

  // Data for the attendance chart
  const attendanceData = {
    labels: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
    datasets: [
      {
        label: "نسبة الحضور",
        data: [85, 92, 78, 95, 88, 75],
        backgroundColor: "#9783ff",
        borderRadius: 4,
        barThickness: 30,
        maxBarThickness: 40,
      },
    ],
  }

  return (
    <div ref={containerRef}>
      {/* Attendance Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card shadow-lg rounded-2xl overflow-hidden border border-slate-100 h-full"
      >
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-xl font-bold">نسبة الحضور</h2>
          </div>
          <div className="h-64">
            <Bar
              data={attendanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 25,
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

export default AttendanceChart

