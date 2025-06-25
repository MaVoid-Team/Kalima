"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"

const PurchaseForm = ({
  type,
  purchaseForm,
  setPurchaseForm,
  uploadedFile,
  setUploadedFile,
  onSubmit,
  purchaseLoading,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const { t } = useTranslation("kalimaStore-ProductDetails")

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{t("purchaseForm.title")}</h2>
        <p className="text-lg">{t("purchaseForm.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Transfer Number */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">{t("purchaseForm.transferNumber")}</span>
            </label>
            <input
              type="text"
              placeholder={t("purchaseForm.transferNumberPlaceholder")}
              className="input input-bordered input-lg"
              value={purchaseForm.numberTransferredFrom}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, numberTransferredFrom: e.target.value })}
              required
            />
            <label className="label">
              <span className="label-text-alt">{t("purchaseForm.transferNumberHint")}</span>
            </label>
          </div>

          {/* Book-specific fields */}
          {type === "book" && (
            <div className="card bg-info text-info-content">
              <div className="card-body">
                <h3 className="card-title">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {t("purchaseForm.bookPersonalization")}
                </h3>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">{t("purchaseForm.nameOnBook")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("purchaseForm.nameOnBookPlaceholder")}
                      className="input input-bordered bg-base-100 text-base-content"
                      value={purchaseForm.nameOnBook}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, nameOnBook: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">{t("purchaseForm.numberOnBook")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("purchaseForm.numberOnBookPlaceholder")}
                      className="input input-bordered bg-base-100 text-base-content"
                      value={purchaseForm.numberOnBook}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, numberOnBook: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">{t("purchaseForm.seriesName")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("purchaseForm.seriesNamePlaceholder")}
                      className="input input-bordered bg-base-100 text-base-content"
                      value={purchaseForm.seriesName}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, seriesName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">{t("purchaseForm.paymentScreenshot")}</span>
          </label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-all ${
              dragActive
                ? "border-primary bg-primary/10"
                : uploadedFile
                  ? "border-success bg-success/10"
                  : "border-base-300 bg-base-200 hover:bg-base-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">{uploadedFile ? "✅" : "📤"}</div>

              {uploadedFile ? (
                <div className="space-y-3">
                  <p className="font-semibold text-success">{t("purchaseForm.fileUploaded")}</p>
                  <p className="text-sm bg-base-100 rounded-lg px-3 py-2 inline-block">📎 {uploadedFile.name}</p>
                  <button onClick={() => setUploadedFile(null)} className="btn btn-error btn-sm">
                    {t("purchaseForm.removeFile")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium">{t("purchaseForm.dragDrop")}</p>
                    <p className="text-sm opacity-70">{t("purchaseForm.orBrowse")}</p>
                  </div>
                  <div className="text-xs opacity-50">{t("purchaseForm.maxFileSize")}</div>
                </div>
              )}

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />

              {!uploadedFile && (
                <label htmlFor="file-upload" className="btn btn-outline cursor-pointer">
                  {t("purchaseForm.chooseFile")}
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-8">
        <button
          onClick={onSubmit}
          className="btn btn-primary btn-lg px-12"
          disabled={!uploadedFile || !purchaseForm.numberTransferredFrom || purchaseLoading}
        >
          {purchaseLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            t("purchaseForm.submit")
          )}
        </button>
      </div>

      {/* Response Time Notice */}
      <div className="alert alert-info mt-8">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="font-semibold">Processing Time</h4>
          <p>
            After submitting your purchase request, our team will review and process your order. You can expect a
            response within <strong>1-2 hours during business hours</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PurchaseForm
