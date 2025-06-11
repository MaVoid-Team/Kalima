"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  getAllSections,
  getAllBooks,
  getAllProducts,
  createSection,
  updateSection,
  deleteSection,
  createProduct,
} from "../../routes/market"

const AdminPanel = () => {
  const { t, i18n } = useTranslation("kalimaStore-admin")
  const isRTL = i18n.language === "ar"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  const [selectedSectionType, setSelectedSectionType] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Real data states
  const [sections, setSections] = useState([])
  const [books, setBooks] = useState([])
  const [products, setProducts] = useState([])
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

  const [editingSection, setEditingSection] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [sectionsResponse, booksResponse, productsResponse] = await Promise.all([
        getAllSections(),
        getAllBooks(),
        getAllProducts(),
      ])

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

      // Calculate statistics
      const totalProducts = (booksResponse.data?.books?.length || 0) + (productsResponse.data?.products?.length || 0)
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

      if (response.status === "success") {
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
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    setProductForm({ ...productForm, [fieldName]: file })
  }

  // Filter sections based on search
  const filteredSections = sections.filter((section) => section.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
      value: stats.totalProducts.toString(),
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

  // Group sections by type for category cards
  const getCategoryData = () => {
    const designSections = sections.filter((section) => section.name.toLowerCase().includes("design"))
    const courseSections = sections.filter(
      (section) => section.name.toLowerCase().includes("course") || section.name.toLowerCase().includes("math"),
    )
    const giftSections = sections.filter((section) => section.name.toLowerCase().includes("gift"))
    const printingSections = sections.filter((section) => section.name.toLowerCase().includes("print"))

    return [
      {
        title: t("categories.designsSection"),
        count: designSections.length,
        icon: "🎨",
        description: t("categories.designsDescription"),
      },
      {
        title: t("categories.coursesSection"),
        count: courseSections.length,
        icon: "📚",
        description: t("categories.coursesDescription"),
      },
      {
        title: t("categories.giftsSection"),
        count: giftSections.length,
        icon: "🎁",
        description: t("categories.giftsDescription"),
      },
      {
        title: t("categories.printingSection"),
        count: printingSections.length,
        icon: "🖨️",
        description: t("categories.printingDescription"),
      },
    ]
  }

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
      {/* Stats Cards */}
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, index) => (
            <div key={index} className={`card shadow-lg ${stat.bgColor} ${stat.textColor}`}>
              <div className="card-body p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium opacity-90">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          {/* Create New Product Form */}
          <div className="card shadow-lg relative">
            <div className="card-body p-6">
              <form onSubmit={handleCreateProduct}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">{t("forms.createProduct.title")}</h3>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      t("forms.createProduct.submitButton")
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
                      <span className="label-text font-medium">
                        {t("forms.createProduct.fields.discountPercentage")}
                      </span>
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
                      id="product-thumbnail"
                      className="file-input file-input-bordered w-full"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "thumbnail")}
                    />
                    <p className="text-xs mt-1">{t("forms.createProduct.hints.thumbnail")}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">{t("forms.createProduct.fields.sampleFile")}</span>
                    </label>
                    <input
                      type="file"
                      id="product-sample"
                      className="file-input file-input-bordered w-full"
                      onChange={(e) => handleFileChange(e, "sample")}
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

      {/* Delete Confirmation Modal */}
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
    </div>
  )
}

export default AdminPanel
