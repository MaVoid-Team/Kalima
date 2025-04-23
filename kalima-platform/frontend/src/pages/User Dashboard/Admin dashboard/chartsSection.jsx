// components/Dashboard.jsx
import ExamResChart from "./examResChart"
import StudentsChart from "./studentsChart"
import AttendanceChart from "./attendanceChart"


const ChartsSection = () => {
    return (
        <div className="w-full  mx-auto shadow-lg">
          {/* Exam Results Chart - Full Width */}
          <div className="mb-8">
            <ExamResChart />
          </div>
          
          {/* Attendance and Students Charts - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AttendanceChart />
            <StudentsChart />
          </div>
        </div>
      );
}

export default ChartsSection