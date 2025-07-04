"use client"
import { useTranslation } from "react-i18next"

const AdminModals = ({
  // Edit Section Modal
  showEditModal,
  setShowEditModal,
  editingSection,
  setEditingSection,
  sectionForm,
  setSectionForm,
  onUpdateSection,

  // Edit Product Modal
  showEditProductModal,
  setShowEditProductModal,
  editingProduct,
  setEditingProduct,
  productForm,
  setProductForm,
  onUpdateProduct,
  sections = [],
  subjects = [],
  onFileChange,

  // Delete Section Modal
  showDeleteModal,
  setShowDeleteModal,
  sectionToDelete,
  setSectionToDelete,
  onDeleteSection,

  // Delete Product Modal
  showDeleteProductModal,
  setShowDeleteProductModal,
  productToDelete,
  setProductToDelete,
  onDeleteProduct,

  actionLoading,
}) => {
  const { t } = useTranslation("kalimaStore-admin")

  const resetSectionForm = () => {
    setSectionForm?.({
      name: "",
      description: "",
      number: "",
      thumbnail: "logo",
    })
  }

  const resetProductForm = () => {
    setProductForm?.({
      title: "",
      serial: "",
      section: "",
      price: "",
      discountPercentage: "",
      paymentNumber: "",
      whatsAppNumber: "",
      description: "",
      thumbnail: null,
      sample: null,
      gallery: [],
    })
  }

  return (
    <>
      {/* Edit Section Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t("modals.editSection.title") || "Edit Section"}</h3>
            <form onSubmit={onUpdateSection}>
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
                    <span className="label-text font-medium">
                      {t("forms.createSection.fields.number") || "Number"} *
                    </span>
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
                    className="textarea textarea-bordered w-full h-24"
                    value={sectionForm?.description || ""}
                    onChange={(e) => setSectionForm?.({ ...sectionForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createSection.fields.thumbnail") || "Thumbnail"}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createSection.placeholders.thumbnail") || "Enter thumbnail"}
                    className="input input-bordered w-full"
                    value={sectionForm?.thumbnail || ""}
                    onChange={(e) => setSectionForm?.({ ...sectionForm, thumbnail: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEditModal?.(false)
                    setEditingSection?.(null)
                    resetSectionForm()
                  }}
                >
                  {t("modals.editSection.cancelButton") || "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t("modals.editSection.updateButton") || "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">{t("modals.editProduct.title") || "Edit Product"}</h3>
            <form onSubmit={onUpdateProduct}>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.title") || "Title"} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.title") || "Enter title"}
                    className="input input-bordered w-full"
                    value={productForm?.title || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createProduct.fields.serial") || "Serial"} *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.serial") || "Enter serial"}
                    className="input input-bordered w-full"
                    value={productForm?.serial || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, serial: e.target.value })}
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
                    value={productForm?.section || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, section: e.target.value })}
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

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.price") || "Price"} *</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                    value={productForm?.price || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, price: e.target.value })}
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
                    value={productForm?.discountPercentage || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, discountPercentage: e.target.value })}
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
                    value={productForm?.paymentNumber || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, paymentNumber: e.target.value })}
                    required
                  />
                </div>

                {/* WhatsApp Number field */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.whatsAppNumber") || "WhatsApp Number"} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.whatsAppNumber") || "Enter WhatsApp number"}
                    className="input input-bordered w-full"
                    value={productForm?.whatsAppNumber || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, whatsAppNumber: e.target.value })}
                    required
                  />
                </div>

                {/* Description field */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.description") || "Description"} *</span>
                  </label>
                  <textarea
                    placeholder={t("forms.createProduct.placeholders.description") || "Enter product description..."}
                    className="textarea textarea-bordered w-full h-24"
                    value={productForm?.description || ""}
                    onChange={(e) => setProductForm?.({ ...productForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createProduct.fields.thumbnail") || "Thumbnail"}
                    </span>
                  </label>
                  <input
                    type="file"
                    id="edit-product-thumbnail"
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    onChange={(e) => onFileChange?.(e, "thumbnail")}
                  />
                  <p className="text-xs mt-1">
                    {t("modals.editProduct.leaveEmptyToKeep") || "Leave empty to keep current thumbnail"}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("forms.createProduct.fields.sampleFile") || "Sample File"}
                    </span>
                  </label>
                  <input
                    type="file"
                    id="edit-product-sample"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => onFileChange?.(e, "sample")}
                  />
                  <p className="text-xs mt-1">
                    {t("modals.editProduct.leaveEmptyToKeep") || "Leave empty to keep current sample file"}
                  </p>
                </div>

                {/* Gallery field */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("galleryImages")}</span>
                  </label>
                  <input
                    type="file"
                    id="edit-product-gallery"
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    multiple
                    onChange={(e) => onFileChange?.(e, "gallery", "product")}
                  />
                  <p className="text-xs mt-1">
                    {t("modals.editProduct.leaveEmptyToKeep") || "Leave empty to keep current gallery images"}
                  </p>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEditProductModal?.(false)
                    setEditingProduct?.(null)
                    resetProductForm()
                  }}
                >
                  {t("modals.editProduct.cancelButton") || "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t("modals.editProduct.updateButton") || "Update Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("modals.deleteSection.title") || "Confirm Delete"}</h3>
            <p className="py-4">
              {t("modals.deleteSection.message", { sectionName: sectionToDelete?.name || t("unknown") }) ||
                `Are you sure you want to delete the section "${sectionToDelete?.name || t("unknown")}"? This action cannot be undone.`}
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal?.(false)
                  setSectionToDelete?.(null)
                }}
              >
                {t("modals.deleteSection.cancelButton") || "Cancel"}
              </button>
              <button className="btn btn-error" onClick={onDeleteSection} disabled={actionLoading}>
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t("modals.deleteSection.deleteButton") || "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {showDeleteProductModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("modals.deleteProduct.title") || "Confirm Delete"}</h3>
            <p className="py-4">
              {t("modals.deleteProduct.message", { productName: productToDelete?.title || t("unknown") }) ||
                `Are you sure you want to delete the product "${productToDelete?.title || t("unknown")}"? This action cannot be undone.`}
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteProductModal?.(false)
                  setProductToDelete?.(null)
                }}
              >
                {t("modals.deleteProduct.cancelButton") || "Cancel"}
              </button>
              <button className="btn btn-error" onClick={onDeleteProduct} disabled={actionLoading}>
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t("modals.deleteProduct.deleteButton") || "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminModals
