import { useState, useCallback } from "react";
import useAdminCategories from "@/hooks/api/useAdminCategories";

export default function useDeleteCategoryDialog({
  category,
  onClose,
  onSuccess,
  actions,
}) {
  const { deleteCategory } = actions;

  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!category) return;

    setLoading(true);
    try {
      await deleteCategory(category.id);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setLoading(false);
    }
  }, [category, deleteCategory, onSuccess, handleClose]);

  return {
    loading,
    handleClose,
    handleDelete,
  };
}
