"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Filter,
  Search,
  Calendar,
  ShoppingBag,
  BookOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { getCartPurchases } from "../../routes/cart";
import { getToken } from "../../routes/auth-services";

const MyOrders = () => {
  const { t, i18n } = useTranslation("kalimaStore-myOrders");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!getToken()) {
      navigate("/login?redirect=" + encodeURIComponent("/my-orders"));
    }
  }, [navigate]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getCartPurchases();

        if (result.success && result.data?.status === "success") {
          setOrders(result.data.data.purchases || []);
        } else {
          throw new Error(result.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (getToken()) {
      fetchOrders();
    }
  }, []);

  // Get order type
  const getOrderType = (order) => {
    if (!order.items || order.items.length === 0) return "product";
    const hasBooks = order.items.some((item) => item.productType === "ECBook");
    const hasProducts = order.items.some(
      (item) => item.productType === "ECProduct",
    );
    if (hasBooks && hasProducts) return "mixed";
    return hasBooks ? "book" : "product";
  };

  // Get product names
  const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) return "N/A";
    return order.items
      .map((item) => item.productSnapshot?.title || "Unknown")
      .join(", ");
  };

  // Calculate total
  const calculateTotal = (order) => {
    if (order.total) return order.total;
    if (!order.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.priceAtPurchase || 0) * (item.quantity || 1),
      0,
    );
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const productNames = getProductNames(order).toLowerCase();
        const serial = (order.purchaseSerial || "").toLowerCase();
        if (!productNames.includes(query) && !serial.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all") {
        const orderType = getOrderType(order);
        if (
          typeFilter === "book" &&
          orderType !== "book" &&
          orderType !== "mixed"
        ) {
          return false;
        }
        if (
          typeFilter === "product" &&
          orderType !== "product" &&
          orderType !== "mixed"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, typeFilter]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        color: "badge-warning",
        icon: Clock,
        text: isRTL ? "قيد الانتظار" : "Pending",
      },
      received: {
        color: "badge-info",
        icon: Package,
        text: isRTL ? "تم الاستلام" : "Received",
      },
      confirmed: {
        color: "badge-success",
        icon: CheckCircle2,
        text: isRTL ? "مؤكد" : "Confirmed",
      },
      returned: {
        color: "badge-error",
        icon: RotateCcw,
        text: isRTL ? "مسترجع" : "Returned",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`badge ${config.color} gap-1 px-3 py-3`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </div>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }) => {
    if (type === "book") {
      return (
        <div className="badge badge-secondary gap-1">
          <BookOpen className="w-3 h-3" />
          {isRTL ? "كتاب" : "Book"}
        </div>
      );
    }
    if (type === "mixed") {
      return (
        <div className="badge badge-accent gap-1">
          <Package className="w-3 h-3" />
          {isRTL ? "مختلط" : "Mixed"}
        </div>
      );
    }
    return (
      <div className="badge badge-primary gap-1">
        <ShoppingBag className="w-3 h-3" />
        {isRTL ? "منتج" : "Product"}
      </div>
    );
  };

  // View order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">
            {isRTL ? "جاري تحميل الطلبات..." : "Loading orders..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {isRTL ? "حدث خطأ" : "Error"}
            </h3>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              {isRTL ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Receipt className="w-7 h-7 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">
            {isRTL ? "طلباتي" : "My Orders"}
          </h1>
          <p className="text-base-content/60">
            {isRTL
              ? "تابع حالة طلباتك وشاهد تفاصيلها"
              : "Track your orders and view their details"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs text-base-content/60">
                    {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {
                      orders.filter(
                        (o) =>
                          o.status === "pending" || o.status === "received",
                      ).length
                    }
                  </p>
                  <p className="text-xs text-base-content/60">
                    {isRTL ? "قيد التنفيذ" : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === "confirmed").length}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {isRTL ? "مكتملة" : "Completed"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => getOrderType(o) === "book").length}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {isRTL ? "كتب" : "Books"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 shadow-lg mb-6"
        >
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder={isRTL ? "ابحث عن طلب..." : "Search orders..."}
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="select select-bordered min-w-40"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">
                  {isRTL ? "كل الحالات" : "All Status"}
                </option>
                <option value="pending">
                  {isRTL ? "قيد الانتظار" : "Pending"}
                </option>
                <option value="received">
                  {isRTL ? "تم الاستلام" : "Received"}
                </option>
                <option value="confirmed">
                  {isRTL ? "مؤكد" : "Confirmed"}
                </option>
                <option value="returned">
                  {isRTL ? "مسترجع" : "Returned"}
                </option>
              </select>

              {/* Type Filter */}
              <select
                className="select select-bordered min-w-40"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">
                  {isRTL ? "كل الأنواع" : "All Types"}
                </option>
                <option value="book">{isRTL ? "كتب" : "Books"}</option>
                <option value="product">{isRTL ? "منتجات" : "Products"}</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all") && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  <X className="w-4 h-4" />
                  {isRTL ? "مسح" : "Clear"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body py-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <h3 className="text-xl font-bold mb-2">
                {orders.length === 0
                  ? isRTL
                    ? "لا توجد طلبات بعد"
                    : "No orders yet"
                  : isRTL
                    ? "لا توجد نتائج"
                    : "No results found"}
              </h3>
              <p className="text-base-content/60 mb-6">
                {orders.length === 0
                  ? isRTL
                    ? "ابدأ التسوق الآن واطلب منتجاتك المفضلة"
                    : "Start shopping now and order your favorite products"
                  : isRTL
                    ? "جرب تغيير معايير البحث"
                    : "Try changing your search criteria"}
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => navigate("/market")}
                  className="btn btn-primary"
                >
                  {isRTL ? "تسوق الآن" : "Shop Now"}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
                >
                  <div className="card-body p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <StatusBadge status={order.status} />
                          <TypeBadge type={getOrderType(order)} />
                          <span className="text-xs text-base-content/50 font-mono">
                            #{order.purchaseSerial || order._id.slice(-8)}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg mb-1 line-clamp-1">
                          {getProductNames(order)}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.items?.length || 1}{" "}
                            {isRTL ? "عنصر" : "item(s)"}
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {calculateTotal(order)}{" "}
                            <span className="text-sm">EGP</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewDetails(order)}
                          className="btn btn-primary btn-sm md:btn-md"
                        >
                          <Eye className="w-4 h-4" />
                          {isRTL ? "التفاصيل" : "Details"}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar for pending/received */}
                    {(order.status === "pending" ||
                      order.status === "received") && (
                      <div className="mt-4 pt-4 border-t border-base-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">
                            {isRTL ? "حالة الطلب:" : "Order Progress:"}
                          </span>
                        </div>
                        <ul className="steps steps-horizontal w-full">
                          <li
                            className={`step ${order.status ? "step-primary" : ""}`}
                          >
                            {isRTL ? "تم الطلب" : "Ordered"}
                          </li>
                          <li
                            className={`step ${
                              order.status === "received" ||
                              order.status === "confirmed"
                                ? "step-primary"
                                : ""
                            }`}
                          >
                            {isRTL ? "جاري المعالجة" : "Processing"}
                          </li>
                          <li
                            className={`step ${order.status === "confirmed" ? "step-primary" : ""}`}
                          >
                            {isRTL ? "مكتمل" : "Completed"}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Results count */}
        {filteredOrders.length > 0 && (
          <div className="text-center mt-6 text-sm text-base-content/60">
            {isRTL
              ? `عرض ${filteredOrders.length} من ${orders.length} طلب`
              : `Showing ${filteredOrders.length} of ${orders.length} orders`}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box max-w-3xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    {isRTL ? "تفاصيل الطلب" : "Order Details"}
                  </h3>
                  <p className="text-sm text-base-content/60 font-mono">
                    #{selectedOrder.purchaseSerial || selectedOrder._id}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
                {/* Status */}
                <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <StatusBadge status={selectedOrder.status} />
                  <TypeBadge type={getOrderType(selectedOrder)} />
                  <span className="text-sm font-medium text-gray-500 ml-auto">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {isRTL ? "المنتجات" : "Products"}
                  </h4>
                  <div className="bg-base-200 rounded-lg p-4 space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-base-300 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {item.productSnapshot?.title || "Unknown"}
                          </p>
                          <p className="text-sm text-base-content/60">
                            {item.productType === "ECBook"
                              ? isRTL
                                ? "كتاب"
                                : "Book"
                              : isRTL
                                ? "منتج"
                                : "Product"}
                            {item.quantity > 1 && ` x${item.quantity}`}
                          </p>
                        </div>
                        <p className="font-bold">{item.priceAtPurchase} EGP</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Info (if applicable) */}
                {selectedOrder.items?.some(
                  (item) => item.productType === "ECBook",
                ) && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {isRTL ? "بيانات الكتاب" : "Book Information"}
                    </h4>
                    <div className="bg-info/10 rounded-lg p-4">
                      {selectedOrder.items
                        .filter((item) => item.productType === "ECBook")
                        .map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            {item.nameOnBook && (
                              <p>
                                <span className="font-medium">
                                  {isRTL
                                    ? "الاسم على الكتاب:"
                                    : "Name on Book:"}
                                </span>{" "}
                                {item.nameOnBook}
                              </p>
                            )}
                            {item.numberOnBook && (
                              <p>
                                <span className="font-medium">
                                  {isRTL
                                    ? "الرقم على الكتاب:"
                                    : "Number on Book:"}
                                </span>{" "}
                                {item.numberOnBook}
                              </p>
                            )}
                            {item.seriesName && (
                              <p>
                                <span className="font-medium">
                                  {isRTL ? "اسم السلسلة:" : "Series Name:"}
                                </span>{" "}
                                {item.seriesName}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {isRTL ? "بيانات الدفع" : "Payment Information"}
                  </h4>
                  <div className="bg-base-200 rounded-lg p-4 space-y-2">
                    {selectedOrder.paymentMethod && (
                      <p>
                        <span className="font-medium">
                          {isRTL ? "طريقة الدفع:" : "Payment Method:"}
                        </span>{" "}
                        <span className="badge badge-primary">
                          {typeof selectedOrder.paymentMethod === "object"
                            ? selectedOrder.paymentMethod.name
                            : selectedOrder.paymentMethod}
                        </span>
                      </p>
                    )}
                    {selectedOrder.numberTransferredFrom && (
                      <p>
                        <span className="font-medium">
                          {isRTL ? "رقم التحويل:" : "Transfer Number:"}
                        </span>{" "}
                        <span className="font-mono">
                          {selectedOrder.numberTransferredFrom}
                        </span>
                      </p>
                    )}
                    {selectedOrder.discount > 0 && (
                      <p>
                        <span className="font-medium">
                          {isRTL ? "الخصم:" : "Discount:"}
                        </span>{" "}
                        <span className="text-success">
                          -{selectedOrder.discount} EGP
                        </span>
                      </p>
                    )}
                    <div className="divider my-2"></div>
                    <p className="text-lg">
                      <span className="font-medium">
                        {isRTL ? "الإجمالي:" : "Total:"}
                      </span>{" "}
                      <span className="font-bold text-primary text-xl">
                        {calculateTotal(selectedOrder)} EGP
                      </span>
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {isRTL ? "ملاحظاتك" : "Your Notes"}
                    </h4>
                    <div className="bg-base-200 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  {isRTL ? "إغلاق" : "Close"}
                </button>
              </div>
            </motion.div>
            <div
              className="modal-backdrop bg-black/50"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedOrder(null);
              }}
            ></div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
