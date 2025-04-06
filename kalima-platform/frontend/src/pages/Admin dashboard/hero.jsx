function AdminDashboard() {
    return (
      <div className="container mx-auto p-6 w-full max-w-6xl  font-[Cairo]">
        <h1 className="text-3xl font-bold mb-8 text-right">صفحة الأدمن</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
         
  
          {/* Students Card */}
          <div className="card bg-[#f3e8ff] shadow-sm rounded-2xl">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className="text-[#7b61ff] text-2xl font-bold">الطلاب</h2>
                <p className="text-[#7b61ff] text-3xl font-bold">2.00k</p>
              </div>
              <div className="avatar p-3 rounded-full">
                <img
                  src="admin2.png"
                  alt="Students Icon"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>
  
          {/* Teachers Card */}
          <div className="card bg-[#e8f4ff] shadow-sm rounded-2xl">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className="text-[#5a9eff] text-2xl font-bold">المعلمين</h2>
                <p className="text-[#5a9eff] text-3xl font-bold">50</p>
              </div>
              <div className="avatar  p-3 rounded-full">
                <img
                  src="admin1.png"
                  alt="Teachers Icon"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>
  
          

          {/* Parents Card */}
          <div className="card bg-[#ffece5] shadow-sm rounded-2xl">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className="text-[#ff9a62] text-2xl font-bold">أولياء الأمور</h2>
                <p className="text-[#ff9a62] text-3xl font-bold">50</p>
              </div>
              <div className="avatar  p-3 rounded-full">
                <img
                  src="admin3.png"
                  alt="Parents Icon"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>

           {/* Profits Card */}
           <div className="card bg-[#e8fce5] shadow-sm rounded-2xl">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className="text-[#4caf50] text-2xl font-bold">الأرباح</h2>
                <p className="text-[#4caf50] text-3xl font-bold">5400k</p>
              </div>
              <div className="avatar  p-3 rounded-full">
                <img
                  src="admin4.png"
                  alt="Profits Icon"
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>

           
        </div>
      </div>
    )
  }
  
  export default AdminDashboard
  
  