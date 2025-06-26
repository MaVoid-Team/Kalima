"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  createSection,
  updateSection,
  deleteSection,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  createBook,
} from "../../../routes/market"
import Orders from "./Orders"
import { useAdminData } from "./UseAdminData"
import ExportSection from "./ExportSection"
import ProductsManagement from "./ProductsManagement"
import SectionsManagement from "./SectionsManagement"
import AdminForms from "./AdminForms"
import AdminModals from "./AdminModals"
import ErrorBoundary from "./ErrorBoundary"

const AdminPanel = () => {
  const { t, i18n } = useTranslation("kalimaStore-admin")
  const isRTL = i18n.language === "ar"

  // Use custom hook for data management
  const { loading, error, sections, books, products, subjects, stats, refetch, setSections, setBooks, setProducts,productsPagination,
    productsLoading,
    goToPage,
    changeItemsPerPage,
    searchProducts, } =
    useAdminData()

  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("product")
  const [isExporting, setIsExporting] = useState(false)

  // Form states
  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
    number: "",
    thumbnail: "logo",
  })

  const [productForm, setProductForm] = useState({
    title: "",
    serial: "",
    section: "",
    price: "",
    discountPercentage: "",
    paymentNumber: "",
    thumbnail: null,
    sample: null,
  })

  const [bookForm, setBookForm] = useState({
    title: "",
    serial: "",
    section: "",
    price: "",
    discountPercentage: "",
    subject: "",
    paymentNumber: "",
    description: "",
    thumbnail: null,
    sample: null,
    gallery: [],
  })

  // Modal states
  const [editingSection, setEditingSection] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState(null)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Export handlers
  const handleExportCSV = async (type, csvContent) => {
    setIsExporting(true)
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)

        const timestamp = new Date().toISOString().split("T")[0]
        const filename = `${type}-${timestamp}.csv`

        link.setAttribute("download", filename)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        const dataCount =
          type === "products" ? products.length + books.length : type === "sections" ? sections.length : books.length
        const successMessage = t("export.successMessage") || `Successfully exported ${dataCount} ${type}`
        alert(successMessage)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert(t("export.error") || "Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async (type, jsonData) => {
    setIsExporting(true)
    try {
      const jsonContent = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
      const link = document.createElement("a")

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)

        const timestamp = new Date().toISOString().split("T")[0]
        const filename = `${type}-${timestamp}.json`

        link.setAttribute("download", filename)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        const successMessage = t("export.successMessage") || `Successfully exported ${jsonData.length} ${type}`
        alert(successMessage)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert(t("export.error") || "Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // CRUD handlers with improved error handling
  const handleCreateBook = async (e) => {
    e.preventDefault()
    if (
      !bookForm.title ||
      !bookForm.serial ||
      !bookForm.section ||
      !bookForm.price ||
      !bookForm.paymentNumber ||
      !bookForm.subject
    ) {
      alert(t("alerts.fillRequiredFields") || "Please fill all required fields")
      return
    }

    try {
      setActionLoading(true)
      const response = await createBook({
        title: bookForm.title,
        serial: bookForm.serial,
        section: bookForm.section,
        price: bookForm.price,
        discountPercentage: bookForm.discountPercentage || "0",
        paymentNumber: bookForm.paymentNumber,
        subject: bookForm.subject,
        description: bookForm.description,
        thumbnail: bookForm.thumbnail,
        sample: bookForm.sample,
      })

      if (response?.message === "ECBook created successfully" || response?.status === "success") {
        // Reset form
        setBookForm({
          title: "",
          serial: "",
          section: "",
          price: "",
          discountPercentage: "",
          subject: "",
          paymentNumber: "",
          description: "",
          thumbnail: null,
          sample: null,
        })

        // Reset file inputs
        const thumbnailInput = document.getElementById("book-thumbnail")
        const sampleInput = document.getElementById("book-sample")
        if (thumbnailInput) thumbnailInput.value = ""
        if (sampleInput) sampleInput.value = ""

        alert(t("alerts.bookCreatedSuccess") || "Book created successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to create book")
      }
    } catch (err) {
      console.error("Error creating book:", err)
      alert((t("alerts.bookCreateError") || "Error creating book: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (
      !productForm.title ||
      !productForm.serial ||
      !productForm.section ||
      !productForm.price ||
      !productForm.paymentNumber
    ) {
      alert(t("alerts.fillRequiredFields") || "Please fill all required fields")
      return
    }

    try {
      setActionLoading(true)
      const response = await createProduct({
        title: productForm.title,
        serial: productForm.serial,
        section: productForm.section,
        price: productForm.price,
        discountPercentage: productForm.discountPercentage || "0",
        paymentNumber: productForm.paymentNumber,
        thumbnail: productForm.thumbnail,
        sample: productForm.sample,
        gallery: productForm.gallery,
        whatsAppNumber: productForm.whatsAppNumber,
        description: productForm.description,
      })

      if (response?.message === "Product created successfully" || response?.status === "success") {
        // Reset form
        setProductForm({
          title: "",
          serial: "",
          section: "",
          price: "",
          discountPercentage: "",
          paymentNumber: "",
          thumbnail: null,
          sample: null,
        })

        // Reset file inputs
        const thumbnailInput = document.getElementById("product-thumbnail")
        const sampleInput = document.getElementById("product-sample")
        if (thumbnailInput) thumbnailInput.value = ""
        if (sampleInput) sampleInput.value = ""

        alert(t("alerts.productCreatedSuccess") || "Product created successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to create product")
      }
    } catch (err) {
      console.error("Error creating product:", err)
      alert((t("alerts.productCreateError") || "Error creating product: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditProduct = async (product) => {
    if (!product?._id) {
      alert("Invalid product selected")
      return
    }

    try {
      setActionLoading(true)
      const response = await getProductById(product._id)

      if (response?.status === "success" && response?.data?.product) {
        const productData = response.data.product
        setEditingProduct(productData)
        setProductForm({
          title: productData.title || "",
          serial: productData.serial || "",
          section: productData.section?._id || productData.section || "",
          price: productData.price?.toString() || "",
          discountPercentage: productData.discountPercentage?.toString() || "",
          paymentNumber: productData.paymentNumber || "",
          thumbnail: null,
          sample: null,
        })
        setShowEditProductModal(true)
      } else {
        throw new Error(response?.error || "Failed to fetch product details")
      }
    } catch (err) {
      console.error("Error fetching product details:", err)
      alert((t("alerts.productFetchError") || "Error fetching product: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct?._id) return

    try {
      setActionLoading(true)
      const response = await updateProduct(editingProduct._id, {
        title: productForm.title,
        serial: productForm.serial,
        section: productForm.section,
        price: productForm.price,
        discountPercentage: productForm.discountPercentage,
        paymentNumber: productForm.paymentNumber,
        thumbnail: productForm.thumbnail,
        sample: productForm.sample,
      })

      if (response?.status === "success") {
        setShowEditProductModal(false)
        setEditingProduct(null)
        setProductForm({
          title: "",
          serial: "",
          section: "",
          price: "",
          discountPercentage: "",
          paymentNumber: "",
          thumbnail: null,
          sample: null,
        })

        // Reset file inputs
        const thumbnailInput = document.getElementById("edit-product-thumbnail")
        const sampleInput = document.getElementById("edit-product-sample")
        if (thumbnailInput) thumbnailInput.value = ""
        if (sampleInput) sampleInput.value = ""

        alert(t("alerts.productUpdatedSuccess") || "Product updated successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to update product")
      }
    } catch (err) {
      console.error("Error updating product:", err)
      alert((t("alerts.productUpdateError") || "Error updating product: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete?._id) return

    try {
      setActionLoading(true)
      const response = await deleteProduct(productToDelete._id)

      if (response?.status === "success" || response) {
        setShowDeleteProductModal(false)
        setProductToDelete(null)
        alert(t("alerts.productDeletedSuccess") || "Product deleted successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to delete product")
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      alert((t("alerts.productDeleteError") || "Error deleting product: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateSection = async (e) => {
    e.preventDefault()
    if (!sectionForm.name || !sectionForm.description || !sectionForm.number) {
      alert(t("alerts.fillRequiredFields") || "Please fill all required fields")
      return
    }

    try {
      setActionLoading(true)
      const response = await createSection({
        name: sectionForm.name,
        description: sectionForm.description,
        number: Number.parseInt(sectionForm.number),
        thumbnail: sectionForm.thumbnail,
      })

      if (response?.status === "success") {
        setSectionForm({
          name: "",
          description: "",
          number: "",
          thumbnail: "logo",
        })
        alert(t("alerts.sectionCreatedSuccess") || "Section created successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to create section")
      }
    } catch (err) {
      console.error("Error creating section:", err)
      alert((t("alerts.sectionCreateError") || "Error creating section: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSection = (section) => {
    if (!section?._id) {
      alert("Invalid section selected")
      return
    }

    setEditingSection(section)
    setSectionForm({
      name: section.name || "",
      description: section.description || "",
      number: section.number?.toString() || "",
      thumbnail: section.thumbnail || "logo",
    })
    setShowEditModal(true)
  }

  const handleUpdateSection = async (e) => {
    e.preventDefault()
    if (!editingSection?._id) return

    try {
      setActionLoading(true)
      const response = await updateSection(editingSection._id, {
        name: sectionForm.name,
        description: sectionForm.description,
        number: Number.parseInt(sectionForm.number),
        thumbnail: sectionForm.thumbnail,
      })

      if (response?.status === "success") {
        setShowEditModal(false)
        setEditingSection(null)
        setSectionForm({
          name: "",
          description: "",
          number: "",
          thumbnail: "logo",
        })
        alert(t("alerts.sectionUpdatedSuccess") || "Section updated successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to update section")
      }
    } catch (err) {
      console.error("Error updating section:", err)
      alert((t("alerts.sectionUpdateError") || "Error updating section: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSection = async () => {
    if (!sectionToDelete?._id) return

    try {
      setActionLoading(true)
      const response = await deleteSection(sectionToDelete._id)

      if (response?.status === "success" || response) {
        setShowDeleteModal(false)
        setSectionToDelete(null)
        alert(t("alerts.sectionDeletedSuccess") || "Section deleted successfully")
        await refetch()
      } else {
        throw new Error(response?.error || "Failed to delete section")
      }
    } catch (err) {
      console.error("Error deleting section:", err)
      alert((t("alerts.sectionDeleteError") || "Error deleting section: ") + (err?.message || "Unknown error"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleFileChange = (e, fieldName, formType = "product") => {
    const files = e.target.files

    if (formType === "product") {
      setProductForm((prev) => ({
        ...prev,
        [fieldName]: fieldName === "gallery" ? files : files[0],
      }))
    } else if (formType === "book") {
      setBookForm((prev) => ({
        ...prev,
        [fieldName]: fieldName === "gallery" ? files : files[0],
      }))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">{t("error.title") || "Error"}</h3>
            <div className="text-xs">{error}</div>
            <button className="btn btn-sm btn-outline mt-2" onClick={() => refetch()}>
              {t("error.retry") || "Retry"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        <Orders />

        <ExportSection
          products={products}
          books={books}
          sections={sections}
          subjects={subjects}
          isExporting={isExporting}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />

        <div className="px-4 py-8">
          <ProductsManagement
            products={products}
            books={books}
            sections={sections}
            subjects={subjects}
            productSearchQuery={productSearchQuery}
            setProductSearchQuery={setProductSearchQuery}
            onEditProduct={handleEditProduct}
            onDeleteProduct={(product) => {
              setProductToDelete(product)
              setShowDeleteProductModal(true)
            }}
            actionLoading={actionLoading}
            isRTL={isRTL}
            productsPagination={productsPagination}
            productsLoading={productsLoading}
            onPageChange={goToPage}
            onItemsPerPageChange={changeItemsPerPage}
            onSearch={searchProducts}
          />

          <SectionsManagement
            sections={sections}
            products={products}
            books={books}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onEditSection={handleEditSection}
            onDeleteSection={(section) => {
              setSectionToDelete(section)
              setShowDeleteModal(true)
            }}
            actionLoading={actionLoading}
            isRTL={isRTL}
          />

          <AdminForms
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            productForm={productForm}
            setProductForm={setProductForm}
            bookForm={bookForm}
            setBookForm={setBookForm}
            sectionForm={sectionForm}
            setSectionForm={setSectionForm}
            sections={sections}
            subjects={subjects}
            onCreateProduct={handleCreateProduct}
            onCreateBook={handleCreateBook}
            onCreateSection={handleCreateSection}
            onFileChange={handleFileChange}
            actionLoading={actionLoading}
            isRTL={isRTL}
          />

          {/* Bottom decorative elements */}
          <div className="relative">
            <div className={`absolute bottom-16 ${isRTL ? "right-10" : "left-10"}`}>
              <img src="/rDots.png" alt="Decorative dots" className="w-16 h-full animate-float-up-dottedball" />
            </div>
            <div className={`absolute bottom-8 ${isRTL ? "left-10" : "right-10"}`}>
              <img src="/ring.png" alt="Decorative circle" className="w-16 h-full animate-float-down-dottedball" />
            </div>
          </div>
        </div>

        <AdminModals
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          editingSection={editingSection}
          setEditingSection={setEditingSection}
          sectionForm={sectionForm}
          setSectionForm={setSectionForm}
          onUpdateSection={handleUpdateSection}
          showEditProductModal={showEditProductModal}
          setShowEditProductModal={setShowEditProductModal}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          onUpdateProduct={handleUpdateProduct}
          sections={sections}
          onFileChange={handleFileChange}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          sectionToDelete={sectionToDelete}
          setSectionToDelete={setSectionToDelete}
          onDeleteSection={handleDeleteSection}
          showDeleteProductModal={showDeleteProductModal}
          setShowDeleteProductModal={setShowDeleteProductModal}
          productToDelete={productToDelete}
          setProductToDelete={setProductToDelete}
          onDeleteProduct={handleDeleteProduct}
          actionLoading={actionLoading}
        />
      </div>
    </ErrorBoundary>
  )
}

export default AdminPanel
