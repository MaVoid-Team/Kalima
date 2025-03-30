"use client"
import SectionHeader from "./SectionHeader"

function PersonalInfoSection({ formData, handleInputChange }) {
  return (
    <div className="mb-8">
      <SectionHeader title="المعلومات الشخصية" />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">المعلومات الشخصية</h3>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">
                اسم الطالب بالكامل<span className="text-error">*</span>
              </span>
            </label>
            <div className="flex gap-4">
              <button className="btn btn-sm">تعديل</button>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="مثال: يوسف بن محمد علي"
                className="input input-bordered w-full text-right"
              />
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">
                رقم هاتف الجوال<span className="text-error">*</span>
              </span>
            </label>
            <div className="flex gap-4">
              <button className="btn btn-sm">تعديل</button>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="971-123-4567"
                className="input input-bordered w-full text-right"
              />
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">
                البريد الإلكتروني<span className="text-error">*</span>
              </span>
            </label>
            <div className="flex gap-4">
              <button className="btn btn-sm">تعديل</button>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@yahoo.com"
                className="input input-bordered w-full text-right"
              />
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label justify-end">
              <span className="label-text">
                رقم الهوية<span className="text-error">*</span>
              </span>
            </label>
            <div className="flex gap-4">
              <button className="btn btn-sm">إضافة</button>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهوية هنا"
                className="input input-bordered w-full text-right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoSection

