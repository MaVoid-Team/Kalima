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
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  ShoppingCartIcon,
  CircleCheckBigIcon,
} from "lucide-react";
import { getAllPaymentMethods } from "../../routes/market";

const CartPage = () => {
  const { t, i18n } = useTranslation("kalimaStore-Cart");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
    

  const handleCopy = () => {
    const phoneNumber = getPaymentPhoneNumber();
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); 
  };

  // Get payment method label

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
  const [validationErrors, setValidationErrors] = useState({
    numberTransferredFrom: "",
    paymentScreenShot: "",
    paymentMethod: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
  });
  const [checkoutCooldown, setCheckoutCooldown] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showNoPaymentModal, setShowNoPaymentModal] = useState(false);
  const [paymentMethodsLoaded, setPaymentMethodsLoaded] = useState(false);
  const [showWrongTransferNumberModal, setShowWrongTransferNumberModal] = useState(false);

  const getPaymentMethodLabel = () => {
    const method = paymentMethods.find(
      (pm) => pm._id === checkoutData.paymentMethod
    );
    return method?.name || "";
  };

  const getPaymentPhoneNumber = () => {
    const method = paymentMethods.find(
      (pm) => pm._id === checkoutData.paymentMethod
    );
    return method?.phoneNumber || "";
  };

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCart();
      if (result.success) {
        // Handle response: {"status":"success","data":{"cart":null,"itemCount":0}}
        const cartData = result.data?.data?.cart || null;
        const itemCount = result.data?.data?.itemCount || 0;

        setCart(cartData);

        // Check if cart has books (only if cart exists)
        if (cartData) {
          // The items might be in itemsWithDetails or items (need to populate)
          const items = cartData.itemsWithDetails || cartData.items || [];
          const hasBooks = items.some(
            (item) =>
              item.productType === "ECBook" || item.product?.__t === "ECBook"
          );
          setRequiresBookDetails(hasBooks);
        } else {
          // No cart, reset book details requirement
          setRequiresBookDetails(false);
        }
      } else {
        const errorMessage =
          result.error || t("errors.fetchCartFailed") || "Failed to load cart";
        setError(errorMessage);
        toast.error(t("errors.fetchCartFailed") || "فشل في تحميل السلة");
      }
    } catch (err) {
      const errorMessage =
        err.message || t("errors.fetchCartFailed") || "Failed to load cart";
      setError(errorMessage);
      toast.error(t("errors.fetchCartFailed") || "فشل في تحميل السلة");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await getAllPaymentMethods();

        if (res?.status === "success") {
          const activeMethods = res.data.paymentMethods.filter((pm) => pm.status);
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
        console.error("Failed to fetch payment methods", err);
        setPaymentMethodsLoaded(true);
        setShowNoPaymentModal(true);
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    fetchCart();
    // Get user role
    const user = getUserFromToken();
    console.log("CartPage - Full User Object:", user); // Debug log
    if (user && user.role) {
      setUserRole(user.role);
      console.log("CartPage - User Role Set To:", user.role); // Debug log
      console.log("CartPage - Is Teacher?", user.role === "Teacher");
      console.log("CartPage - Is Lecturer?", user.role === "Lecturer");
    } else {
      console.log("CartPage - No user or no role found");
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (checkoutCooldown > 0) {
      const timer = setTimeout(() => {
        setCheckoutCooldown(checkoutCooldown - 1);
      }, 1000);
      setCooldownTimer(timer);
      return () => clearTimeout(timer);
    } else {
      if (cooldownTimer) {
        clearTimeout(cooldownTimer);
        setCooldownTimer(null);
      }
    }
  }, [checkoutCooldown]);

  // Close payment dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("payment-dropdown-cart");
      const trigger = event.target.closest("[data-payment-trigger]");
      if (dropdown && !dropdown.contains(event.target) && !trigger) {
        dropdown.classList.add("hidden");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load cooldown from localStorage on mount
  useEffect(() => {
    const savedCooldown = localStorage.getItem("checkoutCooldownExpiry");
    if (savedCooldown) {
      const expiryTime = parseInt(savedCooldown);
      const now = Date.now();
      if (expiryTime > now) {
        const remainingSeconds = Math.ceil((expiryTime - now) / 1000);
        setCheckoutCooldown(remainingSeconds);
      } else {
        localStorage.removeItem("checkoutCooldownExpiry");
      }
    }

    // Cleanup on unmount
    return () => {
      if (cooldownTimer) {
        clearTimeout(cooldownTimer);
      }
    };
  }, []);

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    try {
      setActionLoading({ ...actionLoading, [itemId]: true });
      const result = await removeFromCart(itemId);
      if (result.success) {
        await fetchCart();
        // Trigger cart count update
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(t("success.itemRemoved") || "تم حذف العنصر من السلة");
      } else {
        toast.error(
          result.error ||
            t("errors.removeItemFailed") ||
            "فشل في حذف العنصر"
        );
      }
    } catch (err) {
      toast.error(
        err.message || t("errors.removeItemFailed") || "فشل في حذف العنصر"
      );
    } finally {
      setActionLoading({ ...actionLoading, [itemId]: false });
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (
      !confirm(
        t("confirmClearCart") || "هل أنت متأكد من إفراغ السلة؟"
      )
    ) {
      return;
    }
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
        // Trigger cart count update
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(t("success.cartCleared") || "تم إفراغ السلة بنجاح");
      } else {
        toast.error(
          result.error || t("errors.clearCartFailed") || "فشل في إفراغ السلة"
        );
      }
    } catch (err) {
      toast.error(
        err.message || t("errors.clearCartFailed") || "فشل في إفراغ السلة"
      );
    } finally {
      setActionLoading({ ...actionLoading, clear: false });
    }
  };

  // Handle coupon validation and application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("errors.noCouponCode") || "يرجى إدخال كود الخصم");
      return;
    }

    setCouponValidation({ ...couponValidation, loading: true, message: "" });

    try {
      // First validate the coupon
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

      // If valid, apply to cart
      const applyResult = await applyCouponToCart(couponCode);
      if (applyResult.success) {
        setCouponValidation({
          isValid: true,
          message: t("success.couponApplied") || "تم تطبيق الكوبون بنجاح",
          discount: validationResult.data?.data?.coupon?.value || 0,
          loading: false,
        });
        await fetchCart(); // Refresh cart to show updated totals
        // Trigger cart count update (in case cart state changed)
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(
          t("success.couponApplied") || "تم تطبيق الكوبون بنجاح"
        );
      } else {
        const errorMessage =
          applyResult.error ||
          t("errors.applyCouponFailed") ||
          "فشل في تطبيق الكوبون";
        setCouponValidation({
          isValid: false,
          message: errorMessage,
          discount: 0,
          loading: false,
        });
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message ||
        t("errors.applyCouponFailed") ||
        "فشل في تطبيق الكوبون";
      setCouponValidation({
        isValid: false,
        message: errorMessage,
        discount: 0,
        loading: false,
      });
      toast.error(errorMessage);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setCouponValidation({
      isValid: false,
      message: "",
      discount: 0,
      loading: false,
    });
    // Re-fetch cart to remove coupon
    await fetchCart();
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCheckoutData({
        ...checkoutData,
        paymentScreenShot: e.target.files[0],
      });
    }
  };

  // Handle watermark upload
  const handleWatermarkChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCheckoutData({
        ...checkoutData,
        watermark: e.target.files[0],
      });
    }
  };

  // Clear validation errors for a specific field
  const clearFieldError = (fieldName) => {
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Validate checkout form
  const validateCheckoutForm = () => {
    const errors = {};
    let isValid = true;

    // Only validate payment fields if cart total > 0
    if (cart.total > 0) {
      if (!checkoutData.numberTransferredFrom.trim()) {
        errors.numberTransferredFrom =
          t("errors.noTransferNumber") || "يرجى إدخال رقم التحويل";
        isValid = false;
      } else if (checkoutData.numberTransferredFrom.trim().length !== 11) {
        errors.numberTransferredFrom =
          t("errors.invalidTransferNumberLength") || "رقم التحويل يجب أن يتكون من 11 رقم";
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

  // Handle checkout
  const handleCheckout = async () => {
    // Check cooldown
    if (checkoutCooldown > 0) {
      toast.error(
        t("errors.checkoutCooldown", { seconds: checkoutCooldown }) ||
          `يرجى الانتظار ${checkoutCooldown} ثانية قبل إتمام الشراء مرة أخرى.`
      );
      return;
    }

    // Clear previous validation errors
    setValidationErrors({
      numberTransferredFrom: "",
      paymentScreenShot: "",
      nameOnBook: "",
      numberOnBook: "",
      seriesName: "",
    });

    // Validate form
    if (!validateCheckoutForm()) {
      toast.error(
        t("errors.validationFailed") || "يرجى ملء جميع الحقول المطلوبة"
      );
      return;
    }

    try {
      setCheckoutLoading(true);
      const result = await createCartPurchase(checkoutData);
      if (result.success) {
        // Set 30-second cooldown
        const cooldownSeconds = 30;
        const expiryTime = Date.now() + cooldownSeconds * 1000;
        localStorage.setItem("checkoutCooldownExpiry", expiryTime.toString());
        setCheckoutCooldown(cooldownSeconds);

        toast.success(
          t("success.purchaseSubmitted") || "تم تقديم الطلب بنجاح!"
        );
        // Trigger cart count update
        window.dispatchEvent(new Event("cart-updated"));
        // Reset form and redirect
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
        setValidationErrors({
          numberTransferredFrom: "",
          paymentScreenShot: "",
          paymentMethod: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        });
        // Small delay before redirect to show success message
        setTimeout(() => {
          navigate("/my-orders");
        }, 1000);
      } else {
        const errorMessage =
          result.error ||
          t("errors.checkoutFailed") ||
          "فشل في تقديم الطلب. حاول مرة أخرى.";
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("errors.checkoutFailed") ||
        "حدث خطأ. حاول مرة أخرى.";
      toast.error(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Convert path to URL
  const convertPathToUrl = (filePath, folder = "product_thumbnails") => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    const normalizedPath = filePath.replace(/\\/g, "/");
    const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
    const baseUrl = API_URL.replace(/\/api(\/v1)?\/?$/, "");
    const filename = normalizedPath.split("/").pop();
    return `${baseUrl}/uploads/${folder}/${filename}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">{t("loading") || "Loading cart..."}</p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {t("errors.title") || "Error"}
            </h3>
            <p className="mb-6">
              {t("errors.fetchCartFailed") ||
                "Failed to load your cart. Please Log In First."}
            </p>
            <button
              onClick={() => navigate("/market")}
              className="btn btn-primary"
            >
              {t("backToMarket") || "Back to Market"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  const cartItems = cart?.itemsWithDetails || cart?.items || [];
  if (!cart || cartItems.length === 0) {
    return (
      <div
        className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-16">
              <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-3xl font-bold mb-4">
                {t("emptyCart.title") || "Your cart is empty"}
              </h2>
              <p className="text-gray-500 mb-8">
                {t("emptyCart.description") ||
                  "Start shopping to add items to your cart"}
              </p>
              <button
                onClick={() => navigate("/market")}
                className="btn btn-primary btn-lg"
              >
                {t("emptyCart.shopNow") || "Shop Now"}
              </button>
            </div>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-center sm:text-left"
          >
            {t("title") || "Shopping Cart"}
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/market")}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative group overflow-hidden h-12 px-4 w-fit sm:w-auto rounded-xl
             font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2
             text-white shadow-[0_4px_20px_rgba(255,180,0,0.3)]
             active:scale-95 transition-all duration-300 border border-yellow-400/50  "
            style={{
              background:
                "linear-gradient(270deg, #FFD95A, #F9B208, #F7C948, #E0A400, #FFD95A)",
              backgroundSize: "400% 400%",
              animation: "goldFlow 6s ease infinite",
            }}
          >
            {/* Text + Icon */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 z-10"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("continueShopping") || "Continue Shopping"}
            </motion.span>

            {/* Triple Arrows */}
            <div className="flex items-center justify-center z-10">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ x: [0, -5, 0], opacity: [1, 0.7, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15, // slight offset for flowing motion
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-white ${
                      index === 0
                        ? "opacity-100"
                        : index === 1
                        ? "opacity-80"
                        : "opacity-60"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </motion.span>
              ))}
            </div>

            {/* Shine Effect */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100
             bg-gradient-to-r from-transparent via-white/30 to-transparent
             transition-opacity duration-700"
              style={{
                animation: "shineMove 2.5s linear infinite",
                pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            ></span>

            <style jsx global>{`
              @keyframes goldFlow {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
              @keyframes shineMove {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
            `}</style>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Items */}
            {cartItems.map((item) => {
              // Handle both populated and unpopulated items
              const itemData = item.product || item;
              const productSnapshot = item.productSnapshot || itemData;
              const itemId = item._id;
              const productType =
                item.productType ||
                (itemData?.__t === "ECBook" ? "ECBook" : "ECProduct");

              return (
                <div key={itemId} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            convertPathToUrl(
                              productSnapshot?.thumbnail,
                              "product_thumbnails"
                            ) || "/placeholder.svg"
                          }
                          alt={productSnapshot?.title || "Product"}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-2">
                          {productSnapshot?.title ||
                            itemData?.title ||
                            "Product"}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-secondary">
                            {productType === "ECBook"
                              ? t("type.book") || "Book"
                              : t("type.product") || "Product"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-2xl font-bold text-primary">
                            {item.finalPrice ||
                              item.priceAtAdd ||
                              productSnapshot?.priceAfterDiscount ||
                              productSnapshot?.price}{" "}
                            {t("currency") || "EGP"}
                          </span>
                          {(productSnapshot?.originalPrice ||
                            productSnapshot?.price) &&
                            (productSnapshot?.originalPrice ||
                              productSnapshot?.price) >
                              (item.finalPrice ||
                                item.priceAtAdd ||
                                productSnapshot?.priceAfterDiscount ||
                                productSnapshot?.price) && (
                              <span className="text-lg line-through text-gray-500">
                                {productSnapshot.originalPrice ||
                                  productSnapshot.price}{" "}
                                {t("currency") || "EGP"}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-start">
                        <button
                          onClick={() => handleRemoveItem(itemId)}
                          disabled={actionLoading[itemId]}
                          className="btn btn-ghost btn-sm text-error"
                        >
                          {actionLoading[itemId] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                disabled={actionLoading.clear}
                className="btn btn-error btn-outline"
              >
                {actionLoading.clear ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t("clearCart") || "Clear Cart"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Summary & Checkout */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-lg sticky top-4">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">
                  {t("orderSummary") || "Order Summary"}
                </h2>
                {/* Coupon Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="form-control mb-8 space-y-3"
                >
                  <label className="label mb-1">
                    <span className="label-text font-semibold text-base text-white mb-1 dark:text-gray-200">
                      {t("couponCode") || "Coupon Code"}
                    </span>
                  </label>

                  {/* Input + Buttons Container */}
                  <div
                    className="flex w-full items-center bg-base-100 border border-base-300 rounded-lg overflow-hidden 
               shadow-sm hover:shadow-md transition-all duration-300 "
                  >
                    {/* Input Field */}
                    <input
                      type="text"
                      placeholder={t("enterCoupon") || "Enter coupon"}
                      className="flex-grow h-12 px-4 text-base bg-transparent outline-none 
                 placeholder:text-gray-400 disabled:opacity-60"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={
                        couponValidation.isValid || couponValidation.loading
                      }
                    />

                    {/* Buttons */}
                    {couponValidation.isValid ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemoveCoupon}
                        className="btn btn-ghost h-12 px-5 rounded-none sm:rounded-r-xl 
                   focus:outline-none focus:ring-0 active:scale-95 transition-all duration-200"
                      >
                        <X className="w-5 h-5 text-error" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyCoupon}
                        disabled={couponValidation.loading || !couponCode}
                        className="btn btn-primary h-12 px-6 rounded-none sm:rounded-r-sm
                   text-white font-medium text-base tracking-wide 
                   focus:outline-none focus:ring-0 transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {couponValidation.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <span>{t("apply") || "Apply"}</span>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Coupon Message */}
                  {couponValidation.message && (
                    <motion.label
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="label mt-1"
                    >
                      <span
                        className={`label-text-alt text-sm font-medium ${
                          couponValidation.isValid
                            ? "text-green-600"
                            : "text-error"
                        }`}
                      >
                        {couponValidation.message}
                      </span>
                    </motion.label>
                  )}
                </motion.div>

                {/* Price Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4 mb-6 p-5 rounded-2xl bg-gradient-to-br from-base-200/40 to-base-100/60 
             shadow-inner border border-base-300 backdrop-blur-sm"
                >
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-400 font-medium">
                      {t("subtotal") || "Subtotal"}
                    </span>
                    <span className="font-semibold text-gray-100">
                      {cart.subtotal} {t("currency") || "EGP"}
                    </span>
                  </div>

                  {/* Discount */}
                  {cart.discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex justify-between text-success font-medium"
                    >
                      <span>{t("discount") || "Discount"}</span>
                      <span>
                        -{cart.discount} {t("currency") || "EGP"}
                      </span>
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-base-300 my-2"></div>

                  {/* Total */}
                  <div className="flex items-center justify-between text-xl md:text-2xl font-bold tracking-wide">
                    <span className="text-gray-200">
                      {t("total") || "Total"}
                    </span>
                    <span className="text-primary drop-shadow-sm">
                      {cart.total} {t("currency") || "EGP"}
                    </span>
                  </div>
                </motion.div>

                {/* Custom Payment Method Selector with Images - Outside the overflow container */}
                <div className="relative mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t("selectPaymentMethod") || "Payment Method"} <span className="text-error">*</span>
                    </span>
                  </label>
                  <div
                    data-payment-trigger
                    className={`flex items-center justify-between h-12 px-4 border rounded-lg cursor-pointer transition-all ${
                      validationErrors.paymentMethod
                        ? "border-error"
                        : "border-base-300 hover:border-primary"
                    } bg-base-100`}
                    onClick={() => {
                      const dropdown = document.getElementById("payment-dropdown-cart");
                      if (dropdown) dropdown.classList.toggle("hidden");
                    }}
                  >
                    {checkoutData.paymentMethod ? (
                      <div className="flex items-center gap-3">
                        {paymentMethods.find((pm) => pm._id === checkoutData.paymentMethod)?.paymentMethodImg && (
                          <img
                            src={convertPathToUrl(
                              paymentMethods.find((pm) => pm._id === checkoutData.paymentMethod)?.paymentMethodImg,
                              "payment_methods"
                            )}
                            alt=""
                            className="w-8 h-8 object-contain rounded"
                          />
                        )}
                        <span className="font-medium">
                          {paymentMethods.find((pm) => pm._id === checkoutData.paymentMethod)?.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base-content/50">
                        {t("selectPaymentMethod") || "Select payment method"}
                      </span>
                    )}
                    <svg className="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown Options */}
                  <div
                    id="payment-dropdown-cart"
                    className="hidden absolute z-[999] w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method._id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-primary/10 ${
                          checkoutData.paymentMethod === method._id ? "bg-primary/20" : ""
                        }`}
                        onClick={() => {
                          setCheckoutData({
                            ...checkoutData,
                            paymentMethod: method._id,
                          });
                          clearFieldError("paymentMethod");
                          const dropdown = document.getElementById("payment-dropdown-cart");
                          if (dropdown) dropdown.classList.add("hidden");
                        }}
                      >
                        {method.paymentMethodImg && (
                          <img
                            src={convertPathToUrl(method.paymentMethodImg, "payment_methods")}
                            alt={method.name}
                            className="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow-sm"
                          />
                        )}
                        <div className="flex-1">
                          <span className="font-medium">{method.name}</span>
                        </div>
                        {checkoutData.paymentMethod === method._id && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                  {validationErrors.paymentMethod && (
                    <span className="text-error text-sm mt-1">{validationErrors.paymentMethod}</span>
                  )}
                </div>

                {/* Payment Phone Number Display */}
                {cart.total > 0 && checkoutData.paymentMethod && (
                    <div
                      dir="rtl"
                      className="flex flex-col items-center justify-center text-center space-y-3 mt-2"
                    >
                      <p className="text-base md:text-lg font-semibold text-gray-100">
                        برجاء دفع المبلغ على رقم {getPaymentMethodLabel()}:
                      </p>

                      {/* Payment Number */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCopy}
                        className="relative inline-flex items-center justify-center gap-2
                   bg-gradient-to-br from-[#f8e3a1] via-[#f1c05a] to-[#dca52f]
                   text-[#3a2500] font-bold px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)]
                   cursor-pointer select-none transition-all duration-300
                   hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)] active:scale-95"
                      >
                        <span
                          dir="ltr"
                          className="select-all text-white tracking-wide"
                        >
                          {getPaymentPhoneNumber()}
                        </span>

                        {/* Copy Tooltip */}
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{
                            opacity: copied ? 1 : 0,
                            y: copied ? 0 : 5,
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                     bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg shadow-lg
                     border border-green-200 whitespace-nowrap"
                        >
                          تم النسخ
                          <span
                            className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 
                           bg-white border-r border-b border-green-200"
                          />
                        </motion.span>
                      </motion.div>

                      <p className="text-xs text-gray-400 mt-1">
                        (اضغط على الرقم لنسخه تلقائيًا)
                      </p>
                    </div>
                )}

                {/* Checkout Form */}
                <div className="space-y-6">
                  {[
                    // Only show payment fields if cart total > 0
                    ...(cart.total > 0
                      ? [
                          {
                            key: "transferNumber",
                            label: (
                              <>
                                {t("transferNumber") || "Transfer Number"}
                                <span className="text-error ml-0.5">*</span>
                              </>
                            ),
                            input: (
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={11}
                                placeholder={
                                  t("enterTransferNumber") ||
                                  "Enter transfer number"
                                }
                                className={`input outline-none focus:outline-none input-bordered h-12 w-full ${
                                  validationErrors.numberTransferredFrom
                                    ? "input-error"
                                    : ""
                                }`}
                                value={checkoutData.numberTransferredFrom}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                                  setCheckoutData({
                                    ...checkoutData,
                                    numberTransferredFrom: value,
                                  });
                                  // Real-time validation
                                  if (value.length > 0 && value.length !== 11) {
                                    setValidationErrors((prev) => ({
                                      ...prev,
                                      numberTransferredFrom:
                                        t("errors.invalidTransferNumberLength") ||
                                        `رقم التحويل يجب أن يتكون من 11 رقم (${value.length}/11)`,
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
                                  // Validate length on blur
                                  if (value.length > 0 && value.length !== 11) {
                                    setValidationErrors((prev) => ({
                                      ...prev,
                                      numberTransferredFrom:
                                        t("errors.invalidTransferNumberLength") ||
                                        "رقم التحويل يجب أن يتكون من 11 رقم",
                                    }));
                                  }
                                }}
                              />
                            ),
                            error: validationErrors.numberTransferredFrom,
                          },
                          {
                            key: "paymentScreenshot",
                            label: (
                              <>
                                {t("paymentScreenshot") || "Payment Screenshot"}
                                <span className="text-error ml-1">*</span>
                              </>
                            ),
                            input: (
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className={`file-input file-input-bordered focus:outline-none h-12 w-full ${
                                  validationErrors.paymentScreenShot
                                    ? "file-input-error"
                                    : ""
                                }`}
                                onChange={(e) => {
                                  handleFileChange(e);
                                  clearFieldError("paymentScreenShot");
                                }}
                              />
                            ),
                            extra: checkoutData.paymentScreenShot &&
                              !validationErrors.paymentScreenShot && (
                                <label className="label mt-1">
                                  <span className="label-text-alt text-success">
                                    {t("fileSelected") || "File selected"}:{" "}
                                    {checkoutData.paymentScreenShot.name}
                                  </span>
                                </label>
                              ),
                            error: validationErrors.paymentScreenShot,
                          },
                        ]
                      : []),
                    // Watermark upload (available for all users)
                    {
                      key: "watermark",
                      label: (
                        <>
                          {t("watermark") || "Watermark"} (
                          {t("optional") || "Optional"})
                        </>
                      ),
                      helper: (
                        <div className="alert alert-info mb-2">
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
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">
                            {t("watermarkHelper") ||
                              "A watermark can be applied, but please note that it may cause printing problems."}
                          </span>
                        </div>
                      ),
                      input: (
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="file-input file-input-bordered focus:outline-none h-12 w-full"
                          onChange={handleWatermarkChange}
                        />
                      ),
                      extra: checkoutData.watermark && (
                        <label className="label mt-1">
                          <span className="label-text-alt text-success">
                            {t("fileSelected") || "File selected"}:{" "}
                            {checkoutData.watermark.name}
                          </span>
                        </label>
                      ),
                    },
                  ].map((field, index) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="form-control space-y-2"
                    >
                      {field.helper}
                      <label className="label mb-2 font-semibold">
                        <span className="label-text">{field.label}</span>
                      </label>
                      {field.input}
                      {field.error && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.error}
                          </span>
                        </label>
                      )}
                      {field.extra}
                    </motion.div>
                  ))}

                  {/* Book Details */}
                  {requiresBookDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="card bg-info text-info-content"
                    >
                      <div className="card-body p-4 space-y-3">
                        <h3 className="font-bold mb-2">
                          {t("bookDetails") || "Book Details"}
                        </h3>

                        {[
                          {
                            key: "nameOnBook",
                            label: t("nameOnBook") || "Name on book",
                          },
                          {
                            key: "numberOnBook",
                            label: t("numberOnBook") || "Number on book",
                          },
                          {
                            key: "seriesName",
                            label: t("seriesName") || "Series name",
                          },
                        ].map((field, index) => (
                          <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="space-y-1"
                          >
                            <label className="label font-medium">
                              <span className="label-text text-base-content">
                                {field.label}
                              </span>
                            </label>

                            <input
                              type="text"
                              className={`input input-bordered bg-base-100 text-base-content h-12 w-full ${
                                validationErrors[field.key] ? "input-error" : ""
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

                            {/* Error message */}
                            {validationErrors[field.key] && (
                              <label className="label">
                                <span className="label-text-alt text-error">
                                  {validationErrors[field.key]}
                                </span>
                              </label>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="form-control space-y-2"
                  >
                    <label className="label mb-2 font-semibold">
                      <span className="label-text">
                        {t("notes") || "Notes"}
                      </span>
                    </label>
                    <textarea
                      placeholder={t("optionalNotes") || "Optional notes"}
                      className="textarea focus:outline-none textarea-bordered w-full h-28 resize-none"
                      value={checkoutData.notes}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          notes: e.target.value,
                        })
                      }
                    ></textarea>
                  </motion.div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: checkoutCooldown > 0 ? 1 : 1.03 }}
                    whileTap={{ scale: checkoutCooldown > 0 ? 1 : 0.97 }}
                    onClick={handleCheckout}
                    disabled={checkoutLoading || checkoutCooldown > 0}
                    className={`btn btn-lg h-12 w-full mt-4 ${
                      checkoutCooldown > 0 ? "btn-disabled" : "btn-primary"
                    }`}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("processing") || "Processing..."}
                      </>
                    ) : checkoutCooldown > 0 ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t("waitSeconds", { seconds: checkoutCooldown }) ||
                          `Wait ${checkoutCooldown}s`}
                      </>
                    ) : (
                      <>
                        <CircleCheckBigIcon className="w-5 h-5" />{" "}
                        {t("checkout") || "Checkout"}
                      </>
                    )}
                  </motion.button>

                  {/* Cooldown Info Alert */}
                  {checkoutCooldown > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="alert alert-info mt-4"
                    >
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
                      <span>
                        {t("cooldownMessage", { seconds: checkoutCooldown }) ||
                          `Please wait ${checkoutCooldown} seconds before making another purchase.`}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No Payment Methods Modal */}
      {showNoPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-warning to-orange-500 p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {isRTL ? "عذراً!" : "Sorry!"}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-lg text-base-content mb-2">
                {isRTL
                  ? "المنصة متوقفة عن استقبال الطلبات حالياً"
                  : "The platform is currently not accepting orders"}
              </p>
              <p className="text-base-content/70">
                {isRTL
                  ? "يرجى المحاولة مرة أخرى في وقت لاحق"
                  : "Please try again later"}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-base-200">
              <button
                onClick={() => navigate("/market")}
                className="btn btn-primary w-full"
              >
                {isRTL ? "العودة للمتجر" : "Back to Store"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Wrong Transfer Number Modal */}
      {showWrongTransferNumberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-error to-red-500 p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {isRTL ? "خطأ!" : "Error!"}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-lg text-base-content mb-3">
                {isRTL
                  ? "هذا ليس رقم التحويل!"
                  : "This is not the transfer number!"}
              </p>
              <p className="text-base-content/70 mb-2">
                {isRTL
                  ? "لقد أدخلت رقم المحفظة وليس رقم التحويل."
                  : "You entered the wallet number, not the transfer number."}
              </p>
              <p className="text-base-content/70">
                {isRTL
                  ? "رقم التحويل هو الرقم الذي حولت منه المبلغ."
                  : "The transfer number is the number you transferred from."}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-base-200">
              <button
                onClick={() => setShowWrongTransferNumberModal(false)}
                className="btn btn-primary w-full"
              >
                {isRTL ? "فهمت" : "I Understand"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
