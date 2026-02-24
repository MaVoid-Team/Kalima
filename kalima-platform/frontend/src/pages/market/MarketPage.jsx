import React from 'react';
import { useTranslation } from "react-i18next";
import HeroSection from "@/components/MarketPage/HeroSection";
import PromoBanner from "@/components/MarketPage/PromoBanner";
import CategorySidebar from "@/components/MarketPage/CategorySidebar";
import ProductGrid from "@/components/MarketPage/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  const { t } = useTranslation("market");

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    products,
    pagination,
    loading: productsLoading,
    filters,
    setSearch,
    setCategory,
    setPage,
  } = useProducts();

  const {
    categories,
    childCategories,
    fetchChildCategories,
    loading: categoriesLoading
  } = useCategories();

  const [activeRootId, setActiveRootId] = useState(null);

  useEffect(() => {
    // If we have an active root category, fetch its children
    if (activeRootId) {
      fetchChildCategories(activeRootId);
    }
  }, [activeRootId, fetchChildCategories]);

  // If a category from URL or external is set, try to find its parent if it's a child.
  // For simplicity, we just sync root when the user clicks. 
  // If `filters.category_id` is null, we unset active root.
  useEffect(() => {
    if (filters.category_id === null && activeRootId !== null) {
      setActiveRootId(null);
    }
  }, [filters.category_id]); // eslint-disable-line

  const handleSearch = (query) => {
    setSearch(query);
  };

  const handleCategorySelect = (id) => {
    setActiveRootId(id);
    setCategory(id);
  };

  const currentChildren = activeRootId ? childCategories[activeRootId] || [] : [];

  return (
    <>
      {/* Hero / Search */}
      <HeroSection onSearch={handleSearch} />

      <div className="container pb-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Sidebar */}
          <CategorySidebar
            categories={categories}
            selectedId={activeRootId}
            onSelect={handleCategorySelect}
            loading={categoriesLoading}
          />

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
            {/* Child Categories Pills */}
            {activeRootId && currentChildren.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide">
                <button
                  onClick={() => setCategory(activeRootId)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    filters.category_id === activeRootId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {t("sidebar.allCategories", { defaultValue: "الكل" })}
                </button>
                {currentChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setCategory(child.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      filters.category_id === child.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    {child.title ?? child.name}
                  </button>
                ))}
              </div>
            )}

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
      {/* <PromoBanner /> */}
    </>
  );
}
