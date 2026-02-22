import { useTranslation } from "react-i18next";
import HeroSection from "@/components/MarketPage/HeroSection";
import PromoBanner from "@/components/MarketPage/PromoBanner";
import CategorySidebar from "@/components/MarketPage/CategorySidebar";
import ProductGrid from "@/components/MarketPage/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

export default function MarketPage() {
  const { t } = useTranslation("market");

  const {
    products,
    pagination,
    loading: productsLoading,
    filters,
    setSearch,
    setCategory,
    setPage,
  } = useProducts();

  const { categories, loading: categoriesLoading } = useCategories();

  const handleSearch = (query) => {
    setSearch(query);
  };

  const handleCategorySelect = (id) => {
    setCategory(id);
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
            selectedId={filters.category_id}
            onSelect={handleCategorySelect}
            loading={categoriesLoading}
          />

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={productsLoading}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Promo banner stays below */}
      <PromoBanner />
    </>
  );
}
