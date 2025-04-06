import React, { useState } from "react";

const StudentDashboard = () => {
  const [selectedStudents, setSelectedStudents] = useState(["741985"]);

  const toggleStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const students = [
    {
      id: "456752",
      name: "أسماء علي",
      marks: 1150,
      percentage: "95%",
      year: 2025,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "741985",
      name: "سارة محمد",
      marks: 1100,
      percentage: "90%",
      year: 2025,
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: "635421",
      name: "عصام عمر",
      marks: 1099,
      percentage: "89.9%",
      year: 2025,
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "187523",
      name: "سيف زياد",
      marks: 1080,
      percentage: "85%",
      year: 2025,
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  ];

  // Star SVG component
  const Star = ({ className }) => (
    <svg className={className} width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,0 L14.59,8.41 L23,11 L14.59,13.59 L12,22 L9.41,13.59 L1,11 L9.41,8.41 Z" />
    </svg>
  );

  // WhatsApp icon
  const WhatsAppIcon = () => (
    <div className="absolute -bottom-1 -right-1 bg-[#25d366] rounded-full p-1 w-5 h-5 flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.5 3.5L12.5 11.5M20.5 3.5L14.5 20.5L11.5 12.5L3.5 9.5L20.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  return (
    <div className="mx-auto  w-full max-w-6xl  mb-20 p-6 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header with stars */}
        <div className="relative mb-8">
          <div className="absolute -top-12 right-0">
            <img src="starC.png" alt="cyan star"></img>
          </div>
          <div className="absolute -top-12 left-52">
          <img src="starG.png" alt="cyan star"></img>
          </div>
          
          {/* Title */}
          <div className="flex justify-end items-center gap-2 mb-8">
            <h1 className="text-2xl font-bold">أكثر الطلاب تميزًا</h1>
            <span className="text-[#ffcc00] text-2xl">😊</span>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-auto">
          <table className="table w-full ">
            <thead>
              <tr className="text-primary">
                <th className="py-4 px-2 text-right font-bold text-xl"></th>
                <th className="py-4 px-2 text-right  font-bold text-xl">الاسم</th>
                <th className="py-4 px-2 text-right  font-bold text-xl">الرقم التعريفي</th>
                <th className="py-4 px-2 text-right  font-bold text-xl">العلامات</th>
                <th className="py-4 px-2 text-right font-bold text-xl">الدرجة المئوية</th>
                <th className="py-4 px-2 text-right font-bold text-xl">العام</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-none">
                  <td className="py-3 px-2">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-sm border-primary"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      style={{
                        '--chkbg': '#069495',
                        '--chkfg': 'white',
                      }}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full border border-primary">
                            <img src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          </div>
                        </div>
                        <WhatsAppIcon />
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-primary">{student.id}</td>
                  <td className="py-3 px-2 text-primary">{student.marks}</td>
                  <td className="py-3 px-2 text-primary">{student.percentage}</td>
                  <td className="py-3 px-2 text-primary">{student.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom stars */}
        <div className="relative mt-12">
          <div className="absolute bottom-48 left-0">
          <img src="starP.png" alt="cyan star"></img>
          </div>
          <div className="absolute -bottom-12 right-12">
          <img src="starP.png" alt="cyan star"></img>
          </div>
          <div className="absolute -bottom-12 left-12">
          <img src="starGr.png" alt="cyan star"></img>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;