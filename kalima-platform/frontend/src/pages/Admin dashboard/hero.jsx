const Hero = () => {
    return (
      <div className="mx-auto p-6  w-full font-[Cairo]">
        <h1 className="text-3xl font-bold mb-8 text-right">صفحة الأدمن</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
         
  
          {/* Students Card */}
          <div className="card bg-[#f3e8ff] shadow-lg hover:shadow-xl hover:scale-105 duration-500 transition-all rounded-2xl max-w-md">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className=" text-2xl font-bold text-purple-900">الطلاب</h2>
                <p className="text-3xl font-bold text-purple-900">2.00k</p>
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
          <div className="card bg-[#e8f4ff] rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 duration-500 transition-all max-w-md">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className=" text-2xl font-bold text-blue-700">المعلمين</h2>
                <p className=" text-3xl font-bold text-blue-700">50</p>
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
          <div className="card bg-[#ffece5] shadow-lg hover:shadow-xl hover:scale-105 duration-500 transition-all rounded-2xl max-w-md">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className=" text-2xl font-bold text-orange-700">أولياء الأمور</h2>
                <p className=" text-3xl font-bold text-orange-700">50</p>
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
           <div className="card bg-[#e8fce5] shadow-lg hover:shadow-xl hover:scale-105 duration-500 transition-all rounded-2xl max-w-md">
            <div className="card-body p-6 flex-row justify-between items-center">
              <div className="text-right">
                <h2 className=" text-2xl font-bold text-green-700">الأرباح</h2>
                <p className=" text-3xl font-bold text-green-700">5400k</p>
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
  
  export default Hero
  
  