"use client"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"

function PersonalInfoSection({ formData, handleInputChange }) {
  const { t, i18n } = useTranslation("settings")
  const isRTL = i18n.language === 'ar'

  // Get all translations under personalInfo namespace
  const personalInfo = t('personalInfo', { returnObjects: true })

  return (
    <div className="mb-8">
      <SectionHeader title={personalInfo.title} />
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {personalInfo.subtitle}
          </h3>

          {/* Full Name Field */}
          <div className="form-control mb-4">
            <label className={`label justify-end`}>
              <span className="label-text">
                {personalInfo.labels.fullName}<span className="text-error">*</span>
              </span>
            </label>
            <div className={`flex gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <button className={`btn btn-sm ${isRTL ? '' : 'order-last'}`}>
                {personalInfo.buttons.edit}
              </button>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={personalInfo.placeholders.fullName}
                className={`input input-bordered w-full ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="form-control mb-4">
            <label className={`label justify-end`}>
              <span className="label-text">
                {personalInfo.labels.phoneNumber}<span className="text-error">*</span>
              </span>
            </label>
            <div className={`flex gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <button className={`btn btn-sm ${isRTL ? '' : 'order-last'}`}>
                {personalInfo.buttons.edit}
              </button>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={personalInfo.placeholders.phoneNumber}
                className={`input input-bordered w-full ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-control mb-4">
            <label className={`label justify-end`}>
              <span className="label-text">
                {personalInfo.labels.email}<span className="text-error">*</span>
              </span>
            </label>
            <div className={`flex gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <button className={`btn btn-sm ${isRTL ? '' : 'order-last'}`}>
                {personalInfo.buttons.edit}
              </button>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={personalInfo.placeholders.email}
                className={`input input-bordered w-full ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* ID Number Field */}
          <div className="form-control mb-4">
            <label className={`label justify-end`}>
              <span className="label-text">
                {personalInfo.labels.idNumber}<span className="text-error">*</span>
              </span>
            </label>
            <div className={`flex gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <button className={`btn btn-sm ${isRTL ? '' : 'order-last'}`}>
                {personalInfo.buttons.add}
              </button>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder={personalInfo.placeholders.idNumber}
                className={`input input-bordered w-full ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoSection