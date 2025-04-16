const ContactForm = () => {
    return (
      <div className="bg-base-100 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-right mb-2 font-medium">الفئة</label>
            <select className="select select-bordered w-full">
              <option disabled selected>
                اختر
              </option>
              <option>استفسار</option>
              <option>شكوى</option>
              <option>اقتراح</option>
            </select>
          </div>
  
          <div>
            <label className="block text-right mb-2 font-medium">المحتوى</label>
            <select className="select select-bordered w-full">
              <option disabled selected>
                اختر
              </option>
              <option>المادة التعليمية</option>
              <option>المدرس</option>
              <option>المنصة</option>
            </select>
          </div>
  
          <div>
            <label className="block text-right mb-2 font-medium">الصف</label>
            <select className="select select-bordered w-full">
              <option disabled selected>
                اختر
              </option>
              <option>الأول</option>
              <option>الثاني</option>
              <option>الثالث</option>
            </select>
          </div>
        </div>
  
        <div className="mb-4">
          <label className="block text-right mb-2 font-medium">المستوى</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="المستوى" className="input input-bordered w-full" />
            <input type="text" placeholder="المستوى الفرعي" className="input input-bordered w-full" />
            <input type="text" placeholder="التفاصيل" className="input input-bordered w-full" />
          </div>
        </div>
  
        <div className="mb-4">
          <label className="block text-right mb-2 font-medium">وصف الطلب</label>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="يرجى كتابة تفاصيل طلبك أو استفسارك هنا..."
          ></textarea>
        </div>
  
        <div className="flex justify-between items-center">
          <button className="btn btn-outline">إلغاء</button>
          <button className="btn btn-primary">إرسال الطلب</button>
        </div>
      </div>
    )
  }
  
  export default ContactForm
  