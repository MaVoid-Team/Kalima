"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getAllSections,
  getAllProducts,
  getAllSubSections,
} from "../../routes/market";
import { addToCart, getUserPurchasedProducts } from "../../routes/cart";
import { isLoggedIn, getToken } from "../../routes/auth-services";
import {
  ShoppingCart,
  AlertTriangle,
  X,
  LogIn,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import KalimaLoader from "../../components/KalimaLoader";

const Market = () => {
  const { t, i18n } = useTranslation("kalimaStore-Market");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("all");
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [addingToCart, setAddingToCart] = useState({});
  const [purchasedProductIds, setPurchasedProductIds] = useState([]);
  const [cartTypeError, setCartTypeError] = useState({
    show: false,
    message: "",
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProductId, setPendingProductId] = useState(null);

  const convertPathToUrl = (filePath, folder = "product_thumbnails") => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;

    const normalizedPath = filePath.replace(/\\/g, "/")
    const API_URL = import.meta.env.VITE_API_URL || window.location.origin
    const baseUrl = API_URL.replace(/\/api(\/v1)?\/?$/, "") // remove /api or /api/v1

    const filename = normalizedPath.split("/").pop()
    return `${baseUrl}/uploads/${folder}/${filename}`
  }

  // Filter products based on active tab and subsection
  const filteredBySection = useMemo(() => {
    if (activeTab === "all") {
      return allProducts;
    }

    let filtered = allProducts.filter(
      (product) => product.section?._id === activeTab,
    );

    if (activeSubSection !== "all") {
      filtered = filtered.filter(
        (product) => product.subSection?._id === activeSubSection,
      );
    }

    return filtered;
  }, [activeTab, activeSubSection, allProducts]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    return filteredBySection.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [filteredBySection, searchQuery]);

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / itemsPerPage) || 1;
  }, [filteredItems.length, itemsPerPage]);

  // Fetch all data initially
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const sectionsResponse = await getAllSections();
        if (sectionsResponse.status === "success") {
          setSections(sectionsResponse.data.sections);
        }

        const subSectionsResponse = await getAllSubSections();
        if (subSectionsResponse.status === "success") {
          setSubSections(subSectionsResponse.data.subsections);
        }

        if (isLoggedIn()) {
          const purchasedResult = await getUserPurchasedProducts();
          if (purchasedResult.success) {
            setPurchasedProductIds(purchasedResult.productIds);
          }
        }

        const productsResponse = await getAllProducts();

        if (productsResponse.status === "success") {
          const now = new Date();
          const productsWithNewFlag = productsResponse.data.products.map(
            (product) => {
              const createdDate = new Date(product.createdAt);
              const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);

              return {
                ...product,
                isNew: diffInDays <= 3,
              };
            },
          );
          setAllProducts(productsWithNewFlag);
        }
      } catch (err) {
        setError(err.message);
        console.error(t("errors.fetchErrorLog"), err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [t]);

  // Handle add to cart
  const handleAddToCart = async (productId, event, product) => {
    event.stopPropagation();

    if (!getToken()) {
      setPendingProductId({
        id: productId,
        type: product?.__t === "ECBook" ? "book" : "product",
      });
      setShowAuthModal(true);
      return;
    }

    const isPurchased = purchasedProductIds.includes(productId);
    if (isPurchased) {
      const confirmMessage = isRTL
        ? "لقد قمت بشراء هذا المنتج من قبل. هل تريد شراءه مرة أخرى؟"
        : "You have already purchased this product. Do you want to buy it again?";

      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setAddingToCart({ ...addingToCart, [productId]: true });
      const result = await addToCart(productId);
      if (result.success) {
        toast.success(
          t("success.addedToCart") || "تمت الإضافة إلى السلة بنجاح!",
        );
        const currentCount = Number(localStorage.getItem("cartCount")) || 0;
        localStorage.setItem("cartCount", currentCount + 1);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        if (result.error && result.error.includes("Cannot add item of type")) {
          setCartTypeError({
            show: true,
            message: result.error,
          });
        } else {
          toast.error(
            result.error ||
              t("errors.addToCartFailed") ||
              "فشل في الإضافة إلى السلة",
          );
        }
      }
    } catch (error) {
      if (error.message && error.message.includes("Cannot add item of type")) {
        setCartTypeError({
          show: true,
          message: error.message,
        });
      } else {
        toast.error(
          error.message ||
            t("errors.addToCartFailed") ||
            "فشل في الإضافة إلى السلة",
        );
      }
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubSection, searchQuery]);

  // Get subsections for the currently selected section
  const currentSubSections = useMemo(() => {
    if (activeTab === "all") return [];
    return subSections.filter(
      (subSection) => subSection.section?._id === activeTab,
    );
  }, [activeTab, subSections]);

  // Reset subsection when section changes
  useEffect(() => {
    setActiveSubSection("all");
  }, [activeTab]);

  // Create categories array
  const categories = [
    { id: "all", name: isRTL ? "الكل" : "All" },
    ...sections.map((section) => ({
      id: section._id,
      name: section.name,
    })),
  ];

  if (loading && allProducts.length === 0) {
    return <KalimaLoader fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-12 rounded-3xl border border-base-content/5 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-base-content mb-2">
            {isRTL ? "حدث خطأ" : "Error"}
          </h3>
          <p className="text-base-content/40">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className={`mb-16 ${isRTL ? "text-right" : "text-left"}`}>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-6 mb-8 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-16 h-px bg-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
                {isRTL ? "متجر كلمة" : "Kalima Store"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-black text-base-content leading-[0.9] tracking-tighter mb-8"
            >
              {isRTL ? (
                <>
                  اكتشف <span className="text-secondary italic">منتجاتنا</span>{" "}
                  <br /> المميزة
                </>
              ) : (
                <>
                  Discover Our <br />
                  <span className="text-secondary italic">Products</span>
                </>
              )}
            </motion.h1>

            <p className="text-lg text-base-content/30 font-medium leading-relaxed max-w-xl italic border-l-4 border-primary/20 pl-8 rtl:border-l-0 rtl:border-r-4 rtl:pr-8 rtl:pl-0">
              {t("hero.tagline")}
            </p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 py-4 ${
                  isRTL ? "pr-14" : "pl-14"
                } bg-base-100 border border-base-content/10 rounded-2xl text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors`}
              />
              <Search
                className={`absolute ${
                  isRTL ? "right-5" : "left-5"
                } top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/30`}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-0 z-20 bg-white border-b border-base-content/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === category.id
                    ? "bg-primary text-white"
                    : "bg-base-100 text-base-content/60 hover:bg-base-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subsection Tabs */}
          {activeTab !== "all" && currentSubSections.length > 0 && (
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-3 border-t border-base-content/5">
              <button
                onClick={() => setActiveSubSection("all")}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeSubSection === "all"
                    ? "bg-secondary text-white"
                    : "bg-base-100 text-base-content/60 hover:bg-base-200"
                }`}
              >
                {t("allSubSections") || "All"}
              </button>
              {currentSubSections.map((subSection) => (
                <button
                  key={subSection._id}
                  onClick={() => setActiveSubSection(subSection._id)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeSubSection === subSection._id
                      ? "bg-secondary text-white"
                      : "bg-base-100 text-base-content/60 hover:bg-base-200"
                  }`}
                >
                  {subSection.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {loading && (
            <div className="flex justify-center mb-8">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {paginatedItems.map((item, index) => {
              const isPurchased = purchasedProductIds.includes(item._id);

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative bg-white rounded-3xl border border-base-content/5 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
                    {/* Badges */}
                    <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10">
                      {item.isNew && !isPurchased && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white rounded-full text-xs font-bold">
                          <Sparkles className="w-3 h-3" />
                          {t("product.new") || "NEW"}
                        </div>
                      )}
                      {isPurchased && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold">
                          <Check className="w-3 h-3" />
                          {isRTL ? "تم الشراء" : "Purchased"}
                        </div>
                      )}
                      {item.discountPercentage > 0 && (
                        <div
                          className={`px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold ${
                            !item.isNew && !isPurchased
                              ? isRTL
                                ? "mr-auto"
                                : "ml-auto"
                              : ""
                          }`}
                        >
                          -{item.discountPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-base-200 overflow-hidden">
                      <img
                        src={
                          convertPathToUrl(
                            item.thumbnail,
                            "product_thumbnails",
                          ) || "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg font-black text-base-content mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-3 mb-6">
                        {item.priceAfterDiscount &&
                        item.priceAfterDiscount < item.price ? (
                          <>
                            <span className="text-2xl font-black text-primary">
                              {item.priceAfterDiscount} {t("product.currency")}
                            </span>
                            <span className="text-sm text-base-content/30 line-through">
                              {item.price} {t("product.currency")}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-primary">
                            {item.price} {t("product.currency")}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const itemType =
                              item.__t === "ECBook" ? "book" : "product";
                            navigate(
                              `/market/product-details/${itemType}/${item._id}`,
                            );
                          }}
                          className="flex-1 py-3 px-4 bg-base-content text-white rounded-xl font-bold hover:bg-primary transition-colors"
                        >
                          {t("product.viewDetails")}
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(item._id, e, item)}
                          disabled={addingToCart[item._id]}
                          className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-base-content/10 hover:border-primary hover:bg-primary hover:text-white transition-all"
                        >
                          {addingToCart[item._id] ? (
                            <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <ShoppingCart className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-base-200 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-base-content/30" />
              </div>
              <h3 className="text-2xl font-black text-base-content mb-2">
                {t("emptyState.title")}
              </h3>
              <p className="text-base-content/40">
                {t("emptyState.description")}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || loading}
                  className="w-12 h-12 rounded-full border border-base-content/10 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isRTL ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`w-12 h-12 rounded-full font-bold transition-all ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "border border-base-content/10 hover:border-primary"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="w-12 h-12 rounded-full border border-base-content/10 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isRTL ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cart Type Mismatch Modal */}
      <AnimatePresence>
        {cartTypeError.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-base-content mb-4">
                  {isRTL ? "تنبيه!" : "Warning!"}
                </h3>
                <p className="text-base-content/60 mb-8">
                  {isRTL
                    ? "السلة تحتوي على نوع مختلف من المنتجات. يجب أن تكون جميع المنتجات في السلة من نفس النوع."
                    : "Your cart contains a different type of items. All items in cart must be of the same type."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setCartTypeError({ show: false, message: "" })
                    }
                    className="flex-1 py-3 px-6 border border-base-content/10 rounded-xl font-bold hover:bg-base-100 transition-colors"
                  >
                    {isRTL ? "إغلاق" : "Close"}
                  </button>
                  <button
                    onClick={() => {
                      setCartTypeError({ show: false, message: "" });
                      navigate("/cart");
                    }}
                    className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    {isRTL ? "عرض السلة" : "View Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Required Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-base-content mb-4">
                  {isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}
                </h3>
                <p className="text-base-content/60 mb-8">
                  {isRTL
                    ? "يجب تسجيل الدخول لإضافة المنتجات إلى السلة"
                    : "You need to login to add items to cart"}
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      const redirectUrl = pendingProductId
                        ? `/market/product-details/${pendingProductId.type}/${pendingProductId.id}`
                        : location.pathname + location.search;
                      navigate(
                        `/login?redirect=${encodeURIComponent(redirectUrl)}`,
                      );
                    }}
                    className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    {isRTL ? "تسجيل الدخول" : "Login"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      const redirectUrl = pendingProductId
                        ? `/market/product-details/${pendingProductId.type}/${pendingProductId.id}`
                        : location.pathname + location.search;
                      navigate(
                        `/register?redirect=${encodeURIComponent(redirectUrl)}`,
                      );
                    }}
                    className="flex-1 py-3 px-6 border border-base-content/10 rounded-xl font-bold hover:bg-base-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    {isRTL ? "إنشاء حساب" : "Register"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-base-100 flex items-center justify-center hover:bg-base-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Market;
