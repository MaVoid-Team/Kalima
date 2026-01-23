"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  getBookById,
  getProductById,
  purchaseProduct,
  purchaseBook,
} from "../../routes/market";
import { validateCoupon } from "../../routes/marketCoupouns"; // Assuming this is the correct path
import { addToCart, getUserPurchasedProducts } from "../../routes/cart";
import { isLoggedIn, getToken } from "../../routes/auth-services";
import { ShoppingCart, Zap, X, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import components
import ProductHeader from "./components/ProductHeader";
import ProductGallery from "./components/ProductsGallery";
import SampleDownload from "./components/SampleDownload";
import ProductInfo from "./components/ProductInfo";
import PaymentSection from "./components/PaymentSection";

import PurchaseForm from "./components/PurchaseForm";
import KalimaLoader from "../../components/KalimaLoader";
import { trackViewContent, trackAddToCart } from "../../hooks/useMetaPixel";

const ProductDetails = () => {
  const { t, i18n } = useTranslation("kalimaStore-ProductDetails");
  const isRTL = i18n.language === "ar";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Coupon and Price State
  const [couponCode, setCouponCode] = useState("");
  const [finalPrice, setFinalPrice] = useState(null);
  const [couponValidation, setCouponValidation] = useState({
    isValid: false,
    message: "",
    discount: 0,
    loading: false,
  });

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    numberTransferredFrom: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
    notes: "",
  });

  const { id, type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getItemType = (item) => {
    return item && item.__t === "ECBook" ? "book" : "product";
  };

  // Helper function to get the display price (priceAfterDiscount or original price)
  const getDisplayPrice = (productData) => {
    if (
      productData.priceAfterDiscount &&
      productData.priceAfterDiscount < productData.price
    ) {
      return productData.priceAfterDiscount;
    }
    return productData.price;
  };

  // Fetch product/book data
  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) {
        setError(t("errors.invalidProductInfo"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        let response;

        if (type === "book") {
          response = await getBookById(id);
        } else {
          try {
            response = await getProductById(id);
          } catch (productError) {
            console.log(
              "Failed to fetch as product, trying as book:",
              productError.message,
            );
            response = await getBookById(id);
          }
        }

        if (response.status === "success") {
          const itemData = response.data.book || response.data.product;
          setProduct(itemData);

          // Set initial price to the display price (priceAfterDiscount if available)
          const initialDisplayPrice = getDisplayPrice(itemData);
          setFinalPrice(initialDisplayPrice);

          // Track ViewContent event for Meta Pixel
          trackViewContent({
            contentName: itemData.title,
            contentCategory: itemData.section?.name || 'Products',
            contentIds: [itemData._id],
            contentType: itemData.__t === 'ECBook' ? 'book' : 'product',
            value: initialDisplayPrice,
            currency: 'EGP',
          });

          // Check if user has purchased this product
          if (isLoggedIn()) {
            const purchasedResult = await getUserPurchasedProducts();
            if (purchasedResult.success) {
              setIsPurchased(purchasedResult.productIds.includes(id));
            }
          }
        } else {
          throw new Error(t("errors.fetchFailed"));
        }
      } catch (err) {
        setError(err.message);
        console.error(t("errors.fetchErrorLog"), err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id, type, t]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!getToken()) {
      // Show auth modal to let user choose login or register
      setShowAuthModal(true);
      return;
    }

    if (!product) {
      toast.error(t("errors.productDataNotLoaded"));
      return;
    }

    // Check if product was already purchased
    if (isPurchased) {
      const confirmMessage = isRTL
        ? "لقد قمت بشراء هذا المنتج من قبل. هل تريد شراءه مرة أخرى؟"
        : "You have already purchased this product. Do you want to buy it again?";

      if (!window.confirm(confirmMessage)) {
        return; // User cancelled
      }
    }

    try {
      setAddingToCart(true);
      const result = await addToCart(product._id);
      if (result.success) {
        // Track AddToCart event for Meta Pixel
        trackAddToCart({
          contentName: product.title,
          contentIds: [product._id],
          contentType: product.__t === 'ECBook' ? 'book' : 'product',
          value: getDisplayPrice(product),
          currency: 'EGP',
        });

        toast.success(
          t("success.addedToCart") || "تمت الإضافة إلى السلة بنجاح!",
        );
        // Trigger cart count update
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        toast.error(
          result.error ||
          t("errors.addToCartFailed") ||
          "فشل في الإضافة إلى السلة",
        );
      }
    } catch (error) {
      toast.error(
        error.message ||
        t("errors.addToCartFailed") ||
        "فشل في الإضافة إلى السلة",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.warning(t("errors.noCouponCode"));
      return;
    }

    setCouponValidation({ ...couponValidation, loading: true, message: "" });

    const result = await validateCoupon(couponCode);

    // This handles both network errors and API responses with status: "fail"
    if (!result.success || result.data?.status === "fail") {
      const errorMessage =
        result.data?.message || result.error || t("errors.invalidCoupon");

      // Reset to display price (priceAfterDiscount if available)
      const resetPrice = getDisplayPrice(product);
      setFinalPrice(resetPrice);

      setCouponValidation({
        isValid: false,
        message: errorMessage,
        discount: 0,
        loading: false,
      });
      return;
    }

    // This handles a successful validation
    if (result.data?.status === "success" && result.data?.data?.isValid) {
      const couponData = result.data.data.coupon;
      const discountAmount = couponData.value; // Assuming 'value' is a fixed discount amount

      if (typeof discountAmount !== "number") {
        setCouponValidation({
          isValid: false,
          message: t("errors.invalidDiscountValue"),
          discount: 0,
          loading: false,
        });
        return;
      }

      // Apply discount to the base display price (price after initial discount)
      const basePrice = getDisplayPrice(product);
      const newPrice = basePrice - discountAmount;

      setFinalPrice(newPrice < 0 ? 0 : newPrice);
      setCouponValidation({
        isValid: true,
        message: t("success.couponApplied"),
        discount: discountAmount,
        loading: false,
      });
    } else {
      // Fallback for any other unexpected success response format
      const resetPrice = getDisplayPrice(product);
      setFinalPrice(resetPrice);
      setCouponValidation({
        isValid: false,
        message: t("errors.invalidCoupon"),
        discount: 0,
        loading: false,
      });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");

    // Reset to display price (priceAfterDiscount if available)
    const resetPrice = getDisplayPrice(product);
    setFinalPrice(resetPrice);

    setCouponValidation({
      isValid: false,
      message: "",
      discount: 0,
      loading: false,
    });
  };

  const handleSubmit = async () => {
    if (!product) {
      toast.error(t("errors.productDataNotLoaded"));
      return;
    }

    const actualType = getItemType(product);

    if (!uploadedFile) {
      toast.warning(t("errors.noFileSelected"));
      return;
    }

    if (!purchaseForm.numberTransferredFrom) {
      toast.warning(t("errors.noTransferNumber"));
      return;
    }

    if (
      actualType === "book" &&
      (!purchaseForm.nameOnBook ||
        !purchaseForm.numberOnBook ||
        !purchaseForm.seriesName)
    ) {
      toast.warning(t("errors.fillBookFields"));
      return;
    }

    try {
      setPurchaseLoading(true);

      const purchaseData = {
        productId: product._id,
        numberTransferredFrom: purchaseForm.numberTransferredFrom,
        paymentScreenShot: uploadedFile,
        notes: purchaseForm.notes || "",
      };

      // Add coupon code if valid
      if (couponValidation.isValid && couponCode.trim()) {
        purchaseData.couponCode = couponCode.trim();
      }

      // Add book-specific fields if it's a book
      if (actualType === "book") {
        purchaseData.nameOnBook = purchaseForm.nameOnBook;
        purchaseData.numberOnBook = purchaseForm.numberOnBook;
        purchaseData.seriesName = purchaseForm.seriesName;
      }

      let response;
      if (actualType === "book") {
        response = await purchaseBook(purchaseData);
      } else {
        response = await purchaseProduct(purchaseData);
      }

      if (response.status === "success" || response.message) {
        toast.success(t("success.purchaseSubmitted"));

        // Reset form
        setUploadedFile(null);
        setPurchaseForm({
          numberTransferredFrom: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
          notes: "",
        });
        handleRemoveCoupon(); // Also reset coupon state
        // dummy comment to re-commit
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("💥 Error submitting purchase:", err);
      const errorMessage =
        err.response?.data?.message || err.message || t("errors.unknownError");
      toast.error(t("errors.purchaseSubmissionFailed") + errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const displayType = product ? getItemType(product) : type;

  if (loading) {
    return <KalimaLoader fullScreen={false} />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">{t("errors.title")}</h3>
            <p className="mb-6">{error || t("errors.productNotFound")}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              {t("navigation.goBack")}
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
      <ProductHeader onBack={() => navigate(-1)} isRTL={isRTL} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body p-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12">
                <ProductGallery
                  gallery={product.gallery}
                  title={product.title}
                />
                <div className="mt-8">
                  <SampleDownload
                    sample={product.sample}
                    title={product.title}
                    type={displayType}
                    isRTL={isRTL}
                  />
                </div>
              </div>
              <div className="p-8 lg:p-12 border-l border-base-200">
                <ProductInfo
                  product={product}
                  type={displayType}
                  isRTL={isRTL}
                />

                {/* Already Purchased Badge */}
                {isPurchased && (
                  <div className="alert alert-success mt-4">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {isRTL
                        ? "لقد قمت بشراء هذا المنتج من قبل"
                        : "You have already purchased this product"}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {/* Buy Now Button */}
                  <button
                    onClick={() => {
                      if (!getToken()) {
                        // Show auth modal to let user choose login or register
                        setShowAuthModal(true);
                        return;
                      }
                      // Go directly to checkout
                      navigate(
                        `/checkout?productId=${product._id}&type=${displayType}`,
                      );
                    }}
                    className="btn btn-primary btn-lg w-full"
                  >
                    <Zap className="w-5 h-5" />
                    {isRTL ? "اشتري الآن" : "Buy Now"}
                  </button>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="btn btn-outline btn-lg w-full"
                  >
                    {addingToCart ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        {t("addingToCart") || "Adding to Cart..."}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {isPurchased
                          ? isRTL
                            ? "أضف للسلة مجددًا"
                            : "Add to Cart Again"
                          : isRTL
                            ? "أضف إلى السلة"
                            : "Add to Cart"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Required Modal - Login or Register Choice */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center relative">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-3 right-3 btn btn-ghost btn-sm btn-circle text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <p className="text-lg text-base-content mb-3">
                  {isRTL
                    ? "يجب تسجيل الدخول لإضافة المنتجات إلى السلة"
                    : "You need to login to add items to cart"}
                </p>
                <p className="text-base-content/70">
                  {isRTL
                    ? "هل لديك حساب بالفعل؟ قم بتسجيل الدخول. أو أنشئ حساب جديد."
                    : "Already have an account? Login. Or create a new account."}
                </p>
              </div>

              {/* Footer - Two Buttons */}
              <div className="p-4 bg-base-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    const currentUrl = location.pathname + location.search;
                    navigate(
                      `/login?redirect=${encodeURIComponent(currentUrl)}`,
                    );
                  }}
                  className="btn btn-primary flex-1"
                >
                  <LogIn className="w-5 h-5" />
                  {isRTL ? "تسجيل الدخول" : "Login"}
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    const currentUrl = location.pathname + location.search;
                    navigate(
                      `/register?redirect=${encodeURIComponent(currentUrl)}`,
                    );
                  }}
                  className="btn btn-outline btn-primary flex-1"
                >
                  <UserPlus className="w-5 h-5" />
                  {isRTL ? "إنشاء حساب" : "Register"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
