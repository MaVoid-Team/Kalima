"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  getCart,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  getCheckoutPreview,
  createCartPurchase,
} from "../../routes/cart";
import { validateCoupon } from "../../routes/marketCoupouns";
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

const CartPage = () => {
  const { t, i18n } = useTranslation("kalimaStore-Cart");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("+20 106 116 5403");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
    notes: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [requiresBookDetails, setRequiresBookDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    numberTransferredFrom: "",
    paymentScreenShot: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
  });

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
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || t("errors.fetchCartFailed") || "Failed to load cart";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
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
        toast.success(t("success.itemRemoved") || "Item removed from cart");
      } else {
        toast.error(
          result.error ||
            t("errors.removeItemFailed") ||
            "Failed to remove item"
        );
      }
    } catch (err) {
      toast.error(
        err.message || t("errors.removeItemFailed") || "Failed to remove item"
      );
    } finally {
      setActionLoading({ ...actionLoading, [itemId]: false });
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (
      !confirm(
        t("confirmClearCart") || "Are you sure you want to clear your cart?"
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
        toast.success(t("success.cartCleared") || "Cart cleared successfully");
      } else {
        toast.error(
          result.error || t("errors.clearCartFailed") || "Failed to clear cart"
        );
      }
    } catch (err) {
      toast.error(
        err.message || t("errors.clearCartFailed") || "Failed to clear cart"
      );
    } finally {
      setActionLoading({ ...actionLoading, clear: false });
    }
  };

  // Handle coupon validation and application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("errors.noCouponCode") || "Please enter a coupon code");
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
          message: t("success.couponApplied") || "Coupon applied successfully",
          discount: validationResult.data?.data?.coupon?.value || 0,
          loading: false,
        });
        await fetchCart(); // Refresh cart to show updated totals
        // Trigger cart count update (in case cart state changed)
        window.dispatchEvent(new Event("cart-updated"));
        toast.success(
          t("success.couponApplied") || "Coupon applied successfully"
        );
      } else {
        const errorMessage =
          applyResult.error ||
          t("errors.applyCouponFailed") ||
          "Failed to apply coupon";
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
        "Failed to apply coupon";
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

    if (!checkoutData.numberTransferredFrom.trim()) {
      errors.numberTransferredFrom =
        t("errors.noTransferNumber") || "Please enter transfer number";
      isValid = false;
    }

    if (!checkoutData.paymentScreenShot) {
      errors.paymentScreenShot =
        t("errors.noFileSelected") || "Please upload payment screenshot";
      isValid = false;
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
        t("errors.validationFailed") || "Please fill in all required fields"
      );
      return;
    }

    try {
      setCheckoutLoading(true);
      const result = await createCartPurchase(checkoutData);
      if (result.success) {
        toast.success(
          t("success.purchaseSubmitted") || "Purchase submitted successfully!"
        );
        // Trigger cart count update
        window.dispatchEvent(new Event("cart-updated"));
        // Reset form and redirect
        setCheckoutData({
          numberTransferredFrom: "",
          paymentScreenShot: null,
          notes: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        });
        setValidationErrors({
          numberTransferredFrom: "",
          paymentScreenShot: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        });
        // Small delay before redirect to show success message
        setTimeout(() => {
          navigate("/market");
        }, 1000);
      } else {
        const errorMessage =
          result.error ||
          t("errors.checkoutFailed") ||
          "Failed to submit purchase. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("errors.checkoutFailed") ||
        "An error occurred. Please try again.";
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
    const baseUrl = API_URL.replace(/\/$/, "");
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
            <p className="mb-6">{error}</p>
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
            className="relative group overflow-hidden h-12 px-4 w-full sm:w-auto rounded-xl
             font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2
             text-white shadow-[0_4px_20px_rgba(255,180,0,0.3)]
             active:scale-95 transition-all duration-300 border border-yellow-400/50"
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

                  {/* Divider */}
                  <div className="border-t border-base-300 my-3"></div>

                  {/* Payment Section */}
                  <div
                    dir="rtl"
                    className="flex flex-col items-center justify-center text-center space-y-3 mt-2"
                  >
                    <p className="text-base md:text-lg font-semibold text-gray-100">
                      برجاء دفع المبلغ على الرقم التالي:
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
                      <span dir="ltr" className="select-all  text-white tracking-wide">
                        +20 106 116 5403
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
                </motion.div>

                {/* Checkout Form */}
                <div className="space-y-6">
                  {[
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
                          placeholder={
                            t("enterTransferNumber") || "Enter transfer number"
                          }
                          className={`input outline-none focus:outline-none input-bordered h-12 w-full ${
                            validationErrors.numberTransferredFrom
                              ? "input-error"
                              : ""
                          }`}
                          value={checkoutData.numberTransferredFrom}
                          onChange={(e) => {
                            setCheckoutData({
                              ...checkoutData,
                              numberTransferredFrom: e.target.value,
                            });
                            clearFieldError("numberTransferredFrom");
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
                  ].map((field, index) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="form-control space-y-2"
                    >
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
                            placeholder: t("nameOnBook") || "Name on book",
                          },
                          {
                            key: "numberOnBook",
                            placeholder: t("numberOnBook") || "Number on book",
                          },
                          {
                            key: "seriesName",
                            placeholder: t("seriesName") || "Series name",
                          },
                        ].map((field, index) => (
                          <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="space-y-2"
                          >
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              className={`input input-bordered bg-base-100 text-base-content h-12 w-full ${
                                validationErrors[field.key] ? "input-error" : ""
                              }`}
                              value={checkoutData[field.key]}
                              onChange={(e) => {
                                setCheckoutData({
                                  ...checkoutData,
                                  [field.key]: e.target.value,
                                });
                                clearFieldError(field.key);
                              }}
                            />
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
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="btn btn-primary  btn-lg h-12 w-full mt-4"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("processing") || "Processing..."}
                      </>
                    ) : (
                      <>
                        <CircleCheckBigIcon className="w-5 h-5" />{" "}
                        {t("checkout") || "Checkout"}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
