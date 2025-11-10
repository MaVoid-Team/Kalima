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
import {
  ShoppingCart,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {t("title") || "Shopping Cart"}
          </h1>
          <button onClick={() => navigate("/market")} className="btn btn-ghost">
            {t("continueShopping") || "Continue Shopping"}
          </button>
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
            {/* Order Summary */}
            <div className="card bg-base-100 shadow-lg sticky top-4">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">
                  {t("orderSummary") || "Order Summary"}
                </h2>

                {/* Coupon Section */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t("couponCode") || "Coupon Code"}
                    </span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder={t("enterCoupon") || "Enter coupon"}
                      className="input input-bordered join-item w-full"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={
                        couponValidation.isValid || couponValidation.loading
                      }
                    />
                    {couponValidation.isValid ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="btn join-item btn-ghost"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline join-item"
                        onClick={handleApplyCoupon}
                        disabled={couponValidation.loading || !couponCode}
                      >
                        {couponValidation.loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t("apply") || "Apply"
                        )}
                      </button>
                    )}
                  </div>
                  {couponValidation.message && (
                    <label className="label">
                      <span
                        className={`label-text-alt ${
                          couponValidation.isValid
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {couponValidation.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>{t("subtotal") || "Subtotal"}</span>
                    <span className="font-semibold">
                      {cart.subtotal} {t("currency") || "EGP"}
                    </span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>{t("discount") || "Discount"}</span>
                      <span className="font-semibold">
                        -{cart.discount} {t("currency") || "EGP"}
                      </span>
                    </div>
                  )}
                  <div className="divider"></div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>{t("total") || "Total"}</span>
                    <span className="text-primary">
                      {cart.total} {t("currency") || "EGP"}
                    </span>
                  </div>
                </div>

                {/* Checkout Form */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <div className="flex items-center  font-semibold">
                        <span className="label-text">
                          {t("transferNumber") || "Transfer Number"}
                          <span className="text-error ml-0.5">*</span>
                        </span>
                      </div>
                    </label>

                    <input
                      type="text"
                      placeholder={
                        t("enterTransferNumber") || "Enter transfer number"
                      }
                      className={`input input-bordered ${
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
                    {validationErrors.numberTransferredFrom && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {validationErrors.numberTransferredFrom}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {t("paymentScreenshot") || "Payment Screenshot"}
                        <span className="text-error ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className={`file-input file-input-bordered w-full ${
                        validationErrors.paymentScreenShot
                          ? "file-input-error"
                          : ""
                      }`}
                      onChange={(e) => {
                        handleFileChange(e);
                        clearFieldError("paymentScreenShot");
                      }}
                    />
                    {validationErrors.paymentScreenShot && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {validationErrors.paymentScreenShot}
                        </span>
                      </label>
                    )}
                    {checkoutData.paymentScreenShot &&
                      !validationErrors.paymentScreenShot && (
                        <label className="label">
                          <span className="label-text-alt text-success">
                            {t("fileSelected") || "File selected"}:{" "}
                            {checkoutData.paymentScreenShot.name}
                          </span>
                        </label>
                      )}
                  </div>

                  {requiresBookDetails && (
                    <div className="card bg-info text-info-content">
                      <div className="card-body p-4">
                        <h3 className="font-bold mb-2">
                          {t("bookDetails") || "Book Details"}
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <input
                              type="text"
                              placeholder={t("nameOnBook") || "Name on book"}
                              className={`input input-bordered bg-base-100 text-base-content w-full ${
                                validationErrors.nameOnBook ? "input-error" : ""
                              }`}
                              value={checkoutData.nameOnBook}
                              onChange={(e) => {
                                setCheckoutData({
                                  ...checkoutData,
                                  nameOnBook: e.target.value,
                                });
                                clearFieldError("nameOnBook");
                              }}
                            />
                            {validationErrors.nameOnBook && (
                              <label className="label py-1">
                                <span className="label-text-alt text-error">
                                  {validationErrors.nameOnBook}
                                </span>
                              </label>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder={
                                t("numberOnBook") || "Number on book"
                              }
                              className={`input input-bordered bg-base-100 text-base-content w-full ${
                                validationErrors.numberOnBook
                                  ? "input-error"
                                  : ""
                              }`}
                              value={checkoutData.numberOnBook}
                              onChange={(e) => {
                                setCheckoutData({
                                  ...checkoutData,
                                  numberOnBook: e.target.value,
                                });
                                clearFieldError("numberOnBook");
                              }}
                            />
                            {validationErrors.numberOnBook && (
                              <label className="label py-1">
                                <span className="label-text-alt text-error">
                                  {validationErrors.numberOnBook}
                                </span>
                              </label>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder={t("seriesName") || "Series name"}
                              className={`input input-bordered bg-base-100 text-base-content w-full ${
                                validationErrors.seriesName ? "input-error" : ""
                              }`}
                              value={checkoutData.seriesName}
                              onChange={(e) => {
                                setCheckoutData({
                                  ...checkoutData,
                                  seriesName: e.target.value,
                                });
                                clearFieldError("seriesName");
                              }}
                            />
                            {validationErrors.seriesName && (
                              <label className="label py-1">
                                <span className="label-text-alt text-error">
                                  {validationErrors.seriesName}
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {t("notes") || "Notes"}
                      </span>
                    </label>
                    <textarea
                      placeholder={t("optionalNotes") || "Optional notes"}
                      className="textarea textarea-bordered h-24"
                      value={checkoutData.notes}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          notes: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="btn btn-primary btn-lg w-full"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("processing") || "Processing..."}
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {t("checkout") || "Checkout"}
                      </>
                    )}
                  </button>

                  <div
                    dir="rtl"
                    className="text-center md:text-right mt-5 py-4 px-2 border-t border-amber-200 
      bg-gradient-to-br from-[#f7d37f] via-[#e6b756] to-[#d49a3a] 
      rounded-2xl relative shadow-[0_8px_30px_rgba(212,154,58,0.25)]"
                  >
                    <p
                      onMouseEnter={handleCopy}
                      className="text-xl md:text-xl font-bold text-white text-center relative cursor-pointer select-none transition-all duration-300 hover:text-[#fff9e6] group"
                    >
                      برجاء دفع المبلغ على الرقم التالي
                     
                      <span
                        dir="ltr"
                        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-5 py-2.5
          bg-white/90 text-[#b67b18] text-base font-semibold rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.15)]
          backdrop-blur-md border border-white/70
          opacity-0 scale-95 -translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-4
          transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap pointer-events-none`}
                      >
                        {copied ? "تم نسخ الرقم " : "+20 106 116 5403"}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white/90 border-r border-b border-white/70 shadow-sm" />
                      </span>
                    </p>
                  </div>
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
