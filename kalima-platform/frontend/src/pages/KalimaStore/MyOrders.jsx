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
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { getCartPurchases } from "../../routes/cart";
import { getToken } from "../../routes/auth-services";
import KalimaLoader from "../../components/KalimaLoader";

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
        color: "bg-amber-50 text-amber-600 border-amber-100",
        icon: Clock,
        text: isRTL ? "قيد الانتظار" : "Pending",
      },
      received: {
        color: "bg-blue-50 text-blue-600 border-blue-100",
        icon: Package,
        text: isRTL ? "تم الاستلام" : "Received",
      },
      confirmed: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: CheckCircle2,
        text: isRTL ? "مؤكد" : "Confirmed",
      },
      returned: {
        color: "bg-red-50 text-red-600 border-red-100",
        icon: RotateCcw,
        text: isRTL ? "مسترجع" : "Returned",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </div>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }) => {
    if (type === "book") {
      return (
        <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {isRTL ? "كتاب" : "Book"}
        </div>
      );
    }
    if (type === "mixed") {
      return (
        <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-indigo-50 text-indigo-600 border-indigo-100 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {isRTL ? "مختلط" : "Mixed"}
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-orange-50 text-orange-600 border-orange-100 flex items-center gap-1.5">
        <ShoppingBag className="w-3.5 h-3.5" />
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

  // Helper for arrow icon
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Loading state
  if (loading) {
    return <KalimaLoader fullScreen={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Background matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#AF0D0E]/10 via-[#FF5C28]/10 to-transparent rounded-full blur-[100px]"
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #AF0D0E 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-8 border border-red-200">
            <AlertCircle className="w-12 h-12 text-[#AF0D0E]" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4">
            {isRTL ? "حدث خطأ!" : "Oops!"}
          </h3>
          <p className="text-gray-600 mb-10 text-lg">
            {error ||
              (isRTL ? "فشل في تحميل الطلبات" : "Failed to load orders")}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
          >
            {isRTL ? "إعادة المحاولة" : "Try Again"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#AF0D0E]/10 via-[#FF5C28]/10 to-transparent rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF5C28]/10 via-[#AF0D0E]/5 to-transparent rounded-full blur-[100px] pointer-events-none"
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #AF0D0E 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#AF0D0E] to-[#FF5C28] flex items-center justify-center shadow-xl shadow-red-500/30"
                >
                  <Receipt className="w-8 h-8 text-white" />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white">
                  {orders.length}
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {isRTL ? "طلباتي" : "My Orders"}
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  {isRTL
                    ? "تابع حالة طلباتك وشاهد تفاصيلها"
                    : "Track your orders and view their details"}
                </p>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <motion.button
              whileHover={{ scale: 1.03, x: isRTL ? 5 : -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/market")}
              className="group relative flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-2xl font-bold text-gray-700 border-2 border-gray-200 hover:border-[#AF0D0E]/40 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-[#AF0D0E]/10 transition-all duration-300 overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#AF0D0E]/5 to-[#FF5C28]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-[#AF0D0E]/10 group-hover:to-[#FF5C28]/10 flex items-center justify-center transition-all duration-300">
                  <ShoppingBag className="w-5 h-5 text-gray-500 group-hover:text-[#AF0D0E] transition-colors duration-300" />
                </div>
                <span className="text-gray-700 group-hover:text-[#AF0D0E] transition-colors duration-300">
                  {isRTL ? "تصفح المتجر" : "Browse Store"}
                </span>
                <ArrowIcon
                  className={`w-5 h-5 text-gray-400 group-hover:text-[#AF0D0E] transition-all duration-300 ${
                    isRTL
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                  {orders.length}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100/50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">
                  {
                    orders.filter(
                      (o) => o.status === "pending" || o.status === "received",
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {isRTL ? "قيد التنفيذ" : "In Progress"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100/50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {orders.filter((o) => o.status === "confirmed").length}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {isRTL ? "مكتملة" : "Completed"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100/50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                  {orders.filter((o) => getOrderType(o) === "book").length}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {isRTL ? "كتب" : "Books"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={isRTL ? "ابحث عن طلب..." : "Search orders..."}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#AF0D0E] focus:ring-4 focus:ring-[#AF0D0E]/10 bg-white/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className={`py-3 px-4 rounded-xl border border-gray-200 focus:border-[#AF0D0E] focus:ring-4 focus:ring-[#AF0D0E]/10 bg-white/50 transition-all outline-none min-w-40 font-medium text-gray-700 appearance-none w-full ${
                  isRTL ? "pl-10" : "pr-10"
                }`}
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
              <ChevronDown
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${
                  isRTL ? "left-3" : "right-3"
                }`}
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                className={`py-3 px-4 rounded-xl border border-gray-200 focus:border-[#AF0D0E] focus:ring-4 focus:ring-[#AF0D0E]/10 bg-white/50 transition-all outline-none min-w-40 font-medium text-gray-700 appearance-none w-full ${
                  isRTL ? "pl-10" : "pr-10"
                }`}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">
                  {isRTL ? "كل الأنواع" : "All Types"}
                </option>
                <option value="book">{isRTL ? "كتب" : "Books"}</option>
                <option value="product">{isRTL ? "منتجات" : "Products"}</option>
              </select>
              <ChevronDown
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${
                  isRTL ? "left-3" : "right-3"
                }`}
              />
            </div>

            {/* Clear Filters */}
            {(searchQuery ||
              statusFilter !== "all" ||
              typeFilter !== "all") && (
              <button
                className="px-4 py-3 text-gray-500 hover:text-[#AF0D0E] hover:bg-red-50 rounded-xl transition-all font-medium flex items-center gap-2"
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
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-200 shadow-xl mx-auto">
                <Receipt className="w-16 h-16 text-gray-300" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {orders.length === 0
                ? isRTL
                  ? "لا توجد طلبات بعد"
                  : "No orders yet"
                : isRTL
                  ? "لا توجد نتائج"
                  : "No results found"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
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
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5" />
                {isRTL ? "تسوق الآن" : "Shop Now"}
              </button>
            )}
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
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <StatusBadge status={order.status} />
                        <TypeBadge type={getOrderType(order)} />
                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          #{order.purchaseSerial || order._id.slice(-8)}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-[#AF0D0E] transition-colors">
                        {getProductNames(order)}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <Package className="w-4 h-4 text-gray-400" />
                          {order.items?.length || 1}{" "}
                          {isRTL ? "عنصر" : "item(s)"}
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900">
                          {calculateTotal(order)}{" "}
                          <span className="text-sm font-bold text-gray-500">
                            EGP
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-5 py-2.5 bg-gray-50 hover:bg-[#AF0D0E] text-gray-700 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2 group/btn"
                      >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        {isRTL ? "التفاصيل" : "Details"}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for pending/received */}
                  {(order.status === "pending" ||
                    order.status === "received") && (
                    <div className="mt-6 pt-4 border-t border-gray-100/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {isRTL ? "حالة الطلب" : "Order Progress"}
                        </span>
                      </div>
                      <ul className="steps steps-horizontal w-full text-sm">
                        <li
                          className={`step ${
                            order.status ? "step-primary" : ""
                          }`}
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
                          className={`step ${
                            order.status === "confirmed" ? "step-primary" : ""
                          }`}
                        >
                          {isRTL ? "مكتمل" : "Completed"}
                        </li>
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
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
              className="modal-box max-w-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 p-0 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#AF0D0E]" />
                    {isRTL ? "تفاصيل الطلب" : "Order Details"}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">
                    #{selectedOrder.purchaseSerial || selectedOrder._id}
                  </p>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Status */}
                <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <StatusBadge status={selectedOrder.status} />
                  <TypeBadge type={getOrderType(selectedOrder)} />
                  <span className="text-sm font-medium text-gray-500 ml-auto">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Products */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    {isRTL ? "المنتجات" : "Products"}
                  </h4>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-gray-800">
                            {item.productSnapshot?.title || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
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
                        <p className="font-bold text-[#AF0D0E]">
                          {item.priceAtPurchase} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Info */}
                {selectedOrder.items?.some(
                  (item) => item.productType === "ECBook",
                ) && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {isRTL ? "بيانات الكتاب" : "Book Information"}
                    </h4>
                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
                      {selectedOrder.items
                        .filter((item) => item.productType === "ECBook")
                        .map((item, idx) => (
                          <div key={idx} className="space-y-2 text-sm">
                            {item.nameOnBook && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  {isRTL
                                    ? "الاسم على الكتاب:"
                                    : "Name on Book:"}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {item.nameOnBook}
                                </span>
                              </div>
                            )}
                            {item.numberOnBook && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  {isRTL
                                    ? "الرقم على الكتاب:"
                                    : "Number on Book:"}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {item.numberOnBook}
                                </span>
                              </div>
                            )}
                            {item.seriesName && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  {isRTL ? "اسم السلسلة:" : "Series Name:"}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {item.seriesName}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {isRTL ? "بيانات الدفع" : "Payment Information"}
                  </h4>
                  <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 space-y-3">
                    {selectedOrder.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">
                          {isRTL ? "طريقة الدفع:" : "Payment Method:"}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold shadow-sm">
                          {typeof selectedOrder.paymentMethod === "object"
                            ? selectedOrder.paymentMethod.name
                            : selectedOrder.paymentMethod}
                        </span>
                      </div>
                    )}
                    {selectedOrder.numberTransferredFrom && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">
                          {isRTL ? "رقم التحويل:" : "Transfer Number:"}
                        </span>
                        <span className="font-mono font-medium text-gray-900">
                          {selectedOrder.numberTransferredFrom}
                        </span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">
                          {isRTL ? "الخصم:" : "Discount:"}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          -{selectedOrder.discount} EGP
                        </span>
                      </div>
                    )}
                    <div className="divider my-3 opacity-50"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">
                        {isRTL ? "الإجمالي:" : "Total:"}
                      </span>
                      <span className="font-black text-2xl text-[#AF0D0E]">
                        {calculateTotal(selectedOrder)}{" "}
                        <span className="text-base font-bold text-gray-500">
                          EGP
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {isRTL ? "ملاحظاتك" : "Your Notes"}
                    </h4>
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 text-gray-700 text-sm whitespace-pre-wrap">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl shadow-sm transition-colors"
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
              className="modal-backdrop bg-black/20 backdrop-blur-sm"
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
