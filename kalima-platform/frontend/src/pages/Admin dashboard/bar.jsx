import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Reference to the container for RTL adjustment
  const containerRef = useRef(null);

  // Set RTL direction for the container
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = "rtl";
    }
  }, []);

  // Data for the exam results chart
  const examResultsData = {
    labels: [
      "يناير", "فبراير", "مارس", "ابريل", "مايو", "يونيو", 
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
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
  };

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
  };

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
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto p-4">
      {/* Exam Results Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card bg-white shadow-lg rounded-2xl mb-8 overflow-hidden border border-slate-100"
      >
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-6">
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
            <h2 className="card-title text-xl font-bold">نتائج الامتحانات</h2>
          </div>
          <div className="text-sm text-gray-500 mb-4 text-right">الطلاب و المعلمين</div>
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

      {/* Attendance and Students Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100"
        >
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
                  <circle cx="17" cy="7" r="5" />
                </svg>
                <span className="text-sm font-medium text-slate-600">هذا الأسبوع</span>
              </div>
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

        {/* Students Doughnut Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100"
        >
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-6">
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
              <h2 className="card-title text-xl font-bold">الطلاب</h2>
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
                <div className="text-lg font-medium text-gray-500">Total</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  1500
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;