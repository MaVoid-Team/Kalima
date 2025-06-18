"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FaDownload, FaFileExport } from "react-icons/fa"
import {
  getAllSections,
  getAllBooks,
  getAllProducts,
  createSection,
  updateSection,
  deleteSection,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  createBook,
} from "../../routes/market"
import { getAllSubjects } from "../../routes/courses"
import Orders from "./Orders"

const AdminPanel = () => {
  const { t, i18n } = useTranslation("kalimaStore-admin")
  const isRTL = i18n.language === "ar"

  const [searchQuery, setSearchQuery] = useState("")
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  const [selectedSectionType, setSelectedSectionType] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("product")
  const [isExporting, setIsExporting] = useState(false)

  // Real data states
  const [sections, setSections] = useState([])
  const [books, setBooks] = useState([])
  const [products, setProducts] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingApplications: 0,
    totalProducts: 0,
    totalSections: 0,
  })

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

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [sectionsResponse, booksResponse, productsResponse, subjectsResponse] = await Promise.all([
        getAllSections(),
        getAllBooks(),
        getAllProducts(),
        getAllSubjects(),
      ])
      console.log("Sections Response:", sectionsResponse)
      console.log("Books Response:", booksResponse)
      console.log("Products Response:", productsResponse)
      console.log("Subjects Response:", subjectsResponse)

      // Process sections data
      if (sectionsResponse.status === "success") {
        setSections(sectionsResponse.data.sections)
      }

      // Process books data
      if (booksResponse.status === "success") {
        setBooks(booksResponse.data.books)
      }

      // Process products data
      if (productsResponse.status === "success") {
        setProducts(productsResponse.data.products)
      }

      // Process subjects data
      if (subjectsResponse.success) {
        setSubjects(subjectsResponse.data)
      }

      // Calculate statistics
      const totalProducts = (productsResponse.results || 0)
      const totalSections = sectionsResponse.data?.sections?.length || 0

      // Calculate total sales (sum of all product prices)
      const booksTotal =
        booksResponse.data?.books?.reduce((sum, book) => sum + (book.priceAfterDiscount || book.price || 0), 0) || 0
      const productsTotal =
        productsResponse.data?.products?.reduce(
          (sum, product) => sum + (product.priceAfterDiscount || product.price || 0),
          0,
        ) || 0
      const totalSales = booksTotal + productsTotal

      setStats({
        totalSales: totalSales,
        pendingApplications: 50, // This would come from a different API
        totalProducts: totalProducts,
        totalSections: totalSections,
      })
    } catch (err) {
      setError(err.message)
      console.error("Error fetching admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Export functionality
  const convertToCSV = (data, type) => {
    let headers = []
    let csvContent = ""

    switch (type) {
      case "products":
        headers = [
          t("export.title") || "Title",
          t("export.serial") || "Serial",
          t("export.section") || "Section",
          t("export.subject") || "Subject",
          t("export.price") || "Price",
          t("export.discount") || "Discount %",
          t("export.finalPrice") || "Final Price",
          t("export.paymentNumber") || "Payment Number",
          t("export.type") || "Type",
          t("export.createdDate") || "Created Date",
        ]

        const allProducts = [...products, ...books]
        csvContent = [
          headers.join(","),
          ...allProducts.map((item) => {
            const isBook = books.some((book) => book._id === item._id)
            const finalPrice = item.discountPercentage > 0 
              ? formatPrice(item.price, item.discountPercentage) 
              : item.price

            return [
              `"${item.title || ""}"`,
              `"${item.serial || ""}"`,
              `"${getSectionName(item.section)}"`,
              `"${isBook && item.subject ? getSubjectName(item.subject) : "-"}"`,
              `"${item.price || 0}"`,
              `"${item.discountPercentage || 0}"`,
              `"${finalPrice}"`,
              `"${item.paymentNumber || ""}"`,
              `"${isBook ? "Book" : "Product"}"`,
              `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}"`,
            ].join(",")
          }),
        ].join("\n")
        break

      case "sections":
        headers = [
          t("export.name") || "Name",
          t("export.number") || "Number",
          t("export.description") || "Description",
          t("export.productCount") || "Product Count",
          t("export.thumbnail") || "Thumbnail",
          t("export.createdDate") || "Created Date",
        ]

        csvContent = [
          headers.join(","),
          ...sectionsWithCounts.map((section) =>
            [
              `"${section.name || ""}"`,
              `"${section.number || ""}"`,
              `"${section.description || ""}"`,
              `"${section.productCount || 0}"`,
              `"${section.thumbnail || ""}"`,
              `"${section.createdAt ? new Date(section.createdAt).toLocaleDateString() : ""}"`,
            ].join(",")
          ),
        ].join("\n")
        break

      case "books":
        headers = [
          t("export.title") || "Title",
          t("export.serial") || "Serial",
          t("export.section") || "Section",
          t("export.subject") || "Subject",
          t("export.price") || "Price",
          t("export.discount") || "Discount %",
          t("export.finalPrice") || "Final Price",
          t("export.description") || "Description",
          t("export.paymentNumber") || "Payment Number",
          t("export.createdDate") || "Created Date",
        ]

        csvContent = [
          headers.join(","),
          ...books.map((book) => {
            const finalPrice = book.discountPercentage > 0 
              ? formatPrice(book.price, book.discountPercentage) 
              : book.price

            return [
              `"${book.title || ""}"`,
              `"${book.serial || ""}"`,
              `"${getSectionName(book.section)}"`,
              `"${book.subject ? getSubjectName(book.subject) : ""}"`,
              `"${book.price || 0}"`,
              `"${book.discountPercentage || 0}"`,
              `"${finalPrice}"`,
              `"${book.description || ""}"`,
              `"${book.paymentNumber || ""}"`,
              `"${book.createdAt ? new Date(book.createdAt).toLocaleDateString() : ""}"`,
            ].join(",")
          }),
        ].join("\n")
        break

      default:
        return ""
    }

    return csvContent
  }

  const exportToCSV = async (type) => {
    setIsExporting(true)

    try {
      const csvContent = convertToCSV(null, type)

      if (!csvContent) {
        throw new Error("No data to export")
      }

      // Create blob and download
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

        // Show success message
        const dataCount = type === "products" ? products.length + books.length : 
                         type === "sections" ? sections.length : books.length
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

  const exportToJSON = async (type) => {
    setIsExporting(true)

    try {
      let jsonData = []

      switch (type) {
        case "products":
          const allProducts = [...products, ...books]
          jsonData = allProducts.map((item) => {
            const isBook = books.some((book) => book._id === item._id)
            const finalPrice = item.discountPercentage > 0 
              ? formatPrice(item.price, item.discountPercentage) 
              : item.price

            return {
              id: item._id,
              title: item.title || "",
              serial: item.serial || "",
              section: getSectionName(item.section),
              subject: isBook && item.subject ? getSubjectName(item.subject) : null,
              price: item.price || 0,
              discountPercentage: item.discountPercentage || 0,
              finalPrice: finalPrice,
              paymentNumber: item.paymentNumber || "",
              type: isBook ? "Book" : "Product",
              description: item.description || "",
              createdAt: item.createdAt || "",
            }
          })
          break

        case "sections":
          jsonData = sectionsWithCounts.map((section) => ({
            id: section._id,
            name: section.name || "",
            number: section.number || "",
            description: section.description || "",
            productCount: section.productCount || 0,
            thumbnail: section.thumbnail || "",
            createdAt: section.createdAt || "",
          }))
          break

        case "books":
          jsonData = books.map((book) => {
            const finalPrice = book.discountPercentage > 0 
              ? formatPrice(book.price, book.discountPercentage) 
              : book.price

            return {
              id: book._id,
              title: book.title || "",
              serial: book.serial || "",
              section: getSectionName(book.section),
              subject: book.subject ? getSubjectName(book.subject) : "",
              price: book.price || 0,
              discountPercentage: book.discountPercentage || 0,
              finalPrice: finalPrice,
              description: book.description || "",
              paymentNumber: book.paymentNumber || "",
              createdAt: book.createdAt || "",
            }
          })
          break

        default:
          throw new Error("Invalid export type")
      }

      const jsonContent = JSON.stringify(jsonData, null, 2)

      // Create blob and download
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

        // Show success message
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
      alert(t("alerts.fillRequiredFields"))
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

      if (response.message === "ECBook created successfully") {
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

        // Refresh data
        alert(t("alerts.bookCreatedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error creating book:", err)
      alert(t("alerts.bookCreateError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle product form submission
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (
      !productForm.title ||
      !productForm.serial ||
      !productForm.section ||
      !productForm.price ||
      !productForm.paymentNumber
    ) {
      alert(t("alerts.fillRequiredFields"))
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
      })

      if (response.message === "Product created successfully") {
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

        // Refresh data
        alert(t("alerts.productCreatedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error creating product:", err)
      alert(t("alerts.productCreateError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle edit product
  const handleEditProduct = async (product) => {
    try {
      setActionLoading(true)
      // Get the latest product data
      const response = await getProductById(product._id)
      if (response.status === "success") {
        const productData = response.data.product
        setEditingProduct(productData)
        setProductForm({
          title: productData.title,
          serial: productData.serial,
          section: productData.section._id || productData.section,
          price: productData.price.toString(),
          discountPercentage: productData.discountPercentage ? productData.discountPercentage.toString() : "",
          paymentNumber: productData.paymentNumber,
          thumbnail: null, // We don't set the file objects here
          sample: null,
        })
        setShowEditProductModal(true)
      }
    } catch (err) {
      console.error("Error fetching product details:", err)
      alert(t("alerts.productFetchError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

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

      if (response.status === "success") {
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

        alert(t("alerts.productUpdatedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error updating product:", err)
      alert(t("alerts.productUpdateError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      setActionLoading(true)
      const response = await deleteProduct(productToDelete._id)

      if (response.status === "success") {
        setShowDeleteProductModal(false)
        setProductToDelete(null)
        alert(t("alerts.productDeletedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      alert(t("alerts.productDeleteError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle section form submission
  const handleCreateSection = async (e) => {
    e.preventDefault()
    if (!sectionForm.name || !sectionForm.description || !sectionForm.number) {
      alert(t("alerts.fillRequiredFields"))
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

      if (response.status === "success") {
        // Reset form
        setSectionForm({
          name: "",
          description: "",
          number: "",
          thumbnail: "logo",
        })
        // Refresh data
        alert(t("alerts.sectionCreatedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error creating section:", err)
      alert(t("alerts.sectionCreateError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle edit section
  const handleEditSection = (section) => {
    setEditingSection(section)
    setSectionForm({
      name: section.name,
      description: section.description,
      number: section.number.toString(),
      thumbnail: section.thumbnail || "logo",
    })
    setShowEditModal(true)
  }

  // Handle update section
  const handleUpdateSection = async (e) => {
    e.preventDefault()
    if (!editingSection) return

    try {
      setActionLoading(true)
      const response = await updateSection(editingSection._id, {
        name: sectionForm.name,
        description: sectionForm.description,
        number: Number.parseInt(sectionForm.number),
        thumbnail: sectionForm.thumbnail,
      })

      if (response.status === "success") {
        setShowEditModal(false)
        setEditingSection(null)
        setSectionForm({
          name: "",
          description: "",
          number: "",
          thumbnail: "logo",
        })
        alert(t("alerts.sectionUpdatedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error updating section:", err)
      alert(t("alerts.sectionUpdateError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete section
  const handleDeleteSection = async () => {
    if (!sectionToDelete) return

    try {
      setActionLoading(true)
      const response = await deleteSection(sectionToDelete._id)

      if (response) {
        setShowDeleteModal(false)
        setSectionToDelete(null)
        alert(t("alerts.sectionDeletedSuccess"))
        await fetchData()
      }
    } catch (err) {
      console.error("Error deleting section:", err)
      alert(t("alerts.sectionDeleteError") + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle file input changes
  const handleFileChange = (e, fieldName, formType = "product") => {
    const file = e.target.files[0]
    if (formType === "product") {
      setProductForm({ ...productForm, [fieldName]: file })
    } else if (formType === "book") {
      setBookForm({ ...bookForm, [fieldName]: file })
    }
  }

  // Filter sections based on search
  const filteredSections = sections.filter((section) => section.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  // Calculate products per section
  const sectionsWithCounts = filteredSections.map((section) => {
    const sectionProducts = products.filter(
      (product) => product.section && (product.section._id === section._id || product.section === section._id),
    )
    const sectionBooks = books.filter((book) => book.section === section._id)
    return {
      ...section,
      productCount: sectionProducts.length + sectionBooks.length,
    }
  })

  // Get section name by ID
  const getSectionName = (sectionId) => {
    const section = sections.find(
      (s) => s._id === sectionId || (typeof sectionId === "object" && s._id === sectionId._id),
    )
    return section ? section.name : t("products.unknownSection")
  }

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(
      (s) => s._id === subjectId || (typeof subjectId === "object" && s._id === subjectId._id),
    )
    return subject ? subject.name : "Unknown Subject"
  }

  // Format price with discount
  const formatPrice = (price, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) {
      return price
    }
    const discountAmount = (price * discountPercentage) / 100
    return (price - discountAmount).toFixed(2)
  }

  // Stats data with real values
  const statsData = [
    {
      title: t("stats.totalSales"),
      value: `${stats.totalSales}`,
      icon: "💰",
      bgColor: "bg-green-800/50",
      textColor: "text-white",
    },
    {
      title: t("stats.pendingApplications"),
      value: stats.pendingApplications.toString(),
      icon: "⏳",
      bgColor: "bg-orange-800/50",
      textColor: "text-white",
    },
    {
      title: t("stats.numberOfProducts"),
      value: stats.totalProducts,
      icon: "📦",
      bgColor: "bg-blue-800/50",
      textColor: "text-white",
    },
    {
      title: t("stats.numberOfSections"),
      value: stats.totalSections.toString(),
      icon: "📚",
      bgColor: "bg-purple-800/50",
      textColor: "text-white",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

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
            <h3 className="font-bold">{t("error.title")}</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Orders />
      
      {/* Export Section */}
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("adminPanel.title") || "Admin Panel"}</h1>
            <p className="text-base-content/70">{t("adminPanel.subtitle") || "Manage products, books, and sections"}</p>
          </div>

          {/* Export Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline btn-primary" disabled={isExporting}>
              {isExporting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {t("export.exporting") || "Exporting..."}
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  {t("export.export") || "Export Data"}
                </>
              )}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80">
              <li className="menu-title">
                <span>{t("export.csvFormat") || "CSV Format"}</span>
              </li>
              <li>
                <button 
                  onClick={() => exportToCSV("products")} 
                  disabled={isExporting || (products.length + books.length) === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.allProducts") || "All Products & Books"} ({products.length + books.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => exportToCSV("books")} 
                  disabled={isExporting || books.length === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.booksOnly") || "Books Only"} ({books.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => exportToCSV("sections")} 
                  disabled={isExporting || sections.length === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.sections") || "Sections"} ({sections.length})
                </button>
              </li>
              <div className="divider my-1"></div>
              <li className="menu-title">
                <span>{t("export.jsonFormat") || "JSON Format"}</span>
              </li>
              <li>
                <button 
                  onClick={() => exportToJSON("products")} 
                  disabled={isExporting || (products.length + books.length) === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.allProducts") || "All Products & Books"} ({products.length + books.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => exportToJSON("books")} 
                  disabled={isExporting || books.length === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.booksOnly") || "Books Only"} ({books.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => exportToJSON("sections")} 
                  disabled={isExporting || sections.length === 0}
                >
                  <FaFileExport className="mr-2" />
                  {t("export.sections") || "Sections"} ({sections.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Export Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-primary/10 rounded-lg p-4">
            <div className="stat-title">{t("export.totalProducts") || "Total Products"}</div>
            <div className="stat-value text-primary">{products.length}</div>
          </div>
          <div className="stat bg-secondary/10 rounded-lg p-4">
            <div className="stat-title">{t("export.totalBooks") || "Total Books"}</div>
            <div className="stat-value text-secondary">{books.length}</div>
          </div>
          <div className="stat bg-accent/10 rounded-lg p-4">
            <div className="stat-title">{t("export.totalSections") || "Total Sections"}</div>
            <div className="stat-value text-accent">{sections.length}</div>
          </div>
          <div className="stat bg-info/10 rounded-lg p-4">
            <div className="stat-title">{t("export.totalItems") || "Total Items"}</div>
            <div className="stat-value text-info">{products.length + books.length + sections.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-8">

        {/* Products Management */}
        <div className="mb-12">
          <div className="flex items-center justify-center relative mb-8">
            {/* Decorative elements */}
            <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
              <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
            </div>
            <h2 className="text-3xl font-bold text-center">{t("productsManagement.title") || "Products Management"}</h2>
            <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
              <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={t("productsManagement.searchPlaceholder") || "Search products..."}
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className={`input input-bordered w-full ${isRTL ? "pr-4 pl-12" : "pl-4 pr-12"}`}
              />
              <button
                className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm`}
              >
                🔍
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="card shadow-lg overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-center">{t("productsManagement.table.thumbnail") || "Thumbnail"}</th>
                    <th className="text-center">{t("productsManagement.table.title") || "Title"}</th>
                    <th className="text-center">{t("productsManagement.table.serial") || "Serial"}</th>
                    <th className="text-center">{t("productsManagement.table.section") || "Section"}</th>
                    <th className="text-center">Subject</th>
                    <th className="text-center">{t("productsManagement.table.price") || "Price"}</th>
                    <th className="text-center">{t("productsManagement.table.discount") || "Discount"}</th>
                    <th className="text-center">{t("productsManagement.table.finalPrice") || "Final Price"}</th>
                    <th className="text-center">{t("productsManagement.table.actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="text-center">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded">
                            <img
                              src={product.thumbnail || "/placeholder.svg?height=48&width=48"}
                              alt={product.title}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg?height=48&width=48"
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-medium">{product.title}</td>
                      <td className="text-center">{product.serial}</td>
                      <td className="text-center">{getSectionName(product.section)}</td>
                      <td className="text-center">{product.subject ? getSubjectName(product.subject) : "-"}</td>
                      <td className="text-center">{product.price}</td>
                      <td className="text-center">
                        {product.discountPercentage > 0 ? `${product.discountPercentage}%` : "-"}
                      </td>
                      <td className="text-center">
                        {product.discountPercentage > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {formatPrice(product.price, product.discountPercentage)}
                            </span>
                            <span className="text-xs line-through text-gray-500">{product.price}</span>
                          </div>
                        ) : (
                          product.price
                        )}
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            title={t("productsManagement.table.edit") || "Edit"}
                            onClick={() => handleEditProduct(product)}
                            disabled={actionLoading}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            title={t("productsManagement.table.delete") || "Delete"}
                            onClick={() => {
                              setProductToDelete(product)
                              setShowDeleteProductModal(true)
                            }}
                            disabled={actionLoading}
                          >
                            🗑️
                          </button>
                          <button className="btn btn-ghost btn-sm" title={t("productsManagement.table.view") || "View"}>
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">{t("productsManagement.noProducts") || "No products found"}</p>
              </div>
            )}

            {/* Decorative dots */}
            <div className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"}`}>
              <img src="/rDots.png" alt="Decorative dots" className="w-16 h-full animate-float-down-dottedball" />
            </div>
          </div>
        </div>

        {/* Sections Management */}
        <div className="mb-12">
          <div className="flex items-center justify-center relative mb-8">
            {/* Decorative elements */}
            <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
              <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
            </div>
            <h2 className="text-3xl font-bold text-center">{t("sectionsManagement.title")}</h2>
            <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
              <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder={t("sectionsManagement.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`input input-bordered w-full ${isRTL ? "pr-4 pl-12" : "pl-4 pr-12"}`}
              />
              <button
                className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm`}
              >
                🔍
              </button>
            </div>
          </div>

          {/* Sections Table */}
          <div className="card shadow-lg overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-center">{t("sectionsManagement.table.name")}</th>
                    <th className="text-center">{t("sectionsManagement.table.sectionNumber")}</th>
                    <th className="text-center">{t("sectionsManagement.table.numberOfProducts")}</th>
                    <th className="text-center">{t("sectionsManagement.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionsWithCounts.map((section) => (
                    <tr key={section._id}>
                      <td className="text-center font-medium">{section.name}</td>
                      <td className="text-center">{section.number}</td>
                      <td className="text-center">{section.productCount}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEditSection(section)}
                            disabled={actionLoading}
                            title={t("sectionsManagement.table.edit")}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setSectionToDelete(section)
                              setShowDeleteModal(true)
                            }}
                            disabled={actionLoading}
                            title={t("sectionsManagement.table.delete")}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Decorative dots */}
            <div className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"}`}>
              <img src="/rDots.png" alt="Decorative dots" className="w-16 h-full animate-float-down-dottedball" />
            </div>
          </div>
        </div>
        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Create Product/Book Form with Tabs */}
          <div className="card shadow-lg relative">
            <div className="card-body p-6">
              {/* Tab Navigation */}
              <div className="tabs tabs-border mb-6">
                <button
                  className={`tab ${activeTab === "product" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("product")}
                >
                  {t("forms.createProduct.title")}
                </button>
                <button
                  className={`tab ${activeTab === "book" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("book")}
                >
                  Create Book
                </button>
              </div>

              <form onSubmit={activeTab === "product" ? handleCreateProduct : handleCreateBook}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">
                    {activeTab === "product" ? t("forms.createProduct.title") : "Create Book"}
                  </h3>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : activeTab === "product" ? (
                      t("forms.createProduct.submitButton")
                    ) : (
                      "Create Book"
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.title")} *</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("forms.createProduct.placeholders.title")}
                      className="input input-bordered w-full"
                      value={activeTab === "product" ? productForm.title : bookForm.title}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, title: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, title: e.target.value })
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.serial")} *</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("forms.createProduct.placeholders.serial")}
                      className="input input-bordered w-full"
                      value={activeTab === "product" ? productForm.serial : bookForm.serial}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, serial: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, serial: e.target.value })
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.section")} *</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={activeTab === "product" ? productForm.section : bookForm.section}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, section: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, section: e.target.value })
                        }
                      }}
                      required
                    >
                      <option value="">{t("forms.createProduct.placeholders.section")}</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject field - only for books */}
                  {activeTab === "book" && (
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Subject *</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={bookForm.subject}
                        onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                        required
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.price")} *</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input input-bordered w-full"
                      value={activeTab === "product" ? productForm.price : bookForm.price}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, price: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, price: e.target.value })
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        {t("forms.createProduct.fields.discountPercentage")}
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="input input-bordered w-full"
                      value={activeTab === "product" ? productForm.discountPercentage : bookForm.discountPercentage}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, discountPercentage: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, discountPercentage: e.target.value })
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.paymentNumber")} *</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("forms.createProduct.placeholders.paymentNumber")}
                      className="input input-bordered w-full"
                      value={activeTab === "product" ? productForm.paymentNumber : bookForm.paymentNumber}
                      onChange={(e) => {
                        if (activeTab === "product") {
                          setProductForm({ ...productForm, paymentNumber: e.target.value })
                        } else {
                          setBookForm({ ...bookForm, paymentNumber: e.target.value })
                        }
                      }}
                      required
                    />
                  </div>

                  {/* Book-specific description field */}
                  {activeTab === "book" && (
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Description *</span>
                      </label>
                      <textarea
                        placeholder="Enter book description..."
                        className="textarea textarea-bordered w-full h-32"
                        value={bookForm.description || ""}
                        onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  )}

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.thumbnail")}</span>
                    </label>
                    <input
                      type="file"
                      id={`${activeTab}-thumbnail`}
                      className="file-input file-input-bordered w-full"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "thumbnail", activeTab)}
                    />
                    <p className="text-xs mt-1">{t("forms.createProduct.hints.thumbnail")}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.sampleFile")}</span>
                    </label>
                    <input
                      type="file"
                      id={`${activeTab}-sample`}
                      className="file-input file-input-bordered w-full"
                      onChange={(e) => handleFileChange(e, "sample", activeTab)}
                    />
                    <p className="text-xs mt-1">{t("forms.createProduct.hints.sampleFile")}</p>
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
              <form onSubmit={handleCreateSection}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">{t("forms.createSection.title")}</h3>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      t("forms.createSection.submitButton")
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createSection.fields.name")} *</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("forms.createSection.placeholders.name")}
                      className="input input-bordered w-full"
                      value={sectionForm.name}
                      onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createSection.fields.number")} *</span>
                    </label>
                    <input
                      type="number"
                      placeholder={t("forms.createSection.placeholders.number")}
                      className="input input-bordered w-full"
                      value={sectionForm.number}
                      onChange={(e) => setSectionForm({ ...sectionForm, number: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createSection.fields.description")} *</span>
                    </label>
                    <textarea
                      placeholder={t("forms.createSection.placeholders.description")}
                      className="textarea textarea-bordered w-full h-32"
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
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

      {/* Edit Section Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t("modals.editSection.title")}</h3>
            <form onSubmit={handleUpdateSection}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createSection.fields.name")} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createSection.placeholders.name")}
                    className="input input-bordered w-full"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createSection.fields.number")} *</span>
                  </label>
                  <input
                    type="number"
                    placeholder={t("forms.createSection.placeholders.number")}
                    className="input input-bordered w-full"
                    value={sectionForm.number}
                    onChange={(e) => setSectionForm({ ...sectionForm, number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createSection.fields.description")} *</span>
                  </label>
                  <textarea
                    placeholder={t("forms.createSection.placeholders.description")}
                    className="textarea textarea-bordered w-full h-24"
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createSection.fields.thumbnail")}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createSection.placeholders.thumbnail")}
                    className="input input-bordered w-full"
                    value={sectionForm.thumbnail}
                    onChange={(e) => setSectionForm({ ...sectionForm, thumbnail: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSection(null)
                    setSectionForm({
                      name: "",
                      description: "",
                      number: "",
                      thumbnail: "logo",
                    })
                  }}
                >
                  {t("modals.editSection.cancelButton")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t("modals.editSection.updateButton")
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t("modals.editProduct.title") || "Edit Product"}</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.title")} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.title")}
                    className="input input-bordered w-full"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.serial")} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.serial")}
                    className="input input-bordered w-full"
                    value={productForm.serial}
                    onChange={(e) => setProductForm({ ...productForm, serial: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.section")} *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={productForm.section}
                    onChange={(e) => setProductForm({ ...productForm, section: e.target.value })}
                    required
                  >
                    <option value="">{t("forms.createProduct.placeholders.section")}</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.price")} *</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.discountPercentage")}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered w-full"
                    value={productForm.discountPercentage}
                    onChange={(e) => setProductForm({ ...productForm, discountPercentage: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.paymentNumber")} *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("forms.createProduct.placeholders.paymentNumber")}
                    className="input input-bordered w-full"
                    value={productForm.paymentNumber}
                    onChange={(e) => setProductForm({ ...productForm, paymentNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.thumbnail")}</span>
                  </label>
                  <input
                    type="file"
                    id="edit-product-thumbnail"
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                  />
                  <p className="text-xs mt-1">
                    {t("modals.editProduct.leaveEmptyToKeep") || "Leave empty to keep current thumbnail"}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("forms.createProduct.fields.sampleFile")}</span>
                  </label>
                  <input
                    type="file"
                    id="edit-product-sample"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => handleFileChange(e, "sample")}
                  />
                  <p className="text-xs mt-1">
                    {t("modals.editProduct.leaveEmptyToKeep") || "Leave empty to keep current sample file"}
                  </p>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
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
            <h3 className="font-bold text-lg">{t("modals.deleteSection.title")}</h3>
            <p className="py-4">{t("modals.deleteSection.message", { sectionName: sectionToDelete?.name })}</p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSectionToDelete(null)
                }}
              >
                {t("modals.deleteSection.cancelButton")}
              </button>
              <button className="btn btn-error" onClick={handleDeleteSection} disabled={actionLoading}>
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t("modals.deleteSection.deleteButton")
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
              {t("modals.deleteProduct.message", { productName: productToDelete?.title }) ||
                `Are you sure you want to delete the product "${productToDelete?.title}"? This action cannot be undone.`}
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteProductModal(false)
                  setProductToDelete(null)
                }}
              >
                {t("modals.deleteProduct.cancelButton") || "Cancel"}
              </button>
              <button className="btn btn-error" onClick={handleDeleteProduct} disabled={actionLoading}>
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
    </div>
  )
}

export default AdminPanel
