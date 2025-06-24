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

              {/* Thumbnail Field */}
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

              {/* WhatsApp Number field - for both fields */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">WhatsApp Number *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter WhatsApp number"
                    className="input input-bordered w-full"
                    value={productForm?.whatsAppNumber || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, whatsAppNumber: e.target.value })}
                    required
                  />
                  <p className="text-xs mt-1">Enter the WhatsApp number for customer contact</p>
                </div>

              {/* Sample File Field */}
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

              {/* Description Field - Required for both products and books */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {activeTab === "product" ? "Description" : t("forms.createBook.fields.description") || "Description"} *
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
                <p className="text-xs mt-1">
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
                    onChange={(e) => onFileChange?.(e, "gallery", "product")}
                  />
                  <p className="text-xs mt-1">Upload multiple images for the product gallery</p>
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
