const StatisticsSection = () => {
    return (
      <div>
        <h2 className="text-xl font-bold text-right mb-4">نتائج الامتحان</h2>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-sm p-4 text-center">
            <div className="text-primary text-4xl font-bold mb-2">85%</div>
            <div className="text-base-content/70">متوسط الدرجات</div>
          </div>
  
          <div className="card bg-base-100 shadow-sm p-4 text-center">
            <div className="text-secondary text-4xl font-bold mb-2">12/15</div>
            <div className="text-base-content/70">الاختبارات المكتملة</div>
          </div>
  
          <div className="card bg-base-100 shadow-sm p-4 text-center">
            <div className="text-accent text-4xl font-bold mb-2">92%</div>
            <div className="text-base-content/70">نسبة الحضور</div>
          </div>
        </div>
  
        <div className="card bg-base-100 shadow-sm mt-6 p-4">
          <h3 className="font-bold text-right mb-4">ملخص الدرجات</h3>
          <div className="text-right">
            <div className="flex justify-end items-center gap-2 mb-2">
              <span>85/100</span>
              <span className="font-medium">:الامتحان النهائي</span>
            </div>
            <div className="flex justify-end items-center gap-2 mb-2">
              <span>42/50</span>
              <span className="font-medium">:امتحان نصف الفصل</span>
            </div>
            <div className="flex justify-end items-center gap-2 mb-2">
              <span>28/30</span>
              <span className="font-medium">:الواجبات المنزلية</span>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span>155/180</span>
              <span className="font-medium">:المجموع الكلي</span>
            </div>
          </div>
          <button className="btn btn-primary mt-4 w-full md:w-auto md:self-end">عرض التقرير</button>
        </div>
      </div>
    )
  }
  
  export default StatisticsSection
  