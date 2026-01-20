"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getCart,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  createCartPurchase,
} from "../../routes/cart";
import { validateCoupon } from "../../routes/marketCoupouns";
import { getUserFromToken } from "../../routes/auth-services";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Upload,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  MessageSquare,
  Percent,
  Info,
  ArrowRight,
  ArrowLeft,
  Gift,
  Package,
} from "lucide-react";
import { getAllPaymentMethods } from "../../routes/market";
import KalimaLoader from "../../components/KalimaLoader";

const CartPage = () => {
  const { t, i18n } = useTranslation("kalimaStore-Cart");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const phoneNumber = getPaymentPhoneNumber();
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    toast.success(isRTL ? "تم نسخ الرقم" : "Number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponValidation, setCouponValidation] = useState({
    isValid: false,
    message: "",
    discount: 0,
    loading: false,
  });
  const [checkoutData, setCheckoutData] = useState({
    numberTransferredFrom: "",
    paymentScreenShot: null,
    watermark: null,
    paymentMethod: "",
    notes: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [requiresBookDetails, setRequiresBookDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [checkoutCooldown, setCheckoutCooldown] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showNoPaymentModal, setShowNoPaymentModal] = useState(false);
  const [paymentMethodsLoaded, setPaymentMethodsLoaded] = useState(false);
  const [showWrongTransferNumberModal, setShowWrongTransferNumberModal] =
    useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const getPaymentMethodLabel = () => {
    const method = paymentMethods.find(
      (pm) => pm._id === checkoutData.paymentMethod,
    );
    return method?.name || "";
  };

  const getPaymentPhoneNumber = () => {
    const method = paymentMethods.find(
      (pm) => pm._id === checkoutData.paymentMethod,
    );
    return method?.phoneNumber || "";
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCart();
      if (result.success) {
        const cartData = result.data?.data?.cart || null;
        setCart(cartData);
        if (cartData) {
          const items = cartData.itemsWithDetails || cartData.items || [];
          const hasBooks = items.some(
            (item) =>
              item.productType === "ECBook" || item.product?.__t === "ECBook",
          );
          setRequiresBookDetails(hasBooks);
        } else {
          setRequiresBookDetails(false);
        }
      } else {
        setError(result.error || t("errors.fetchCartFailed"));
        toast.error(t("errors.fetchCartFailed") || "فشل في تحميل السلة");
      }
    } catch (err) {
      setError(err.message || t("errors.fetchCartFailed"));
      toast.error(t("errors.fetchCartFailed") || "فشل في تحميل السلة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await getAllPaymentMethods();
        if (res?.status === "success") {
          const activeMethods = res.data.paymentMethods.filter(
            (pm) => pm.status,
          );
          setPaymentMethods(activeMethods);
          setPaymentMethodsLoaded(true);
          if (activeMethods.length === 0) {
            setShowNoPaymentModal(true);
          }
        } else {
          setPaymentMethodsLoaded(true);
          setShowNoPaymentModal(true);
        }
      } catch (err) {
        setPaymentMethodsLoaded(true);
        setShowNoPaymentModal(true);
      }
    };
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    fetchCart();
    const user = getUserFromToken();
    if (user?.role) {
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (checkoutCooldown > 0) {
      const timer = setTimeout(
        () => setCheckoutCooldown(checkoutCooldown - 1),
        1000,
      );
      setCooldownTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [checkoutCooldown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-payment-dropdown]")) {
        setShowPaymentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedCooldown = localStorage.getItem("checkoutCooldownExpiry");
    if (savedCooldown) {
      const expiryTime = parseInt(savedCooldown);
      const now = Date.now();
      if (expiryTime > now) {
        setCheckoutCooldown(Math.ceil((expiryTime - now) / 1000));
      } else {
        localStorage.removeItem("checkoutCooldownExpiry");
      }
    }
    return () => cooldownTimer && clearTimeout(cooldownTimer);
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      setActionLoading({ ...actionLoading, [itemId]: true });
      const result = await removeFromCart(itemId);
      if (result.success) {
        await fetchCart();
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(t("success.itemRemoved") || "تم حذف العنصر من السلة");
      } else {
        toast.error(result.error || t("errors.removeItemFailed"));
      }
    } catch (err) {
      toast.error(err.message || t("errors.removeItemFailed"));
    } finally {
      setActionLoading({ ...actionLoading, [itemId]: false });
    }
  };

  const handleClearCart = async () => {
    if (!confirm(t("confirmClearCart") || "هل أنت متأكد من إفراغ السلة؟"))
      return;
    try {
      setActionLoading({ ...actionLoading, clear: true });
      const result = await clearCart();
      if (result.success) {
        setCart(null);
        setCouponCode("");
        setCouponValidation({
          isValid: false,
          message: "",
          discount: 0,
          loading: false,
        });
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(t("success.cartCleared") || "تم إفراغ السلة بنجاح");
      } else {
        toast.error(result.error || t("errors.clearCartFailed"));
      }
    } catch (err) {
      toast.error(err.message || t("errors.clearCartFailed"));
    } finally {
      setActionLoading({ ...actionLoading, clear: false });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("errors.noCouponCode") || "يرجى إدخال كود الخصم");
      return;
    }
    setCouponValidation({ ...couponValidation, loading: true, message: "" });
    try {
      const validationResult = await validateCoupon(couponCode);
      if (
        !validationResult.success ||
        validationResult.data?.status === "fail"
      ) {
        const errorMessage =
          validationResult.data?.message ||
          validationResult.error ||
          t("errors.invalidCoupon");
        setCouponValidation({
          isValid: false,
          message: errorMessage,
          discount: 0,
          loading: false,
        });
        toast.error(errorMessage);
        return;
      }
      const applyResult = await applyCouponToCart(couponCode);
      if (applyResult.success) {
        setCouponValidation({
          isValid: true,
          message: t("success.couponApplied") || "تم تطبيق الكوبون بنجاح",
          discount: validationResult.data?.data?.coupon?.value || 0,
          loading: false,
        });
        await fetchCart();
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(t("success.couponApplied") || "تم تطبيق الكوبون بنجاح");
      } else {
        setCouponValidation({
          isValid: false,
          message: applyResult.error,
          discount: 0,
          loading: false,
        });
        toast.error(applyResult.error);
      }
    } catch (err) {
      setCouponValidation({
        isValid: false,
        message: err.message,
        discount: 0,
        loading: false,
      });
      toast.error(err.message);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setCouponValidation({
      isValid: false,
      message: "",
      discount: 0,
      loading: false,
    });
    await fetchCart();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setCheckoutData({
        ...checkoutData,
        paymentScreenShot: e.target.files[0],
      });
      clearFieldError("paymentScreenShot");
    }
  };

  const handleWatermarkChange = (e) => {
    if (e.target.files?.[0]) {
      setCheckoutData({ ...checkoutData, watermark: e.target.files[0] });
    }
  };

  const clearFieldError = (fieldName) => {
    setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const validateCheckoutForm = () => {
    const errors = {};
    let isValid = true;

    if (cart.total > 0) {
      if (!checkoutData.numberTransferredFrom.trim()) {
        errors.numberTransferredFrom =
          t("errors.noTransferNumber") || "يرجى إدخال رقم التحويل";
        isValid = false;
      } else if (checkoutData.numberTransferredFrom.trim().length !== 11) {
        errors.numberTransferredFrom =
          t("errors.invalidTransferNumberLength") ||
          "رقم التحويل يجب أن يتكون من 11 رقم";
        isValid = false;
      }
      if (!checkoutData.paymentScreenShot) {
        errors.paymentScreenShot =
          t("errors.noFileSelected") || "يرجى رفع صورة الدفع";
        isValid = false;
      }
      if (!checkoutData.paymentMethod) {
        errors.paymentMethod =
          t("errors.paymentMethodRequired") || "Payment method is required";
        isValid = false;
      }
    }

    if (requiresBookDetails) {
      if (!checkoutData.nameOnBook.trim()) {
        errors.nameOnBook =
          t("errors.nameOnBookRequired") || "Name on book is required";
        isValid = false;
      }
      if (!checkoutData.numberOnBook.trim()) {
        errors.numberOnBook =
          t("errors.numberOnBookRequired") || "Number on book is required";
        isValid = false;
      }
      if (!checkoutData.seriesName.trim()) {
        errors.seriesName =
          t("errors.seriesNameRequired") || "Series name is required";
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleCheckout = async () => {
    if (checkoutCooldown > 0) {
      toast.error(
        t("errors.checkoutCooldown", { seconds: checkoutCooldown }) ||
          `يرجى الانتظار ${checkoutCooldown} ثانية`,
      );
      return;
    }
    setValidationErrors({});
    if (!validateCheckoutForm()) {
      toast.error(
        t("errors.validationFailed") || "يرجى ملء جميع الحقول المطلوبة",
      );
      return;
    }
    try {
      setCheckoutLoading(true);
      const result = await createCartPurchase(checkoutData);
      if (result.success) {
        const cooldownSeconds = 30;
        localStorage.setItem(
          "checkoutCooldownExpiry",
          (Date.now() + cooldownSeconds * 1000).toString(),
        );
        setCheckoutCooldown(cooldownSeconds);
        toast.success(
          t("success.purchaseSubmitted") || "تم تقديم الطلب بنجاح!",
        );
        window.dispatchEvent(new Event("cart-updated"));
        setCheckoutData({
          numberTransferredFrom: "",
          paymentScreenShot: null,
          watermark: null,
          paymentMethod: "",
          notes: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        });
        setTimeout(() => navigate("/my-orders"), 1000);
      } else {
        toast.error(result.error || t("errors.checkoutFailed"));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          t("errors.checkoutFailed"),
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const convertPathToUrl = (filePath, folder = "product_thumbnails") => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    const normalizedPath = filePath.replace(/\\/g, "/");
    const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
    const baseUrl = API_URL.replace(/\/$/, "");
    const filename = normalizedPath.split("/").pop();
    return `${baseUrl}/uploads/${folder}/${filename}`;
  };

  const cartItems = cart?.itemsWithDetails || cart?.items || [];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Loading State
  if (loading) {
    return <KalimaLoader fullScreen={false} />;
  }

  // Error State
  if (error && !cart) {
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
            {t("errors.fetchCartFailed") || "Failed to load cart"}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/market")}
            className="px-8 py-4 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
          >
            {t("backToMarket") || "Back to Market"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Empty Cart
  if (!cart || cartItems.length === 0) {
    return (
      <div
        className={`min-h-screen relative overflow-hidden ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Background matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#AF0D0E]/10 via-[#FF5C28]/10 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF5C28]/10 via-[#AF0D0E]/5 to-transparent rounded-full blur-[100px]"
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #AF0D0E 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-2xl mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block mb-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-40 h-40 rounded-[2.5rem] bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-200 shadow-xl"
              >
                <ShoppingCart className="w-20 h-20 text-gray-300" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#AF0D0E] to-[#FF5C28] flex items-center justify-center shadow-xl shadow-red-500/40"
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-5">
              {isRTL ? "سلتك فارغة" : "Your Cart is Empty"}
            </h2>
            <p className="text-gray-600 mb-12 text-xl max-w-sm mx-auto">
              {isRTL
                ? "اكتشف منتجاتنا المميزة وابدأ التسوق الآن!"
                : "Discover our amazing products and start shopping!"}
            </p>
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(175, 13, 14, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/market")}
              className="group px-10 py-5 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-500/25 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <ShoppingBag className="w-6 h-6" />
              {isRTL ? "تصفح المتجر" : "Browse Store"}
              <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${isRTL ? "rtl" : "ltr"}`}
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

      {/* Header */}
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
                  <ShoppingCart className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white"
                >
                  {cartItems.length}
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {isRTL ? "سلة التسوق" : "Shopping Cart"}
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  {cartItems.length}{" "}
                  {isRTL ? "منتج في سلتك" : "item(s) in your cart"}
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
                  {isRTL ? "متابعة التسوق" : "Continue Shopping"}
                </span>
                <ArrowIcon
                  className={`w-5 h-5 text-gray-400 group-hover:text-[#AF0D0E] transition-all duration-300 ${isRTL ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-3 space-y-5">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-[#AF0D0E] to-[#FF5C28] rounded-full" />
                {isRTL ? "منتجاتك" : "Your Items"}
              </h2>
              <button
                onClick={handleClearCart}
                disabled={actionLoading.clear}
                className="flex items-center gap-2 px-4 py-2 text-[#AF0D0E] hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
              >
                {actionLoading.clear ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isRTL ? "إفراغ السلة" : "Clear All"}
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const itemData = item.product || item;
                const productSnapshot = item.productSnapshot || itemData;
                const itemId = item._id;
                const price =
                  item.finalPrice ||
                  item.priceAtAdd ||
                  productSnapshot?.priceAfterDiscount ||
                  productSnapshot?.price;
                const originalPrice =
                  productSnapshot?.originalPrice || productSnapshot?.price;

                return (
                  <motion.div
                    key={itemId}
                    initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.08,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#AF0D0E]/20 transition-all duration-300"
                  >
                    <div className="relative flex gap-5">
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        disabled={actionLoading[itemId]}
                        className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-[#AF0D0E] flex items-center justify-center transition-all duration-200 z-10`}
                      >
                        {actionLoading[itemId] ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>

                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                          <img
                            src={
                              convertPathToUrl(
                                productSnapshot?.thumbnail,
                                "product_thumbnails",
                              ) || "/placeholder.svg"
                            }
                            alt={productSnapshot?.title || "Product"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-[#AF0D0E] transition-colors">
                            {productSnapshot?.title ||
                              itemData?.title ||
                              "Product"}
                          </h3>
                          {productSnapshot?.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 hidden sm:block">
                              {productSnapshot.description}
                            </p>
                          )}
                          {/* Item Type Badge */}
                          <div
                            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              item.productType === "ECBook" ||
                              item.product?.__t === "ECBook"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                            }`}
                          >
                            {item.productType === "ECBook" ||
                            item.product?.__t === "ECBook" ? (
                              <BookOpen className="w-3.5 h-3.5" />
                            ) : (
                              <Package className="w-3.5 h-3.5" />
                            )}
                            {item.productType === "ECBook" ||
                            item.product?.__t === "ECBook"
                              ? t("type.book")
                              : t("type.product")}
                          </div>
                        </div>
                        <div className="flex items-end gap-3 mt-3">
                          <span className="text-2xl font-black bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] bg-clip-text text-transparent">
                            {price}{" "}
                            <span className="text-base font-bold">
                              {t("currency") || "EGP"}
                            </span>
                          </span>
                          {originalPrice > price && (
                            <span className="text-sm text-gray-400 line-through mb-1">
                              {originalPrice} {t("currency") || "EGP"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Checkout Panel - Right Side */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-5">
              {/* Order Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] px-6 py-5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    {isRTL ? "ملخص الطلب" : "Order Summary"}
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Coupon Section */}
                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                      <Percent className="w-4 h-4 text-[#FF5C28]" />
                      {isRTL ? "كود الخصم" : "Discount Code"}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder={
                            isRTL ? "أدخل الكود هنا" : "Enter code here"
                          }
                          className={`w-full h-12 px-4 bg-gray-50 border-2 rounded-xl font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#AF0D0E]/20 transition-all ${
                            couponValidation.isValid
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 focus:border-[#AF0D0E]"
                          }`}
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          disabled={
                            couponValidation.isValid || couponValidation.loading
                          }
                        />
                        {couponValidation.isValid && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      {couponValidation.isValid ? (
                        <button
                          onClick={handleRemoveCoupon}
                          className="w-12 h-12 rounded-xl bg-red-100 text-[#AF0D0E] flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponValidation.loading || !couponCode}
                          className="px-5 h-12 rounded-xl bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/25 transition-all"
                        >
                          {couponValidation.loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : isRTL ? (
                            "تطبيق"
                          ) : (
                            "Apply"
                          )}
                        </button>
                      )}
                    </div>
                    {couponValidation.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm mt-2 font-medium ${couponValidation.isValid ? "text-emerald-600" : "text-[#AF0D0E]"}`}
                      >
                        {couponValidation.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* Price Breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span className="font-semibold">
                        {cart.subtotal} {t("currency") || "EGP"}
                      </span>
                    </div>
                    {cart.discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex justify-between items-center text-emerald-600"
                      >
                        <span className="flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          {isRTL ? "الخصم" : "Discount"}
                        </span>
                        <span className="font-semibold">
                          -{cart.discount} {t("currency") || "EGP"}
                        </span>
                      </motion.div>
                    )}
                    <div className="h-px bg-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {isRTL ? "الإجمالي" : "Total"}
                      </span>
                      <span className="text-2xl font-black bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] bg-clip-text text-transparent">
                        {cart.total} {t("currency") || "EGP"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 space-y-5"
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#AF0D0E]" />
                  </div>
                  {isRTL ? "تفاصيل الدفع" : "Payment Details"}
                </h3>

                {/* Payment Method Dropdown */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {isRTL ? "طريقة الدفع" : "Payment Method"}{" "}
                    <span className="text-[#AF0D0E]">*</span>
                  </label>
                  <div className="relative" data-payment-dropdown>
                    <button
                      onClick={() =>
                        setShowPaymentDropdown(!showPaymentDropdown)
                      }
                      className={`w-full h-14 px-4 flex items-center justify-between bg-gray-50 border-2 rounded-2xl transition-all ${
                        validationErrors.paymentMethod
                          ? "border-red-300 bg-red-50"
                          : showPaymentDropdown
                            ? "border-[#AF0D0E] ring-4 ring-[#AF0D0E]/10"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {checkoutData.paymentMethod ? (
                        <div className="flex items-center gap-3">
                          {paymentMethods.find(
                            (pm) => pm._id === checkoutData.paymentMethod,
                          )?.paymentMethodImg && (
                            <img
                              src={convertPathToUrl(
                                paymentMethods.find(
                                  (pm) => pm._id === checkoutData.paymentMethod,
                                )?.paymentMethodImg,
                                "payment_methods",
                              )}
                              alt=""
                              className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-gray-100"
                            />
                          )}
                          <span className="font-semibold text-gray-700">
                            {
                              paymentMethods.find(
                                (pm) => pm._id === checkoutData.paymentMethod,
                              )?.name
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {isRTL ? "اختر طريقة الدفع" : "Select payment method"}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showPaymentDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {showPaymentDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {paymentMethods.map((method) => (
                            <button
                              key={method._id}
                              onClick={() => {
                                setCheckoutData({
                                  ...checkoutData,
                                  paymentMethod: method._id,
                                });
                                clearFieldError("paymentMethod");
                                setShowPaymentDropdown(false);
                              }}
                              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                                checkoutData.paymentMethod === method._id
                                  ? "bg-red-50"
                                  : ""
                              }`}
                            >
                              {method.paymentMethodImg && (
                                <img
                                  src={convertPathToUrl(
                                    method.paymentMethodImg,
                                    "payment_methods",
                                  )}
                                  alt=""
                                  className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-gray-100"
                                />
                              )}
                              <span className="font-semibold flex-1 text-left rtl:text-right text-gray-700">
                                {method.name}
                              </span>
                              {checkoutData.paymentMethod === method._id && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {validationErrors.paymentMethod && (
                    <p className="text-[#AF0D0E] text-sm mt-2 font-medium">
                      {validationErrors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Payment Phone Number */}
                {cart.total > 0 && checkoutData.paymentMethod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/50"
                  >
                    <p className="text-sm text-amber-800 font-medium text-center mb-3">
                      {isRTL
                        ? `حوّل على رقم ${getPaymentMethodLabel()}`
                        : `Transfer to ${getPaymentMethodLabel()} number`}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white rounded-xl font-bold text-xl text-slate-800 hover:bg-slate-50 border border-amber-200 transition-colors"
                    >
                      <span dir="ltr">{getPaymentPhoneNumber()}</span>
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Transfer Number Input */}
                {cart.total > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        {isRTL ? "رقم المحول منه" : "Transfer Number"}{" "}
                        <span className="text-[#AF0D0E]">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder={
                          isRTL
                            ? "أدخل الرقم (11 رقم)"
                            : "Enter number (11 digits)"
                        }
                        className={`w-full h-14 px-4 bg-gray-50 border-2 rounded-2xl font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#AF0D0E]/20 transition-all ${
                          validationErrors.numberTransferredFrom
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-[#AF0D0E]"
                        }`}
                        value={checkoutData.numberTransferredFrom}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 11);
                          setCheckoutData({
                            ...checkoutData,
                            numberTransferredFrom: value,
                          });
                          if (value.length > 0 && value.length !== 11) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              numberTransferredFrom: `${value.length}/11`,
                            }));
                          } else {
                            clearFieldError("numberTransferredFrom");
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          const paymentPhone = getPaymentPhoneNumber();
                          if (value && paymentPhone && value === paymentPhone) {
                            setShowWrongTransferNumberModal(true);
                            setCheckoutData({
                              ...checkoutData,
                              numberTransferredFrom: "",
                            });
                          }
                        }}
                      />
                      {validationErrors.numberTransferredFrom && (
                        <p className="text-[#AF0D0E] text-sm mt-2 font-medium">
                          {validationErrors.numberTransferredFrom}
                        </p>
                      )}
                    </div>

                    {/* Payment Screenshot Upload */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        {isRTL ? "صورة إيصال الدفع" : "Payment Screenshot"}{" "}
                        <span className="text-[#AF0D0E]">*</span>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          validationErrors.paymentScreenShot
                            ? "border-red-300 bg-red-50"
                            : checkoutData.paymentScreenShot
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 hover:border-[#AF0D0E] hover:bg-red-50/30"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {checkoutData.paymentScreenShot ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="text-sm text-emerald-600 font-semibold truncate max-w-[200px] block">
                              {checkoutData.paymentScreenShot.name}
                            </span>
                          </motion.div>
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                              {isRTL
                                ? "اضغط لرفع الصورة"
                                : "Click to upload image"}
                            </span>
                          </div>
                        )}
                      </label>
                      {validationErrors.paymentScreenShot && (
                        <p className="text-[#AF0D0E] text-sm mt-2 font-medium">
                          {validationErrors.paymentScreenShot}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Watermark Upload */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {isRTL ? "العلامة المائية" : "Watermark"}{" "}
                    <span className="text-gray-400 font-normal">
                      ({isRTL ? "اختياري" : "Optional"})
                    </span>
                  </label>
                  <div className="bg-blue-50 rounded-xl p-3 mb-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-blue-700">
                      {isRTL
                        ? "العلامة المائية قد تسبب مشاكل في الطباعة"
                        : "Watermark may cause printing issues"}
                    </span>
                  </div>
                  <label
                    className={`flex items-center justify-center w-full h-16 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      checkoutData.watermark
                        ? "border-violet-400 bg-violet-50"
                        : "border-gray-200 hover:border-violet-400 hover:bg-violet-50/30"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleWatermarkChange}
                    />
                    {checkoutData.watermark ? (
                      <span className="text-sm text-violet-600 font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {checkoutData.watermark.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        {isRTL ? "رفع علامة مائية" : "Upload watermark"}
                      </span>
                    )}
                  </label>
                </div>
              </motion.div>

              {/* Book Details */}
              {requiresBookDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-[#AF0D0E]/5 via-white to-[#FF5C28]/5 rounded-2xl p-6 border border-[#AF0D0E]/10 space-y-4"
                >
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AF0D0E]/10 to-[#FF5C28]/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#AF0D0E]" />
                    </div>
                    {isRTL ? "بيانات الكتاب" : "Book Details"}
                  </h3>
                  {[
                    {
                      key: "nameOnBook",
                      label: isRTL ? "الاسم على الكتاب" : "Name on Book",
                    },
                    {
                      key: "numberOnBook",
                      label: isRTL ? "الرقم على الكتاب" : "Number on Book",
                    },
                    {
                      key: "seriesName",
                      label: isRTL ? "اسم السلسلة" : "Series Name",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        className={`w-full h-12 px-4 bg-white border-2 rounded-xl font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#AF0D0E]/20 transition-all ${
                          validationErrors[field.key]
                            ? "border-red-300"
                            : "border-gray-200 focus:border-[#AF0D0E]"
                        }`}
                        value={checkoutData[field.key]}
                        onChange={(e) => {
                          const value =
                            field.key === "numberOnBook"
                              ? e.target.value.replace(/\D/g, "")
                              : e.target.value;
                          setCheckoutData({
                            ...checkoutData,
                            [field.key]: value,
                          });
                          clearFieldError(field.key);
                        }}
                      />
                      {validationErrors[field.key] && (
                        <p className="text-[#AF0D0E] text-xs mt-1 font-medium">
                          {validationErrors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Notes Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100"
              >
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  {isRTL ? "ملاحظات" : "Notes"}
                </label>
                <textarea
                  placeholder={
                    isRTL
                      ? "ملاحظات إضافية (اختياري)"
                      : "Additional notes (optional)"
                  }
                  className="w-full h-24 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#AF0D0E]/20 focus:border-[#AF0D0E] transition-all resize-none"
                  value={checkoutData.notes}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, notes: e.target.value })
                  }
                />
              </motion.div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(175, 13, 14, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={checkoutLoading || checkoutCooldown > 0}
                className="w-full py-5 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-red-500/25 transition-all flex items-center justify-center gap-3"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {isRTL ? "جاري المعالجة..." : "Processing..."}
                  </>
                ) : checkoutCooldown > 0 ? (
                  <>
                    {isRTL
                      ? `انتظر ${checkoutCooldown} ثانية`
                      : `Wait ${checkoutCooldown}s`}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    {isRTL ? "إتمام الطلب" : "Complete Order"}
                    <ArrowIcon className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {checkoutCooldown > 0 && (
                <p className="text-center text-sm text-gray-500 font-medium">
                  {isRTL
                    ? `يرجى الانتظار ${checkoutCooldown} ثانية قبل المحاولة مرة أخرى`
                    : `Please wait ${checkoutCooldown} seconds before trying again`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No Payment Modal */}
      <AnimatePresence>
        {showNoPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {isRTL ? "عذراً!" : "Sorry!"}
              </h3>
              <p className="text-gray-600 mb-8">
                {isRTL
                  ? "المنصة متوقفة عن استقبال الطلبات حالياً"
                  : "Platform is not accepting orders at the moment"}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/market")}
                className="w-full py-4 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
              >
                {isRTL ? "العودة للمتجر" : "Back to Store"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wrong Number Modal */}
      <AnimatePresence>
        {showWrongTransferNumberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-[#AF0D0E]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {isRTL ? "انتبه!" : "Attention!"}
              </h3>
              <p className="text-gray-700 font-medium mb-2">
                {isRTL
                  ? "هذا ليس رقم التحويل!"
                  : "This is not the transfer number!"}
              </p>
              <p className="text-gray-500 text-sm mb-8">
                {isRTL
                  ? "رقم التحويل هو الرقم الذي حولت منه، وليس الرقم الذي حولت إليه."
                  : "Transfer number is the number you transferred FROM, not the one you transferred TO."}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWrongTransferNumberModal(false)}
                className="w-full py-4 bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
              >
                {isRTL ? "فهمت" : "I Understand"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
