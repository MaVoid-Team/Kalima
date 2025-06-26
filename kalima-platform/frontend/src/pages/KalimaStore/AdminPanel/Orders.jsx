"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { getAllProductPurchases, confirmProductPurchase, confirmBookPurchase } from "../../../routes/orders"

const Orders = () => {
  const { t, i18n } = useTranslation("kalimaStore-orders")
  const isRTL = i18n.language === "ar"

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all, confirmed, pending
  const [typeFilter, setTypeFilter] = useState("all") // all, product, book

  // Server-side pagination states
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

  // Add debounced search state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Debounce search query and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearchQuery && currentPage !== 1) {
        setCurrentPage(1)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearchQuery, currentPage])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters for server-side filtering and pagination
      const queryParams = {
        page: currentPage,
      }

      // Add search query if provided
      if (debouncedSearchQuery.trim()) {
        queryParams.search = debouncedSearchQuery.trim()
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        queryParams.confirmed = statusFilter === "confirmed"
      }

      // Note: We'll handle type filtering client-side since the API might not support it
      const response = await getAllProductPurchases(queryParams)

      if (response.success) {
        let purchases = response.data.data.purchases

        // Apply type filter client-side
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

        // Calculate statistics from ALL data (not just filtered)
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

  // Fetch orders when dependencies change
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
        // Update the order in the local state
        setOrders((prevOrders) => prevOrders.map((o) => (o._id === order._id ? { ...o, confirmed: true } : o)))

        // Update stats
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
    if (!screenshotPath) return;

    const baseURL = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") || "";

    const normalizedPath = screenshotPath.startsWith("uploads/")
      ? `${baseURL}/${screenshotPath}`
      : `${baseURL}/uploads/payment_screenshots/${screenshotPath}`;

    window.open(normalizedPath, "_blank");
  };

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
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter */}
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

            {/* Type Filter */}
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

            {/* Refresh Button */}
            <button onClick={fetchOrders} className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "\ud83d\udd04"}
              {t("refresh")}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">{t("table.product")}</th>
                <th className="text-center">{t("table.customer")}</th>
                <th className="text-center">{t("table.type")}</th>
                <th className="text-center">{t("table.price")}</th>
                <th className="text-center">{t("table.transferFrom")}</th>
                <th className="text-center">{t("table.status")}</th>
                <th className="text-center">{t("table.date")}</th>
                <th className="text-center">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="text-center">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="text-left">
                        <div className="font-bold text-sm">{order.productName}</div>
                        <div className="text-xs opacity-50">{order.purchaseSerial}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div>
                      <div className="font-medium">{order.userName}</div>
                      <div className="text-xs opacity-50">{order.createdBy?.email}</div>
                      <div className="text-xs opacity-50">{order.createdBy?.role}</div>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`badge ${getOrderType(order) === "Book" ? "badge-primary" : "badge-secondary"}`}>
                      {t(getOrderType(order) === "Book" ? "table.book" : "table.productType")}
                    </div>
                  </td>
                  <td className="text-center font-bold">{formatPrice(order.price)}</td>
                  <td className="text-center font-mono text-sm">{order.numberTransferredFrom}</td>
                  <td className="text-center">
                    {order.confirmed ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="badge badge-success">{t("table.confirmed")}</div>
                        {order.confirmedBy && <div className="text-xs opacity-50">{t("table.by")} {order.confirmedBy.name}</div>}
                      </div>
                    ) : (
                      <div className="badge badge-warning">{t("table.pending")}</div>
                    )}
                  </td>
                  <td className="text-center text-sm">{order.formattedCreatedAt}</td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleViewDetails(order)}
                        title={t("table.viewDetails")}
                      >
                        👁️
                      </button>
                      {order.paymentScreenShot && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleViewPaymentScreenshot(order.paymentScreenShot)}
                          title={t("table.viewPaymentScreenshot")}
                        >
                          🖼️
                        </button>
                      )}
                      {!order.confirmed && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleConfirmOrder(order)}
                          disabled={confirmLoading[order._id]}
                          title={t("table.confirmOrder")}
                        >
                          {confirmLoading[order._id] ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "✅"
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">{t("table.noOrdersFound")}</h3>
            <p className="text-gray-500">{t("table.tryAdjustingSearch")}</p>
          </div>
        )}
      </div>

      {/* Server-Side Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <div className="join">
            {/* Previous Button */}
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

            {/* Page Numbers */}
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

            {/* Next Button */}
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

          {/* Pagination Info */}
          <div className="text-sm text-gray-600">
            {t("table.page")} {currentPage} {t("table.of")} {totalPages} ({totalPurchases} {t("table.totalOrders")})
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">{t("table.orderDetails")}</h3>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.orderID")}</span>
                  </label>
                  <p className="font-mono text-sm">{selectedOrder._id}</p>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.purchaseSerial")}</span>
                  </label>
                  <p className="font-mono text-sm">{selectedOrder.purchaseSerial}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.customerInfo")}</span>
                </label>
                <div className="bg-base-200 p-3 rounded">
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

              {/* Product Info */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.productInfo")}</span>
                </label>
                <div className="bg-base-200 p-3 rounded">
                  <p>
                    <strong>{t("table.name")}:</strong> {selectedOrder.productName}
                  </p>
                  <p>
                    <strong>{t("table.type")}:</strong> {t(getOrderType(selectedOrder) === "Book" ? "table.book" : "table.productType")}
                  </p>
                  <p>
                    <strong>{t("table.price")}:</strong> {formatPrice(selectedOrder.price)}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.paymentInfo")}</span>
                </label>
                <div className="bg-base-200 p-3 rounded">
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

              {/* Book-specific Info */}
              {selectedOrder.__t === "ECBookPurchase" && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t("table.bookInfo")}</span>
                  </label>
                  <div className="bg-base-200 p-3 rounded">
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

              {/* Status Info */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t("table.statusInfo")}</span>
                </label>
                <div className="bg-base-200 p-3 rounded">
                  <p>
                    <strong>{t("table.status")}:</strong> {selectedOrder.confirmed ? t("table.confirmed") : t("table.pending")}
                  </p>
                  <p>
                    <strong>{t("table.created")}:</strong> {selectedOrder.formattedCreatedAt}
                  </p>
                  {selectedOrder.confirmedBy && (
                    <p>
                      <strong>{t("table.confirmedBy")}:</strong> {selectedOrder.confirmedBy.name}
                    </p>
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
