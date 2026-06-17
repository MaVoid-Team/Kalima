import { useState, useEffect, useCallback } from "react";
import useAdminCategories from "@/hooks/admin/useAdminCategories";

export default function useCategoriesPage() {
  const {
    categories,
    childrenMap,
    pagination,
    loading,
    fetchCategories,
    fetchChildren,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories();

  // Query state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState(null);

  useEffect(() => {
    fetchCategories({ page, limit: 8, active: statusFilter });
  }, [fetchCategories, page, statusFilter]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSuccess = useCallback(
    (shouldRefetch = false) => {
      if (shouldRefetch || statusFilter !== "all") {
        fetchCategories({ page, limit: 8, active: statusFilter });
      }
      setIsCreateModalOpen(false);
      setEditCategory(null);
      setDeleteCategoryItem(null);
    },
    [fetchCategories, page, statusFilter],
  );

  const handleStatusFilterChange = useCallback((val) => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  return {
    // Data
    categories,
    pagination,
    loading,

    // Filters
    statusFilter,
    handleStatusFilterChange,

    // Modals state
    isCreateModalOpen,
    setIsCreateModalOpen,
    editCategory,
    setEditCategory,
    deleteCategoryItem,
    setDeleteCategoryItem,

    // Actions
    handlePageChange,
    handleSuccess,

    // Expose API functions for single instance usage
    childrenMap,
    fetchChildren,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
