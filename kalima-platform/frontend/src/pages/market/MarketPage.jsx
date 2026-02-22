import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "@/api/axios";
import HeroSection from "@/components/MarketPage/HeroSection";
import PromoBanner from "@/components/MarketPage/PromoBanner";
import CategorySidebar from "@/components/MarketPage/CategorySidebar";
import ProductGrid from "@/components/MarketPage/ProductGrid";

export default function MarketPage() {
  const { t } = useTranslation("market");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch root categories once on mount
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    axios
      .get("/categories/roots")
      .then((res) => {
        if (cancelled) return;
        // Handle common API response shapes
        const data = res.data?.data ?? res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);

    const params = { page: currentPage };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCategoryId) params.category_id = selectedCategoryId;

    axios
      .get("/products", { params })
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;

        // Handle paginated response shapes
        const items = Array.isArray(data)
          ? data
          : (data?.products ?? data?.items ?? data?.results ?? []);

        setProducts(items.map(normalizeProduct));

        // Pagination meta — try common field names
        const meta = res.data?.meta ?? res.data?.pagination ?? null;
        if (meta) {
          setPagination({
            currentPage:
              meta.currentPage ?? meta.page ?? currentPage,
            totalPages:
              meta.totalPages ?? meta.last_page ?? meta.pages ?? 1,
          });
        } else {
          setPagination(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategoryId, currentPage]);

  // When filters change, reset to page 1
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Hero / Search */}
      <HeroSection onSearch={handleSearch} />

      <div className="container pb-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Sidebar */}
          <CategorySidebar
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategorySelect}
            loading={categoriesLoading}
          />

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={productsLoading}
              pagination={pagination}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Promo banner stays below */}
      <PromoBanner />
    </>
  );
}

/**
 * Normalises a raw product object from the API into the shape
 * expected by <ProductCard>.
 */
function normalizeProduct(p) {
  return {
    id: p.id,
    title: p.title ?? p.name ?? "",
    category: p.product_categories?.[0]?.categories?.title ?? p.category?.name ?? p.category_name ?? "",
    price: p.price_after_discount ?? p.price ?? 0,
    originalPrice: p.price_after_discount ? p.price : null,
    image: p.thumbnail_image?.url ?? p.thumbnail ?? null,
  };
}
