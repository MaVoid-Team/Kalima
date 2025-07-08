"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  getAllProductPurchases,
  confirmProductPurchase,
  confirmBookPurchase,
  updatePurchase,
} from "../../../routes/orders"
import { FaWhatsapp } from "react-icons/fa"
import { Check, Eye, ImageIcon, Notebook, Edit3, Save, X, FileText, Plus } from "lucide-react"

const Orders = () => {
  const { t, i18n } = useTranslation("kalimaStore-orders")
  const isRTL = i18n.language === "ar"

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPurchases, setTotalPurchases] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    products: 0,
    books: 0,
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Enhanced notes modal state
  const [notesModal, setNotesModal] = useState({
    isOpen: false,
    orderId: null,
    notes: "",
    originalNotes: "",
    loading: false,
    hasChanges: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      if (searchQuery !== debouncedSearchQuery && currentPage !== 1) {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearchQuery, currentPage])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = {
        page: currentPage,
      }
      if (debouncedSearchQuery.trim()) {
        queryParams.search = debouncedSearchQuery.trim()
      }
      if (statusFilter !== "all") {
        queryParams.confirmed = statusFilter === "confirmed"
      }

      const response = await getAllProductPurchases(queryParams)
      if (response.success) {
        let purchases = response.data.data.purchases
        if (typeFilter !== "all") {
          if (typeFilter === "book") {
            purchases = purchases.filter((order) => order.__t === "ECBookPurchase")
          } else if (typeFilter === "product") {
            purchases = purchases.filter((order) => !order.__t || order.__t !== "ECBookPurchase")
          }
        }

        setOrders(purchases)
        setTotalPages(response.data.totalPages)
        setTotalPurchases(response.data.totalPurchases)

        const allPurchases = response.data.data.purchases
        const confirmed = allPurchases.filter((order) => order.confirmed).length
        const pending = allPurchases.filter((order) => !order.confirmed).length
        const products = allPurchases.filter((order) => !order.__t || order.__t !== "ECBookPurchase").length
        const books = allPurchases.filter((order) => order.__t === "ECBookPurchase").length

        setStats({
          total: response.data.totalPurchases,
          confirmed: confirmed,
          pending: pending,
          products: products,
          books: books,
        })
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, typeFilter, debouncedSearchQuery])

  const handleRefresh = useCallback(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleConfirmOrder = async (order) => {
    try {
      setConfirmLoading({ ...confirmLoading, [order._id]: true })
      let response
      if (order.__t === "ECBookPurchase") {
        response = await confirmBookPurchase(order._id)
      } else {
        response = await confirmProductPurchase(order._id)
      }

      if (response.success) {
        setOrders((prevOrders) => prevOrders.map((o) => (o._id === order._id ? { ...o, confirmed: true } : o)))
        setStats((prevStats) => ({
          ...prevStats,
          confirmed: prevStats.confirmed + 1,
          pending: prevStats.pending - 1,
        }))
        alert(t("alerts.orderConfirmed"))
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.error("Error confirming order:", err)
      alert(t("alerts.failedToConfirm") + err.message)
    } finally {
      setConfirmLoading({ ...confirmLoading, [order._id]: false })
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleViewPaymentScreenshot = (screenshotPath) => {
    if (!screenshotPath) return
    const baseURL = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") || ""
    const normalizedPath = screenshotPath.startsWith("uploads/")
      ? `${baseURL}/${screenshotPath}`
      : `${baseURL}/uploads/payment_screenshots/${screenshotPath}`
    window.open(normalizedPath, "_blank")
  }

  const handleWhatsAppContact = (order) => {
    const phoneNumber = order.numberTransferredFrom
    const message = encodeURIComponent(
      `Hello! This is regarding your order for ${order.productName} (Order ID: ${order.purchaseSerial}). How can we assist you?`,
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }

  const getOrderType = (order) => {
    return order.__t === "ECBookPurchase" ? "Book" : "Product"
  }

  const formatPrice = (price) => {
    return `${price} ج`
  }

  // Enhanced notes functionality
  const openNotesModal = (order) => {
    const currentNotes = order.adminNotes || ""
    setNotesModal({
      isOpen: true,
      orderId: order._id,
      notes: currentNotes,
      originalNotes: currentNotes,
      loading: false,
      hasChanges: false,
    })
  }

  const handleNotesChange = (newNotes) => {
    setNotesModal((prev) => ({
      ...prev,
      notes: newNotes,
      hasChanges: newNotes !== prev.originalNotes,
    }))
  }

  const handleSaveNotes = async () => {
    if (!notesModal.hasChanges) {
      setNotesModal({ isOpen: false, orderId: null, notes: "", originalNotes: "", loading: false, hasChanges: false })
      return
    }

    try {
      setNotesModal((prev) => ({ ...prev, loading: true }))
      const response = await updatePurchase(notesModal.orderId, {
        adminNotes: notesModal.notes,
      })

      if (response.success) {
        // Update the orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === notesModal.orderId ? { ...order, adminNotes: notesModal.notes } : order,
          ),
        )
        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder._id === notesModal.orderId) {
          setSelectedOrder((prev) => ({ ...prev, adminNotes: notesModal.notes }))
        }
        // Close modal
        setNotesModal({ isOpen: false, orderId: null, notes: "", originalNotes: "", loading: false, hasChanges: false })
        alert(t("alerts.notesSaved"))
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Error saving notes:", error)
      alert(t("alerts.failedToSaveNotes") + error.message)
    } finally {
      setNotesModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const closeNotesModal = () => {
    if (notesModal.hasChanges) {
      if (confirm(t("alerts.unsavedChanges"))) {
        setNotesModal({ isOpen: false, orderId: null, notes: "", originalNotes: "", loading: false, hasChanges: false })
      }
    } else {
      setNotesModal({ isOpen: false, orderId: null, notes: "", originalNotes: "", loading: false, hasChanges: false })
    }
  }

  // Get notes preview for table display - improved
  const getNotesPreview = (notes) => {
    if (!notes) return ""
    return notes.length > 30 ? notes.substring(0, 30) + "..." : notes
  }

  // Get notes word count
  const getNotesWordCount = (notes) => {
    if (!notes) return 0
    return notes
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  // Memoize order items to prevent unnecessary re-renders
  const memoizedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      orderType: getOrderType(order),
      formattedPrice: formatPrice(order.finalPrice),
      notesPreview: getNotesPreview(order.adminNotes),
      hasNotes: !!(order.adminNotes && order.adminNotes.trim()),
      notesWordCount: getNotesWordCount(order.adminNotes),
    }))
  }, [orders])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

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
            <h3 className="font-bold">{t("errorLoadingOrders")}</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button onClick={fetchOrders} className="btn btn-sm">
            {t("retry")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-center relative mb-8">
        <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
          <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
        </div>
        <h1 className="text-3xl font-bold text-center">{t("ordersManagement")}</h1>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card bg-blue-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">📦</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{t("stats.totalOrders")}</h3>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-green-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✅</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{t("stats.confirmed")}</h3>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-orange-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">⏳</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{t("stats.pending")}</h3>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-purple-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">📚</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{t("stats.books")}</h3>
                <p className="text-2xl font-bold">{stats.books}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-teal-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🛍️</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">{t("stats.products")}</h3>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-lg mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="input input-bordered w-full pr-12"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="min-w-40">
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("filters.allStatus")}</option>
                <option value="confirmed">{t("filters.confirmed")}</option>
                <option value="pending">{t("filters.pending")}</option>
              </select>
            </div>
            <div className="min-w-40">
              <select
                className="select select-bordered w-full"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">{t("filters.allTypes")}</option>
                <option value="book">{t("filters.books")}</option>
                <option value="product">{t("filters.products")}</option>
              </select>
            </div>
            <button onClick={handleRefresh} className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "🔄"}
              {t("refresh")}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-fixed overflow-hidden">
            <thead>
              <tr>
                <th className="text-center">{t("table.product")}</th>
                <th className="text-center">{t("table.customer")}</th>
                <th className="text-center">{t("table.type")}</th>
                <th className="text-center">{t("table.price")}</th>
                <th className="text-center">{t("table.couponCode")}</th>
                <th className="text-center">{t("table.transferFrom")}</th>
                <th className="text-center">{t("table.status")}</th>
                <th className="text-center">{t("table.notes")}</th>
                <th className="text-center">{t("table.date")}</th>
                <th className="text-center">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-2 text-gray-500">{t("loading")}</p>
                  </td>
                </tr>
              ) : memoizedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                        ? t("noOrdersFound")
                        : t("noOrdersAvailable")}
                    </p>
                  </td>
                </tr>
              ) : (
                memoizedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="text-center">
                          <div className="font-bold text-sm">{order.productName}</div>
                          <div className="text-xs opacity-50">{order.purchaseSerial}</div>
                    </td>
                    <td className="text-center">
                      <div
                        className={`badge badge-sm ${order.orderType === "Book" ? "badge-primary" : "badge-secondary"}`}
                      >
                        {t(order.orderType === "Book" ? "table.book" : "table.productType")}
                      </div>
                    </td>
                    <td className="text-center font-bold">{order.formattedPrice}</td>
                    <td className="text-center font-bold">{order.couponCode != null ? <span className="text-green-500">{order.couponCode.value}</span> : "NA"}</td>
                    <td className="text-center font-mono text-sm">{order.numberTransferredFrom}</td>
                    <td className="text-center">
                      {order.confirmed ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="badge badge-success badge-sm">{t("table.confirmed")}</div>
                          {order.confirmedBy && (
                            <div className="text-xs opacity-50 truncate" title={order.confirmedBy.name}>
                              {t("table.by")} {order.confirmedBy.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="badge badge-warning badge-sm">{t("table.pending")}</div>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center min-w-0">
                        {order.hasNotes ? (
                          <div
                            className="tooltip tooltip-left cursor-pointer"
                            data-tip={order.adminNotes}
                            onClick={() => openNotesModal(order)}
                          >
                            <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <div className="flex flex-col items-start min-w-0">
                                <span className="text-xs truncate max-w-20" title={order.notesPreview}>
                                  {order.notesPreview}
                                </span>
                                <span className="text-xs opacity-60">
                                  {order.notesWordCount} {order.notesWordCount === 1 ? "word" : "words"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={() => openNotesModal(order)}
                            title={t("table.addNotes")}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-xs">{t("table.addNote")}</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-center text-xs truncate" title={order.formattedCreatedAt}>
                      {order.formattedCreatedAt}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleViewDetails(order)}
                          title={t("table.viewDetails")}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          className={`btn btn-ghost btn-xs ${order.hasNotes ? "text-blue-600" : "text-gray-400"}`}
                          onClick={() => openNotesModal(order)}
                          title={order.hasNotes ? t("table.viewEditNotes") : t("table.addNotes")}
                        >
                          <Notebook className="w-3 h-3" />
                          {order.hasNotes && (
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          )}
                        </button>
                        {order.paymentScreenShot && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleViewPaymentScreenshot(order.paymentScreenShot)}
                            title={t("table.viewPaymentScreenshot")}
                          >
                            <ImageIcon className="w-3 h-3" />
                          </button>
                        )}
                        {order.numberTransferredFrom && (
                          <button
                            className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
                            onClick={() => handleWhatsAppContact(order)}
                            title={t("table.contactWhatsApp")}
                          >
                            <FaWhatsapp className="w-3 h-3" />
                          </button>
                        )}
                        {!order.confirmed && (
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => handleConfirmOrder(order)}
                            disabled={confirmLoading[order._id]}
                            title={t("table.confirmOrder")}
                          >
                            {confirmLoading[order._id] ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">{t("table.noOrdersFound")}</h3>
            <p className="text-gray-500">{t("table.tryAdjustingSearch")}</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("table.previous")}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageToShow
              if (totalPages <= 5) {
                pageToShow = i + 1
              } else if (currentPage <= 3) {
                pageToShow = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i
              } else {
                pageToShow = currentPage - 2 + i
              }

              return (
                <button
                  key={pageToShow}
                  className={`join-item btn ${currentPage === pageToShow ? "btn-primary" : ""}`}
                  onClick={() => handlePageChange(pageToShow)}
                  disabled={loading}
                >
                  {pageToShow}
                </button>
              )
            })}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              {t("table.next")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {t("table.page")} {currentPage} {t("table.of")} {totalPages} ({totalPurchases} {t("table.totalOrders")})
          </div>
        </div>
      )}

      {/* Enhanced Admin Notes Modal */}
      {notesModal.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div>{t("table.adminNotes")}</div>
                  <div className="text-sm font-normal opacity-70">
                    Order: {orders.find((o) => o._id === notesModal.orderId)?.purchaseSerial}
                  </div>
                </div>
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeNotesModal}
                disabled={notesModal.loading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="form-control">
                <div className="flex justify-between items-center mb-2">
                  <label className="label-text font-medium text-base">{t("table.notesLabel")}</label>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="opacity-70">
                      {getNotesWordCount(notesModal.notes)}{" "}
                      {getNotesWordCount(notesModal.notes) === 1 ? "word" : "words"}
                    </span>
                    <span className="opacity-70">
                      {notesModal.notes.length}/1000 {t("table.characters")}
                    </span>
                  </div>
                </div>
                <textarea
                  className="textarea textarea-bordered w-full h-40 resize-none text-base leading-relaxed"
                  placeholder={t("table.notesPlaceholder")}
                  value={notesModal.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  maxLength={1000}
                  disabled={notesModal.loading}
                />
                <div className="label">
                  <span className="label-text-alt opacity-60">
                    {t(
                      "table.notesHint",
                      "Use this space to add internal notes about this order. These notes are only visible to administrators.",
                    )}
                  </span>
                </div>
              </div>

              {notesModal.hasChanges && (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>{t("table.unsavedChanges")}</span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeNotesModal} disabled={notesModal.loading}>
                {t("table.cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveNotes}
                disabled={notesModal.loading || !notesModal.hasChanges}
              >
                {notesModal.loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {t("table.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("table.saveNotes")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">{t("table.orderDetails")}</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.orderID")}</span>
                  </label>
                  <p className="font-mono text-sm bg-base-200 p-2 rounded break-all">{selectedOrder._id}</p>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.purchaseSerial")}</span>
                  </label>
                  <p className="font-mono text-sm bg-base-200 p-2 rounded">{selectedOrder.purchaseSerial}</p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.customerInfo")}</span>
                </label>
                <div className="bg-base-200 p-4 rounded space-y-2">
                  <p>
                    <strong>{t("table.name")}:</strong> {selectedOrder.userName}
                  </p>
                  <p>
                    <strong>{t("table.email")}:</strong> {selectedOrder.createdBy?.email}
                  </p>
                  <p>
                    <strong>{t("table.role")}:</strong> {selectedOrder.createdBy?.role}
                  </p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.productInfo")}</span>
                </label>
                <div className="bg-base-200 p-4 rounded space-y-2">
                  <p>
                    <strong>{t("table.name")}:</strong> {selectedOrder.productName}
                  </p>
                  <p>
                    <strong>{t("table.type")}:</strong>{" "}
                    {t(getOrderType(selectedOrder) === "Book" ? "table.book" : "table.productType")}
                  </p>
                  <p>
                    <strong>{t("table.price")}:</strong> {formatPrice(selectedOrder.price)}
                  </p>

                  <p>
                    <strong>{t("table.couponCode")}:</strong> {formatPrice(selectedOrder.couponCode?.value || "NA")}
                  </p>
                  {selectedOrder.notes && (
                    <div>
                      <strong>{t("table.customerNotes")}:</strong>
                      <div className="mt-1 p-2 bg-base-100 rounded text-sm whitespace-pre-wrap">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.paymentInfo")}</span>
                </label>
                <div className="bg-base-200 p-4 rounded space-y-2">
                  <p>
                    <strong>{t("table.paymentNumber")}:</strong> {selectedOrder.paymentNumber}
                  </p>
                  <p>
                    <strong>{t("table.transferredFrom")}:</strong> {selectedOrder.numberTransferredFrom}
                  </p>
                  {selectedOrder.paymentScreenShot && (
                    <div className="mt-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewPaymentScreenshot(selectedOrder.paymentScreenShot)}
                      >
                        {t("table.viewPaymentScreenshot")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.__t === "ECBookPurchase" && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.bookInfo")}</span>
                  </label>
                  <div className="bg-base-200 p-4 rounded space-y-2">
                    <p>
                      <strong>{t("table.nameOnBook")}:</strong> {selectedOrder.nameOnBook}
                    </p>
                    <p>
                      <strong>{t("table.numberOnBook")}:</strong> {selectedOrder.numberOnBook}
                    </p>
                    <p>
                      <strong>{t("table.seriesName")}:</strong> {selectedOrder.seriesName}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t("table.adminNotes")}
                  </span>
                </label>
                <div className="bg-base-200 p-4 rounded min-h-24">
                  {selectedOrder.adminNotes ? (
                    <div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedOrder.adminNotes}</div>
                      <div className="mt-2 text-xs opacity-60">
                        {getNotesWordCount(selectedOrder.adminNotes)}{" "}
                        {getNotesWordCount(selectedOrder.adminNotes) === 1 ? "word" : "words"} •
                        {selectedOrder.adminNotes.length} characters
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16">
                      <div className="text-center">
                        <p className="text-gray-500 italic text-sm">{t("table.noAdminNotes")}</p>
                        <button className="btn btn-sm btn-ghost mt-2" onClick={() => openNotesModal(selectedOrder)}>
                          <Plus className="w-4 h-4" />
                          {t("table.addFirstNote")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedOrder(null)
                }}
              >
                {t("table.close")}
              </button>
              {!selectedOrder.confirmed && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleConfirmOrder(selectedOrder)
                    setShowDetailsModal(false)
                    setSelectedOrder(null)
                  }}
                  disabled={confirmLoading[selectedOrder._id]}
                >
                  {confirmLoading[selectedOrder._id] ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t("table.confirmOrder")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
