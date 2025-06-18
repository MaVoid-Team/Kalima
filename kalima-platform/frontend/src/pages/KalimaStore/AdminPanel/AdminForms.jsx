"use client"
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Create Product/Book Form with Tabs */}
      <div className="card shadow-lg relative">
        <div className="card-body p-6">
          {/* Tab Navigation */}
          <div className="tabs tabs-border mb-6">
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

              {/* Book-specific description field */}
              {activeTab === "book" && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createBook.fields.description") || "Description"} *
                    </span>
                  </label>
                  <textarea
                    placeholder={t("forms.createBook.placeholders.description") || "Enter book description..."}
                    className="textarea textarea-bordered w-full h-32"
                    value={bookForm?.description || ""}
                    onChange={(e) => setBookForm?.({ ...bookForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("forms.createProduct.fields.thumbnail") || "Thumbnail"}
                  </span>
                </label>
                <input
                  type="file"
                  id={`${activeTab}-thumbnail`}
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={(e) => onFileChange?.(e, "thumbnail", activeTab)}
                />
                <p className="text-xs mt-1">{t("forms.createProduct.hints.thumbnail") || "Upload thumbnail image"}</p>
              </div>

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
                  onChange={(e) => onFileChange?.(e, "sample", activeTab)}
                />
                <p className="text-xs mt-1">{t("forms.createProduct.hints.sampleFile") || "Upload sample file"}</p>
              </div>
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
