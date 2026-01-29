"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Package,
  BookOpen,
  Tag,
  Receipt,
  Sparkles,
  X,
} from "lucide-react";
import { getBookById, getProductById, getAllPaymentMethods, purchaseProduct, purchaseBook } from "../../routes/market";
import { validateCoupon } from "../../routes/marketCoupouns";
import { getToken } from "../../routes/auth-services";
import { trackInitiateCheckout, trackPurchase } from "../../hooks/useMetaPixel";

const DirectCheckout = () => {
  const { t, i18n } = useTranslation("kalimaStore-Cart");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get product info from URL params
  const productId = searchParams.get("productId");
  const productType = searchParams.get("type") || "product";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoaded, setPaymentMethodsLoaded] = useState(false);
  const [showNoPaymentModal, setShowNoPaymentModal] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponValidation, setCouponValidation] = useState({
    isValid: false,
    message: "",
    discount: 0,
    loading: false,
  });
  const [finalPrice, setFinalPrice] = useState(null);

  // Checkout form state
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
  const [validationErrors, setValidationErrors] = useState({});
  const [checkoutCooldown, setCheckoutCooldown] = useState(0);
  const [showWrongTransferNumberModal, setShowWrongTransferNumberModal] = useState(false);

  const isBook = productType === "book" || product?.__t === "ECBook";

  // Helper functions
  const getDisplayPrice = (productData) => {
    if (productData?.priceAfterDiscount && productData.priceAfterDiscount < productData.price) {
      return productData.priceAfterDiscount;
    }
    return productData?.price || 0;
  };

  const getPaymentMethodLabel = () => {
    const method = paymentMethods.find((pm) => pm._id === checkoutData.paymentMethod);
    return method?.name || "";
  };

  const getPaymentPhoneNumber = () => {
    const method = paymentMethods.find((pm) => pm._id === checkoutData.paymentMethod);
    return method?.phoneNumber || "";
  };

  const handleCopy = () => {
    const phoneNumber = getPaymentPhoneNumber();
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError(isRTL ? "لم يتم تحديد المنتج" : "No product specified");
        setLoading(false);
        return;
      }

      // Check if user is logged in
      if (!getToken()) {
        // Save the current URL and redirect to register
        const currentUrl = location.pathname + location.search;
        navigate(`/register?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      try {
        setLoading(true);
        let response;

        if (productType === "book") {
          response = await getBookById(productId);
        } else {
          try {
            response = await getProductById(productId);
          } catch {
            response = await getBookById(productId);
          }
        }

        if (response.status === "success") {
          const productData = response.data.book || response.data.product;
          setProduct(productData);
          setFinalPrice(getDisplayPrice(productData));

          // Track InitiateCheckout event for Meta Pixel (direct checkout flow)
          trackInitiateCheckout({
            contentIds: [productData._id],
            value: getDisplayPrice(productData),
            numItems: 1,
            currency: 'EGP',
          });
        } else {
          throw new Error(isRTL ? "فشل في تحميل المنتج" : "Failed to load product");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, productType, navigate, location, isRTL]);

  // Fetch payment methods
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

  // Cooldown timer
  useEffect(() => {
    if (checkoutCooldown > 0) {
      const timer = setTimeout(() => {
        setCheckoutCooldown(checkoutCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkoutCooldown]);

  // Load cooldown from localStorage
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
  }, []);

  // Close payment dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("payment-dropdown-checkout");
      const trigger = event.target.closest("[data-payment-trigger-checkout]");
      if (dropdown && !dropdown.contains(event.target) && !trigger) {
        dropdown.classList.add("hidden");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("errors.noCouponCode") || "يرجى إدخال كود الخصم");
      return;
    }

    setCouponValidation({ ...couponValidation, loading: true, message: "" });

    try {
      const result = await validateCoupon(couponCode);

      if (!result.success || result.data?.status === "fail") {
        const errorMessage = result.data?.message || result.error || t("errors.invalidCoupon");
        setFinalPrice(getDisplayPrice(product));
        setCouponValidation({
          isValid: false,
          message: errorMessage,
          discount: 0,
          loading: false,
        });
        toast.error(errorMessage);
        return;
      }

      if (result.data?.status === "success" && result.data?.data?.isValid) {
        const discountAmount = result.data.data.coupon.value;
        const basePrice = getDisplayPrice(product);
        const newPrice = Math.max(0, basePrice - discountAmount);

        setFinalPrice(newPrice);
        setCouponValidation({
          isValid: true,
          message: t("success.couponApplied") || "Coupon applied successfully",
          discount: discountAmount,
          loading: false,
        });
        toast.success(t("success.couponApplied") || "تم تطبيق الكوبون بنجاح");
      }
    } catch (err) {
      setFinalPrice(getDisplayPrice(product));
      setCouponValidation({
        isValid: false,
        message: err.message,
        discount: 0,
        loading: false,
      });
      toast.error(err.message);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setFinalPrice(getDisplayPrice(product));
    setCouponValidation({
      isValid: false,
      message: "",
      discount: 0,
      loading: false,
    });
  };

  // Form handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCheckoutData({ ...checkoutData, paymentScreenShot: e.target.files[0] });
    }
  };

  const handleWatermarkChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCheckoutData({ ...checkoutData, watermark: e.target.files[0] });
    }
  };

  const clearFieldError = (fieldName) => {
    setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (finalPrice > 0) {
      if (!checkoutData.numberTransferredFrom.trim()) {
        errors.numberTransferredFrom = t("errors.noTransferNumber") || "Please enter transfer number";
        isValid = false;
      } else if (checkoutData.numberTransferredFrom.trim().length !== 11) {
        errors.numberTransferredFrom = t("errors.invalidTransferNumberLength") || "رقم التحويل يجب أن يتكون من 11 رقم";
        isValid = false;
      }
      if (!checkoutData.paymentScreenShot) {
        errors.paymentScreenShot = t("errors.noFileSelected") || "Please upload payment screenshot";
        isValid = false;
      }
      if (!checkoutData.paymentMethod) {
        errors.paymentMethod = t("errors.paymentMethodRequired") || "Payment method is required";
        isValid = false;
      }
    }

    if (isBook) {
      if (!checkoutData.nameOnBook.trim()) {
        errors.nameOnBook = t("errors.nameOnBookRequired") || "Name on book is required";
        isValid = false;
      }
      if (!checkoutData.numberOnBook.trim()) {
        errors.numberOnBook = t("errors.numberOnBookRequired") || "Number on book is required";
        isValid = false;
      }
      if (!checkoutData.seriesName.trim()) {
        errors.seriesName = t("errors.seriesNameRequired") || "Series name is required";
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (checkoutCooldown > 0) {
      toast.error(
        t("errors.checkoutCooldown", { seconds: checkoutCooldown }) ||
        `يرجى الانتظار ${checkoutCooldown} ثانية قبل إتمام الشراء مرة أخرى.`
      );
      return;
    }

    if (!validateForm()) {
      toast.error(t("errors.validationFailed") || "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setCheckoutLoading(true);

      const purchaseData = {
        productId: product._id,
        numberTransferredFrom: checkoutData.numberTransferredFrom,
        paymentScreenShot: checkoutData.paymentScreenShot,
        notes: checkoutData.notes,
      };

      if (couponValidation.isValid && couponCode.trim()) {
        purchaseData.couponCode = couponCode.trim();
      }

      if (isBook) {
        purchaseData.nameOnBook = checkoutData.nameOnBook;
        purchaseData.numberOnBook = checkoutData.numberOnBook;
        purchaseData.seriesName = checkoutData.seriesName;
      }

      let response;
      if (isBook) {
        response = await purchaseBook(purchaseData);
      } else {
        response = await purchaseProduct(purchaseData);
      }

      if (response.status === "success" || response.message) {
        // Track Purchase event for Meta Pixel
        trackPurchase({
          contentIds: [product._id],
          value: finalPrice || getDisplayPrice(product),
          numItems: 1,
          currency: 'EGP',
        });

        // Set cooldown
        const cooldownSeconds = 30;
        const expiryTime = Date.now() + cooldownSeconds * 1000;
        localStorage.setItem("checkoutCooldownExpiry", expiryTime.toString());
        setCheckoutCooldown(cooldownSeconds);

        toast.success(t("success.purchaseSubmitted") || "تم تقديم الطلب بنجاح!");

        // Redirect to my orders page after success
        setTimeout(() => {
          navigate("/my-orders");
        }, 1500);
      } else {
        throw new Error(response.message || "Purchase failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("errors.checkoutFailed");
      toast.error(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary-content" />
          </div>
          <p className="text-xl font-semibold">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-xl max-w-md w-full"
        >
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t("errors.title") || "Error"}</h3>
            <p className="mb-6">{error || (isRTL ? "المنتج غير موجود" : "Product not found")}</p>
            <button onClick={() => navigate("/market")} className="btn btn-primary">
              {isRTL ? "العودة للمتجر" : "Back to Market"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Receipt className="w-7 h-7 text-primary-content" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">
            {isRTL ? "إتمام الشراء" : "Complete Purchase"}
          </h1>
          <p className="text-base-content/60">
            {isRTL ? "أكمل بيانات الدفع لإتمام طلبك" : "Complete your payment details to finish your order"}
          </p>
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="btn-ghost gap-2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {isRTL ? "رجوع" : "Back"}
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              {/* Product Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{isRTL ? "ملخص الطلب" : "Order Summary"}</h2>
              </div>

              {/* Product Info */}
              <div className="flex gap-4 p-4 rounded-xl bg-base-200/50"
              >
                <div className="relative">
                  <img
                    src={convertPathToUrl(product.thumbnail) || "/placeholder.svg"}
                    alt={product.title}
                    className="w-28 h-28 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2">
                    <span className={`badge ${isBook ? "badge-secondary" : "badge-primary"} gap-1 shadow-lg`}>
                      {isBook ? <BookOpen className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                      {isBook ? (isRTL ? "كتاب" : "Book") : (isRTL ? "منتج" : "Product")}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-base-content/60 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mt-6">
                <label className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{t("couponCode") || "Coupon Code"}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("enterCoupon") || "Enter coupon"}
                    className="input input-bordered flex-1"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponValidation.isValid || couponValidation.loading}
                  />
                  {couponValidation.isValid ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRemoveCoupon}
                      className="btn-ghost btn-square"
                    >
                      <X className="w-5 h-5 text-error" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyCoupon}
                      disabled={couponValidation.loading || !couponCode}
                      className="btn btn-primary"
                    >
                      {couponValidation.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("apply") || "Apply"
                      )}
                    </motion.button>
                  )}
                </div>
                <AnimatePresence>
                  {couponValidation.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-sm mt-2 flex items-center gap-1 ${couponValidation.isValid ? "text-success" : "text-error"}`}
                    >
                      {couponValidation.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {couponValidation.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Summary */}
              <div className="divider"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">{isRTL ? "السعر الأصلي" : "Original Price"}</span>
                  <span className="font-medium">{product.price} {t("currency") || "EGP"}</span>
                </div>
                {product.priceAfterDiscount && product.priceAfterDiscount < product.price && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center text-success"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {isRTL ? "خصم المنتج" : "Product Discount"}
                    </span>
                    <span>-{product.price - product.priceAfterDiscount} {t("currency") || "EGP"}</span>
                  </motion.div>
                )}
                {couponValidation.isValid && couponValidation.discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center text-success"
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {isRTL ? "خصم الكوبون" : "Coupon Discount"}
                    </span>
                    <span>-{couponValidation.discount} {t("currency") || "EGP"}</span>
                  </motion.div>
                )}
                <div className="divider my-2"></div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{isRTL ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">
                    {finalPrice} {t("currency") || "EGP"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              {/* Payment Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-xl font-bold">{isRTL ? "بيانات الدفع" : "Payment Details"}</h2>
              </div>

              {/* Payment Method */}
              {finalPrice > 0 && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {t("selectPaymentMethod") || "Payment Method"} <span className="text-error">*</span>
                      </span>
                    </label>
                    {/* Custom Payment Method Selector with Images */}
                    <div className="relative">
                      <div
                        data-payment-trigger-checkout
                        className={`flex items-center justify-between h-12 px-4 border rounded-lg cursor-pointer transition-all ${validationErrors.paymentMethod
                          ? "border-error"
                          : "border-base-300 hover:border-primary"
                          } bg-base-100`}
                        onClick={() => {
                          const dropdown = document.getElementById("payment-dropdown-checkout");
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
                        id="payment-dropdown-checkout"
                        className="hidden absolute z-[999] w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl overflow-hidden"
                      >
                        {paymentMethods.map((method) => (
                          <div
                            key={method._id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-primary/10 ${checkoutData.paymentMethod === method._id ? "bg-primary/20" : ""
                              }`}
                            onClick={() => {
                              setCheckoutData({ ...checkoutData, paymentMethod: method._id });
                              clearFieldError("paymentMethod");
                              const dropdown = document.getElementById("payment-dropdown-checkout");
                              if (dropdown) dropdown.classList.add("hidden");
                            }}
                          >
                            {method.paymentMethodImg && (
                              <img
                                src={convertPathToUrl(method.paymentMethodImg, "payment_methods")}
                                alt={method.name}
                                className="w-10 h-10 object-contain rounded-lg bg-base-100 p-1 shadow-sm border border-base-200"
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
                    </div>
                    {validationErrors.paymentMethod && (
                      <span className="text-error text-sm mt-1">{validationErrors.paymentMethod}</span>
                    )}
                  </div>

                  {/* Payment Phone Number */}
                  <AnimatePresence>
                    {checkoutData.paymentMethod && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="my-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 border border-primary/20 shadow-lg"
                        dir="rtl"
                      >
                        <div className="bg-gradient-to-r from-primary to-secondary p-3">
                          <p className="font-bold text-center text-primary-content">
                            برجاء دفع المبلغ على رقم {getPaymentMethodLabel()}
                          </p>
                        </div>
                        <div className="p-5">
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopy}
                            className="relative mx-auto w-fit cursor-pointer"
                          >
                            <div className="inline-flex items-center gap-3 bg-base-100 border-2 border-primary/30 font-bold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                              <CreditCard className="w-6 h-6 text-primary" />
                              <span dir="ltr" className="text-2xl tracking-widest text-primary font-mono">{getPaymentPhoneNumber()}</span>
                            </div>
                            <AnimatePresence>
                              {copied && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-success text-success-content px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{isRTL ? "تم النسخ" : "Copied"}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <p className="text-sm text-center text-base-content/60 mt-4 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            اضغط على الرقم لنسخه تلقائياً
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Transfer Number */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {t("transferNumber") || "Transfer Number"} <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      placeholder={t("enterTransferNumber") || "Enter transfer number"}
                      className={`input input-bordered w-full ${validationErrors.numberTransferredFrom ? "input-error" : ""}`}
                      value={checkoutData.numberTransferredFrom}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                        setCheckoutData({ ...checkoutData, numberTransferredFrom: value });
                        if (value.length > 0 && value.length !== 11) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            numberTransferredFrom: t("errors.invalidTransferNumberLength") || `رقم التحويل يجب أن يتكون من 11 رقم (${value.length}/11)`,
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
                          setCheckoutData({ ...checkoutData, numberTransferredFrom: "" });
                        }
                        if (value.length > 0 && value.length !== 11) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            numberTransferredFrom: t("errors.invalidTransferNumberLength") || "رقم التحويل يجب أن يتكون من 11 رقم",
                          }));
                        }
                      }}
                    />
                    {validationErrors.numberTransferredFrom && (
                      <span className="text-error text-sm mt-1">{validationErrors.numberTransferredFrom}</span>
                    )}
                  </div>

                  {/* Payment Screenshot */}
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {t("paymentScreenshot") || "Payment Screenshot"} <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className={`file-input file-input-bordered w-full ${validationErrors.paymentScreenShot ? "file-input-error" : ""}`}
                      onChange={(e) => {
                        handleFileChange(e);
                        clearFieldError("paymentScreenShot");
                      }}
                    />
                    {checkoutData.paymentScreenShot && (
                      <span className="text-success text-sm mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {t("fileSelected") || "File selected"}: {checkoutData.paymentScreenShot.name}
                      </span>
                    )}
                    {validationErrors.paymentScreenShot && (
                      <span className="text-error text-sm mt-1">{validationErrors.paymentScreenShot}</span>
                    )}
                  </div>
                </>
              )}

              {/* Book Details - Premium Design */}
              {isBook && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 relative overflow-hidden"
                >
                  {/* Decorative background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-primary/5 to-secondary/10 rounded-2xl"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>

                  <div className="relative border-2 border-secondary/20 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-secondary via-secondary/90 to-primary p-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <BookOpen className="w-5 h-5 text-primary-content" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-primary-content">
                            {t("bookDetails") || "Book Details"}
                          </h3>
                          <p className="text-primary-content/70 text-xs">
                            {isRTL ? "أدخل بيانات الكتاب" : "Enter book information"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-5 bg-base-100/50 backdrop-blur-sm">
                      {/* Name on Book */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="form-control"
                      >
                        <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">1</span>
                            {t("nameOnBook") || "Name on book"}
                            <span className="text-error">*</span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isRTL ? "أدخل اسم المدرس" : "Enter teacher name"}
                            className={`input input-bordered w-full bg-base-100 pr-10 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all ${validationErrors.nameOnBook ? "input-error border-error" : "hover:border-secondary/50"}`}
                            value={checkoutData.nameOnBook}
                            onChange={(e) => {
                              setCheckoutData({ ...checkoutData, nameOnBook: e.target.value });
                              clearFieldError("nameOnBook");
                            }}
                          />
                          <div className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                            {checkoutData.nameOnBook && !validationErrors.nameOnBook && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        {validationErrors.nameOnBook && (
                          <motion.span
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-error text-sm mt-1 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.nameOnBook}
                          </motion.span>
                        )}
                      </motion.div>

                      {/* Number on Book */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="form-control"
                      >
                        <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">2</span>
                            {t("numberOnBook") || "Number on book"}
                            <span className="text-error">*</span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isRTL ? "أدخل الرقم" : "Enter number"}
                            className={`input input-bordered w-full bg-base-100 pr-10 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all ${validationErrors.numberOnBook ? "input-error border-error" : "hover:border-secondary/50"}`}
                            value={checkoutData.numberOnBook}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              setCheckoutData({ ...checkoutData, numberOnBook: value });
                              clearFieldError("numberOnBook");
                            }}
                          />
                          <div className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                            {checkoutData.numberOnBook && !validationErrors.numberOnBook && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        {validationErrors.numberOnBook && (
                          <motion.span
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-error text-sm mt-1 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.numberOnBook}
                          </motion.span>
                        )}
                      </motion.div>

                      {/* Series Name */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="form-control"
                      >
                        <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">3</span>
                            {t("seriesName") || "Series name"}
                            <span className="text-error">*</span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isRTL ? "أدخل اسم السلسلة" : "Enter the series name"}
                            className={`input input-bordered w-full bg-base-100 pr-10 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all ${validationErrors.seriesName ? "input-error border-error" : "hover:border-secondary/50"}`}
                            value={checkoutData.seriesName}
                            onChange={(e) => {
                              setCheckoutData({ ...checkoutData, seriesName: e.target.value });
                              clearFieldError("seriesName");
                            }}
                          />
                          <div className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                            {checkoutData.seriesName && !validationErrors.seriesName && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        {validationErrors.seriesName && (
                          <motion.span
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-error text-sm mt-1 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.seriesName}
                          </motion.span>
                        )}
                      </motion.div>

                      {/* Info Note */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20 mt-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-info" />
                        </div>
                        <p className="text-sm text-base-content/70 pt-1">
                          {isRTL
                            ? "تأكد من صحة البيانات قبل إتمام الشراء."
                            : "Make sure the information is correct before completing the purchase."}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Watermark (optional) */}
              <div className="form-control mt-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20 mb-3">
                  <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-info" />
                  </div>
                  <p className="text-sm text-base-content/70 pt-1">
                    {t("watermarkHelper") || "A watermark can be applied, but it may cause printing issues."}
                  </p>
                </div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("watermark") || "Watermark"} ({t("optional") || "Optional"})
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="file-input file-input-bordered w-full"
                  onChange={handleWatermarkChange}
                />
                {checkoutData.watermark && (
                  <span className="text-success text-sm mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("fileSelected") || "File selected"}: {checkoutData.watermark.name}
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-semibold">{t("notes") || "Notes"}</span>
                </label>
                <textarea
                  placeholder={t("optionalNotes") || "Optional notes"}
                  className="textarea textarea-bordered w-full"
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || checkoutCooldown > 0}
                className={`btn btn-lg w-full mt-8 ${checkoutCooldown > 0 ? "btn-disabled" : "btn-primary"}`}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("processing") || "Processing..."}
                  </>
                ) : checkoutCooldown > 0 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("waitSeconds", { seconds: checkoutCooldown }) || `Wait ${checkoutCooldown}s`}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {isRTL ? "إتمام الشراء" : "Complete Purchase"}
                  </>
                )}
              </button>

              {checkoutCooldown > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert alert-info mt-4"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>
                    {t("cooldownMessage", { seconds: checkoutCooldown }) ||
                      `Please wait ${checkoutCooldown} seconds before making another purchase.`}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* No Payment Methods Modal */}
      <AnimatePresence>
        {showNoPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-warning to-secondary p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-base-100/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-warning-content" />
                </div>
                <h3 className="text-2xl font-bold text-warning-content">
                  {isRTL ? "عذراً!" : "Sorry!"}
                </h3>
              </div>
              <div className="p-6 text-center">
                <p className="text-lg">
                  {isRTL
                    ? "المنصة متوقفة عن استقبال الطلبات حالياً"
                    : "The platform is currently not accepting orders"}
                </p>
              </div>
              <div className="p-4 bg-base-200">
                <button onClick={() => navigate("/market")} className="btn btn-primary w-full">
                  {isRTL ? "العودة للمتجر" : "Back to Store"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wrong Transfer Number Modal */}
      <AnimatePresence>
        {showWrongTransferNumberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-error to-primary p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-base-100/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-error-content" />
                </div>
                <h3 className="text-2xl font-bold text-error-content">
                  {isRTL ? "خطأ!" : "Error!"}
                </h3>
              </div>
              <div className="p-6 text-center">
                <p className="text-lg mb-3">
                  {isRTL ? "هذا ليس رقم التحويل!" : "This is not the transfer number!"}
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
      </AnimatePresence>
    </div>
  );
};

export default DirectCheckout;
