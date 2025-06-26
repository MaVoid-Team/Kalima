"use client"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const AdminForms = ({
  activeTab,
  setActiveTab,
  productForm,
  setProductForm,
  bookForm,
  setBookForm,
  sectionForm,
  setSectionForm,
  sections = [],
  subjects = [],
  onCreateProduct,
  onCreateBook,
  onCreateSection,
  onFileChange,
  actionLoading,
  isRTL,
}) => {
  const { t } = useTranslation("kalimaStore-admin")

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: { file: null, uploading: false, progress: 0, completed: false, error: null },
    sample: { file: null, uploading: false, progress: 0, completed: false, error: null },
    gallery: { files: [], uploading: false, progress: 0, completed: false, error: null },
  })

  // Handle file selection with progress tracking
  const handleFileSelect = (e, fieldName, formType) => {
    const files = e.target.files
    const file = files[0]

    if (!file) return

    // Update form state
    if (formType === "product") {
      setProductForm?.((prev) => ({
        ...prev,
        [fieldName]: fieldName === "gallery" ? files : file,
      }))
    } else if (formType === "book") {
      setBookForm?.((prev) => ({
        ...prev,
        [fieldName]: fieldName === "gallery" ? files : file,
      }))
    }

    // Update upload progress state
    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: {
        file: fieldName === "gallery" ? files : file,
        uploading: false,
        progress: 0,
        completed: false,
        error: null,
      },
    }))

    // Call original file change handler
    onFileChange?.(e, fieldName, formType)
  }

  // Handle upload completion
  const handleUploadComplete = (response, fieldName) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        uploading: false,
        progress: 100,
        completed: true,
        error: null,
      },
    }))

    // Update form with server response if needed
    const currentForm = activeTab === "product" ? productForm : bookForm
    const setCurrentForm = activeTab === "product" ? setProductForm : setBookForm

    if (response?.url || response?.path) {
      setCurrentForm?.((prev) => ({
        ...prev,
        [`${fieldName}Url`]: response.url || response.path,
      }))
    }
  }

  // Handle upload error
  const handleUploadError = (error, fieldName) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        uploading: false,
        error: error,
      },
    }))
  }

  // Simulate upload progress (replace with actual upload endpoint)
  const simulateUpload = (file, fieldName) => {
    if (!file) return

    setUploadProgress((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        uploading: true,
        progress: 0,
        error: null,
      },
    }))

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        handleUploadComplete({ url: `uploaded/${file.name}` }, fieldName)
      }

      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          progress: Math.round(progress),
        },
      }))
    }, 200)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Create Product/Book Form with Tabs */}
      <div className="card shadow-lg relative">
        <div className="card-body p-6">
          {/* Tab Navigation */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "product" ? "tab-active" : ""}`}
              onClick={() => setActiveTab?.("product")}
            >
              {t("forms.createProduct.title") || "Create Product"}
            </button>
            <button
              className={`tab ${activeTab === "book" ? "tab-active" : ""}`}
              onClick={() => setActiveTab?.("book")}
            >
              {t("forms.createBook.title") || "Create Book"}
            </button>
          </div>

          <form onSubmit={activeTab === "product" ? onCreateProduct : onCreateBook}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {activeTab === "product"
                  ? t("forms.createProduct.title") || "Create Product"
                  : t("forms.createBook.title") || "Create Book"}
              </h3>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : activeTab === "product" ? (
                  t("forms.createProduct.submitButton") || "Create Product"
                ) : (
                  t("forms.createBook.submitButton") || "Create Book"
                )}
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("forms.createProduct.fields.title") || "Title"} *</span>
                </label>
                <input
                  type="text"
                  placeholder={t("forms.createProduct.placeholders.title") || "Enter title"}
                  className="input input-bordered w-full"
                  value={activeTab === "product" ? productForm?.title || "" : bookForm?.title || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, title: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, title: e.target.value })
                    }
                  }}
                  required
                />
              </div>

              {/* Serial Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("forms.createProduct.fields.serial") || "Serial"} *</span>
                </label>
                <input
                  type="text"
                  placeholder={t("forms.createProduct.placeholders.serial") || "Enter serial"}
                  className="input input-bordered w-full"
                  value={activeTab === "product" ? productForm?.serial || "" : bookForm?.serial || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, serial: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, serial: e.target.value })
                    }
                  }}
                  required
                />
              </div>

              {/* Thumbnail Field with Progress */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.thumbnail") || "Thumbnail"} *
                  </span>
                </label>
                <input
                  type="file"
                  id={`${activeTab}-thumbnail`}
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "thumbnail", activeTab)}
                />
                <p className="text-xs mt-1 text-gray-500">
                  {t("forms.createProduct.hints.thumbnail") || "Upload thumbnail image (JPG, PNG, WebP)"}
                </p>

                {/* Thumbnail Upload Progress */}
                {uploadProgress.thumbnail.file && (
                  <div className="mt-3 p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate max-w-48">
                          {uploadProgress.thumbnail.file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({(uploadProgress.thumbnail.file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      </div>

                      {uploadProgress.thumbnail.completed && (
                        <div className="flex items-center gap-1 text-success">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs">Ready</span>
                        </div>
                      )}

                      {!uploadProgress.thumbnail.completed && (
                        <button
                          type="button"
                          onClick={() => simulateUpload(uploadProgress.thumbnail.file, "thumbnail")}
                          className="btn btn-xs btn-primary"
                          disabled={uploadProgress.thumbnail.uploading}
                        >
                          {uploadProgress.thumbnail.uploading ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              {uploadProgress.thumbnail.progress}%
                            </>
                          ) : (
                            "Upload"
                          )}
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadProgress.thumbnail.error
                            ? "bg-error"
                            : uploadProgress.thumbnail.completed
                              ? "bg-success"
                              : "bg-primary"
                        }`}
                        style={{ width: `${uploadProgress.thumbnail.progress}%` }}
                      ></div>
                    </div>

                    {uploadProgress.thumbnail.error && (
                      <div className="mt-2 text-xs text-error">{uploadProgress.thumbnail.error}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Section Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.section") || "Section"} *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={activeTab === "product" ? productForm?.section || "" : bookForm?.section || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, section: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, section: e.target.value })
                    }
                  }}
                  required
                >
                  <option value="">{t("forms.createProduct.placeholders.section") || "Select section"}</option>
                  {(sections || []).map((section) =>
                    section?._id && section?.name ? (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>

              {/* Subject field - only for books */}
              {activeTab === "book" && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createBook.fields.subject") || "Subject"} *
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={bookForm?.subject || ""}
                    onChange={(e) => setBookForm?.({ ...bookForm, subject: e.target.value })}
                    required
                  >
                    <option value="">{t("forms.createBook.placeholders.subject") || "Select subject"}</option>
                    {(subjects || []).map((subject) =>
                      subject?._id && subject?.name ? (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ) : null,
                    )}
                  </select>
                </div>
              )}

              {/* Price Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("forms.createProduct.fields.price") || "Price"} *</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={activeTab === "product" ? productForm?.price || "" : bookForm?.price || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, price: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, price: e.target.value })
                    }
                  }}
                  required
                />
              </div>

              {/* Discount Percentage Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.discountPercentage") || "Discount Percentage"}
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered w-full"
                  value={
                    activeTab === "product" ? productForm?.discountPercentage || "" : bookForm?.discountPercentage || ""
                  }
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, discountPercentage: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, discountPercentage: e.target.value })
                    }
                  }}
                />
              </div>

              {/* Payment Number Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.paymentNumber") || "Payment Number"} *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={t("forms.createProduct.placeholders.paymentNumber") || "Enter payment number"}
                  className="input input-bordered w-full"
                  value={activeTab === "product" ? productForm?.paymentNumber || "" : bookForm?.paymentNumber || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, paymentNumber: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, paymentNumber: e.target.value })
                    }
                  }}
                  required
                />
              </div>

              {/* WhatsApp Number field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">WhatsApp Number *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter WhatsApp number"
                  className="input input-bordered w-full"
                  value={activeTab === "product" ? productForm?.whatsAppNumber || "" : bookForm?.whatsAppNumber || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, whatsAppNumber: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, whatsAppNumber: e.target.value })
                    }
                  }}
                  required
                />
                <p className="text-xs mt-1 text-gray-500">Enter the WhatsApp number for customer contact</p>
              </div>

              {/* Sample File Field with Progress */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.sampleFile") || "Sample File"}
                  </span>
                </label>
                <input
                  type="file"
                  id={`${activeTab}-sample`}
                  className="file-input file-input-bordered w-full"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileSelect(e, "sample", activeTab)}
                />
                <p className="text-xs mt-1 text-gray-500">
                  {t("forms.createProduct.hints.sampleFile") || "Upload sample file (PDF, DOC, DOCX)"}
                </p>

                {/* Sample Upload Progress */}
                {uploadProgress.sample.file && (
                  <div className="mt-3 p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate max-w-48">{uploadProgress.sample.file.name}</div>
                        <div className="text-xs text-gray-500">
                          ({(uploadProgress.sample.file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      </div>

                      {uploadProgress.sample.completed && (
                        <div className="flex items-center gap-1 text-success">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs">Ready</span>
                        </div>
                      )}

                      {!uploadProgress.sample.completed && (
                        <button
                          type="button"
                          onClick={() => simulateUpload(uploadProgress.sample.file, "sample")}
                          className="btn btn-xs btn-primary"
                          disabled={uploadProgress.sample.uploading}
                        >
                          {uploadProgress.sample.uploading ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              {uploadProgress.sample.progress}%
                            </>
                          ) : (
                            "Upload"
                          )}
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadProgress.sample.error
                            ? "bg-error"
                            : uploadProgress.sample.completed
                              ? "bg-success"
                              : "bg-primary"
                        }`}
                        style={{ width: `${uploadProgress.sample.progress}%` }}
                      ></div>
                    </div>

                    {uploadProgress.sample.error && (
                      <div className="mt-2 text-xs text-error">{uploadProgress.sample.error}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {activeTab === "product"
                      ? "Description"
                      : t("forms.createBook.fields.description") || "Description"}{" "}
                    *
                  </span>
                </label>
                <textarea
                  placeholder={
                    activeTab === "product"
                      ? "Enter product description..."
                      : t("forms.createBook.placeholders.description") || "Enter book description..."
                  }
                  className="textarea textarea-bordered w-full h-32"
                  value={activeTab === "product" ? productForm?.description || "" : bookForm?.description || ""}
                  onChange={(e) => {
                    if (activeTab === "product") {
                      setProductForm?.({ ...productForm, description: e.target.value })
                    } else {
                      setBookForm?.({ ...bookForm, description: e.target.value })
                    }
                  }}
                  required
                />
                <p className="text-xs mt-1 text-gray-500">
                  {activeTab === "product"
                    ? "Provide a detailed description of the product"
                    : "Provide a detailed description of the book"}
                </p>
              </div>

              {/* Gallery field - only for products */}
              {activeTab === "product" && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Gallery Images</span>
                  </label>
                  <input
                    type="file"
                    id="product-gallery"
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, "gallery", "product")}
                  />
                  <p className="text-xs mt-1 text-gray-500">Upload multiple images for the product gallery</p>
                  {productForm?.gallery && productForm.gallery.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Selected files: {productForm.gallery.length}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(productForm.gallery).map((file, index) => (
                          <div key={index} className="badge badge-outline">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className={`absolute bottom-4 ${isRTL ? "right-4" : "left-4"}`}>
              <img src="/waves.png" alt="Decorative zigzag" className="w-16 h-full animate-float-zigzag" />
            </div>
          </form>
        </div>
      </div>

      {/* Create Section Form */}
      <div className="card shadow-lg">
        <div className="card-body p-6">
          <form onSubmit={onCreateSection}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{t("forms.createSection.title") || "Create Section"}</h3>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t("forms.createSection.submitButton") || "Create Section"
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("forms.createSection.fields.name") || "Name"} *</span>
                </label>
                <input
                  type="text"
                  placeholder={t("forms.createSection.placeholders.name") || "Enter section name"}
                  className="input input-bordered w-full"
                  value={sectionForm?.name || ""}
                  onChange={(e) => setSectionForm?.({ ...sectionForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("forms.createSection.fields.number") || "Number"} *</span>
                </label>
                <input
                  type="number"
                  placeholder={t("forms.createSection.placeholders.number") || "Enter section number"}
                  className="input input-bordered w-full"
                  value={sectionForm?.number || ""}
                  onChange={(e) => setSectionForm?.({ ...sectionForm, number: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createSection.fields.description") || "Description"} *
                  </span>
                </label>
                <textarea
                  placeholder={t("forms.createSection.placeholders.description") || "Enter section description"}
                  className="textarea textarea-bordered w-full h-32"
                  value={sectionForm?.description || ""}
                  onChange={(e) => setSectionForm?.({ ...sectionForm, description: e.target.value })}
                  required
                ></textarea>
              </div>
            </div>

            {/* Arrow decoration */}
            <div className="flex justify-center mt-6">
              <img src="/vector22.png" alt="Decorative arrow" className="w-15 h-8" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminForms
