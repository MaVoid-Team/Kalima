import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

export const useLandingInsights = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, pagination, loading: productsLoading } = useProducts();

  const insights = useMemo(() => {
    const featuredProducts = products.slice(0, 3);

    return {
      metrics: {
        activePrograms: pagination.total || products.length,
        learningTracks: categories.length,
        featuredResources: featuredProducts.length,
      },
      featuredProducts,
    };
  }, [categories.length, pagination.total, products]);

  return {
    ...insights,
    loading: categoriesLoading || productsLoading,
  };
};

export default useLandingInsights;
