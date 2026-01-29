"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  Eye,
  Search,
  Calendar,
  ShoppingBag,
  BookOpen,
  X,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronDown,
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
        color: "bg-warning/10 text-warning border-warning/20",
        icon: Clock,
        text: isRTL ? "قيد الانتظار" : "Pending",
      },
      received: {
        color: "bg-info/10 text-info border-info/20",
        icon: Package,
        text: isRTL ? "تم الاستلام" : "Received",
      },
      confirmed: {
        color: "bg-success/10 text-success border-success/20",
        icon: CheckCircle2,
        text: isRTL ? "مؤكد" : "Confirmed",
      },
      returned: {
        color: "bg-error/10 text-error border-error/20",
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
        <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-info/10 text-info border-info/20 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {isRTL ? "كتاب" : "Book"}
        </div>
      );
    }
    if (type === "mixed") {
      return (
        <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-accent/10 text-accent border-accent/20 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {isRTL ? "مختلط" : "Mixed"}
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-lg text-xs font-bold border bg-secondary/10 text-secondary border-secondary/20 flex items-center gap-1.5">
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Background matching landing page */}
        <div className="absolute inset-0 bg-base-100" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full blur-[100px]"
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--color-primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-error/10 flex items-center justify-center mx-auto mb-8 border border-error/20">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
          <h3 className="text-3xl font-black text-base-content mb-4">
            {isRTL ? "حدث خطأ!" : "Oops!"}
          </h3>
          <p className="text-base-content/70 mb-10 text-lg">
            {error ||
              (isRTL ? "فشل في تحميل الطلبات" : "Failed to load orders")}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/25"
          >
            {isRTL ? "إعادة المحاولة" : "Try Again"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${isRTL ? "rtl" : "ltr"
        }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background matching landing page */}
      <div className="absolute inset-0 bg-base-100" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 via-primary/5 to-transparent rounded-full blur-[100px] pointer-events-none"
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--color-primary)) 1px, transparent 0)`,
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
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/30"
                >
                  <Receipt className="w-8 h-8 text-primary-content" />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-content text-sm font-bold shadow-lg ring-2 ring-base-100">
                  {orders.length}
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-base-content">
                  {isRTL ? "طلباتي" : "My Orders"}
                </h1>
                <p className="text-sm text-base-content/60 mt-1 flex items-center gap-1.5">
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
              className="btn-ghost btn-lg gap-3 bg-base-100 hover:bg-base-200 border-2 border-base-200 hover:border-primary/40 shadow-lg shadow-base-200/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden h-auto py-3.5 px-6 rounded-2xl"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-base-200 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-secondary/10 flex items-center justify-center transition-all duration-300">
                  <ShoppingBag className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors duration-300" />
                </div>
                <span className="text-base-content/80 group-hover:text-primary transition-colors duration-300">
                  {isRTL ? "تصفح المتجر" : "Browse Store"}
                </span>
                <ArrowRight
                  className={`w-5 h-5 text-base-content/40 group-hover:text-primary transition-all duration-300 ${isRTL
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-base-content group-hover:text-primary transition-colors">
                  {orders.length}
                </p>
                <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                  {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center group-hover:bg-warning/30 transition-colors">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-black text-base-content group-hover:text-warning transition-colors">
                  {
                    orders.filter(
                      (o) => o.status === "pending" || o.status === "received",
                    ).length
                  }
                </p>
                <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                  {isRTL ? "قيد التنفيذ" : "In Progress"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center group-hover:bg-success/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-black text-base-content group-hover:text-success transition-colors">
                  {orders.filter((o) => o.status === "confirmed").length}
                </p>
                <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                  {isRTL ? "مكتملة" : "Completed"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center group-hover:bg-info/20 transition-colors">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-black text-base-content group-hover:text-info transition-colors">
                  {orders.filter((o) => getOrderType(o) === "book").length}
                </p>
                <p className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
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
          className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-base-200 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder={isRTL ? "ابحث عن طلب..." : "Search orders..."}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-base-200 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-base-100/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className={`py-3 px-4 rounded-xl border border-base-200 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-base-100/50 transition-all outline-none min-w-40 font-medium text-base-content appearance-none w-full ${isRTL ? "pl-10" : "pr-10"
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
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none ${isRTL ? "left-3" : "right-3"
                  }`}
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                className={`py-3 px-4 rounded-xl border border-base-200 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-base-100/50 transition-all outline-none min-w-40 font-medium text-base-content appearance-none w-full ${isRTL ? "pl-10" : "pr-10"
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
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none ${isRTL ? "left-3" : "right-3"
                  }`}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            statusFilter !== "all" ||
            typeFilter !== "all") && (
              <button
                className="px-4 py-3 text-base-content/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-all font-medium flex items-center gap-2"
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
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-base-100/80 backdrop-blur-sm flex items-center justify-center border border-base-200 shadow-xl mx-auto">
                <Receipt className="w-16 h-16 text-base-content/20" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-base-content mb-2">
              {orders.length === 0
                ? isRTL
                  ? "لا توجد طلبات بعد"
                  : "No orders yet"
                : isRTL
                  ? "لا توجد نتائج"
                  : "No results found"}
            </h3>
            <p className="text-base-content/60 mb-8 max-w-sm mx-auto">
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
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-content font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-1"
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
                  className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <StatusBadge status={order.status} />
                        <TypeBadge type={getOrderType(order)} />
                        <span className="text-xs text-base-content/40 font-mono bg-base-200/50 px-2 py-1 rounded-md border border-base-200">
                          #{order.purchaseSerial || order._id.slice(-8)}
                        </span>
                      </div>

                      <h3 className="font-bold text-base-content text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {getProductNames(order)}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                        <span className="flex items-center gap-1.5 bg-base-200/50 px-2 py-1 rounded-lg">
                          <Calendar className="w-4 h-4 text-base-content/40" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-base-200/50 px-2 py-1 rounded-lg">
                          <Package className="w-4 h-4 text-base-content/40" />
                          {order.items?.length || 1}{" "}
                          {isRTL ? "عنصر" : "item(s)"}
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-2xl font-black text-base-content">
                          {calculateTotal(order)}{" "}
                          <span className="text-sm font-bold text-base-content/60">
                            EGP
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-5 py-2.5 bg-base-200 hover:bg-primary text-base-content hover:text-white rounded-xl font-bold transition-all flex items-center gap-2 group/btn"
                      >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        {isRTL ? "التفاصيل" : "Details"}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for pending/received */}
                  {(order.status === "pending" ||
                    order.status === "received") && (
                      <div className="mt-6 pt-4 border-t border-base-200/50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-base-content/40 uppercase tracking-wider">
                            {isRTL ? "حالة الطلب" : "Order Progress"}
                          </span>
                        </div>
                        <ul className="steps steps-horizontal w-full text-sm">
                          <li
                            className={`step ${order.status ? "step-primary" : ""
                              }`}
                          >
                            {isRTL ? "تم الطلب" : "Ordered"}
                          </li>
                          <li
                            className={`step ${order.status === "received" ||
                              order.status === "confirmed"
                              ? "step-primary"
                              : ""
                              }`}
                          >
                            {isRTL ? "جاري المعالجة" : "Processing"}
                          </li>
                          <li
                            className={`step ${order.status === "confirmed" ? "step-primary" : ""
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
              className="modal-box max-w-3xl bg-base-100/95 backdrop-blur-md shadow-2xl border border-base-content/10 p-0 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-base-200/50 to-base-100 p-6 border-b border-base-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-base-content flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    {isRTL ? "تفاصيل الطلب" : "Order Details"}
                  </h3>
                  <p className="text-sm text-base-content/60 font-mono mt-1">
                    #{selectedOrder.purchaseSerial || selectedOrder._id}
                  </p>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content/60 transition-colors"
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
                <div className="flex items-center gap-3 mb-8 bg-base-200/30 p-4 rounded-xl border border-base-200/50">
                  <StatusBadge status={selectedOrder.status} />
                  <TypeBadge type={getOrderType(selectedOrder)} />
                  <span className="text-sm font-medium text-base-content/60 ml-auto">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Products */}
                <div className="mb-8">
                  <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-base-content/40" />
                    {isRTL ? "المنتجات" : "Products"}
                  </h4>
                  <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-base-content">
                            {item.productSnapshot?.title || "Unknown"}
                          </p>
                          <p className="text-sm text-base-content/60 mt-1">
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
                        <p className="font-bold text-primary">
                          {item.priceAtPurchase} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Info (if applicable) */}
                {selectedOrder.items?.some(
                  (item) => item.productType === "ECBook",
                ) && (
                    <div className="mb-8">
                      <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-base-content/40" />
                        {isRTL ? "بيانات الكتاب" : "Book Information"}
                      </h4>
                      <div className="bg-info/5 rounded-xl p-4 border border-info/10 space-y-3">
                        {selectedOrder.items
                          .filter((item) => item.productType === "ECBook")
                          .map((item, idx) => (
                            <div key={idx} className="space-y-2 text-sm">
                              {item.nameOnBook && (
                                <div className="flex justify-between">
                                  <span className="text-base-content/60">
                                    {isRTL
                                      ? "الاسم على الكتاب:"
                                      : "Name on Book:"}
                                  </span>
                                  <span className="font-semibold text-base-content">
                                    {item.nameOnBook}
                                  </span>
                                </div>
                              )}
                              {item.numberOnBook && (
                                <div className="flex justify-between">
                                  <span className="text-base-content/60">
                                    {isRTL
                                      ? "الرقم على الكتاب:"
                                      : "Number on Book:"}
                                  </span>
                                  <span className="font-semibold text-base-content">
                                    {item.numberOnBook}
                                  </span>
                                </div>
                              )}
                              {item.seriesName && (
                                <div className="flex justify-between">
                                  <span className="text-base-content/60">
                                    {isRTL ? "اسم السلسلة:" : "Series Name:"}
                                  </span>
                                  <span className="font-semibold text-base-content">
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
                  <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-base-content/40" />
                    {isRTL ? "بيانات الدفع" : "Payment Information"}
                  </h4>
                  <div className="bg-base-200/30 rounded-xl p-5 border border-base-200/50 space-y-3">
                    {selectedOrder.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">
                          {isRTL ? "طريقة الدفع:" : "Payment Method:"}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-base-100 border border-base-200 text-xs font-bold shadow-sm">
                          {typeof selectedOrder.paymentMethod === "object"
                            ? selectedOrder.paymentMethod.name
                            : selectedOrder.paymentMethod}
                        </span>
                      </div>
                    )}
                    {selectedOrder.numberTransferredFrom && (
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">
                          {isRTL ? "رقم التحويل:" : "Transfer Number:"}
                        </span>
                        <span className="font-mono font-medium text-base-content">
                          {selectedOrder.numberTransferredFrom}
                        </span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">
                          {isRTL ? "الخصم:" : "Discount:"}
                        </span>
                        <span className="text-success font-bold">
                          -{selectedOrder.discount} EGP
                        </span>
                      </div>
                    )}
                    <div className="divider my-3 opacity-50"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-base-content">
                        {isRTL ? "الإجمالي:" : "Total:"}
                      </span>{" "}
                      <span className="font-bold text-primary text-xl">
                        {calculateTotal(selectedOrder)} EGP
                      </span>
                      <span className="font-black text-2xl text-primary">
                        {calculateTotal(selectedOrder)}{" "}
                        <span className="text-base font-bold text-base-content/60">
                          EGP
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-base-content/40" />
                      {isRTL ? "ملاحظاتك" : "Your Notes"}
                    </h4>
                    <div className="bg-warning/5 rounded-xl p-4 border border-warning/10 text-base-content/80 text-sm whitespace-pre-wrap">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-end">
                  <button
                    className="px-6 py-2.5 bg-base-100 border border-base-200 hover:bg-base-200 text-base-content font-bold rounded-xl shadow-sm transition-colors"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedOrder(null);
                    }}
                  >
                    {isRTL ? "إغلاق" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
            <div
              className="modal-backdrop bg-base-100/20 backdrop-blur-sm"
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
