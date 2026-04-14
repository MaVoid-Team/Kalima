import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HeroSection from "@/components/MarketPage/HeroSection";
import CategorySidebar from "@/components/MarketPage/CategorySidebar";
import ProductGrid from "@/components/MarketPage/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate } from "react-router-dom";
import useRole from "@/hooks/useRole";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  const { t } = useTranslation("market");
  const { isStudent } = useRole();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isStudent) {
      navigate("/", { replace: true });
    }
  }, [isStudent, navigate]);

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

  const { categories, loading: categoriesLoading } = useCategories();

  // Helper to find a category in the nested tree
  const findCategoryById = (id, list) => {
    for (const cat of list) {
      if (String(cat.id) === String(id)) return cat;
      if (cat.sub_categories?.length) {
        const found = findCategoryById(id, cat.sub_categories);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategoryObj = filters.category_id
    ? findCategoryById(filters.category_id, categories)
    : null;
  const pillsContext = selectedCategoryObj || null;
  const currentPills = pillsContext?.sub_categories || [];

  const handleCategorySelect = (id) => {
    setCategory(id);
    // If it's a new root selection from sidebar, we should scroll or just let it update.
  };

  const handleBackNavigation = () => {
    if (selectedCategoryObj && selectedCategoryObj.parent_id) {
      setCategory(selectedCategoryObj.parent_id);
    } else {
      setCategory(null);
    }
  };

  return (
    <>
      {/* Hero / Search */}
      <HeroSection onSearch={setSearch} />

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
            {/* Navigation Header / Pills */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Active Category Display & Back Button */}
              {selectedCategoryObj && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <button
                    onClick={handleBackNavigation}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <span>{t("common.back", "رجوع")}</span>
                  </button>
                  <span>/</span>
                  <span className="font-semibold text-foreground">
                    {selectedCategoryObj.title}
                  </span>
                </div>
              )}

              {/* Subcategory Pills */}
              {currentPills.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {currentPills.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setCategory(child.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        filters.category_id === child.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80",
                      )}
                      data-testid={`market-child-category-${child.id}`}
                    >
                      {child.title ?? child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
