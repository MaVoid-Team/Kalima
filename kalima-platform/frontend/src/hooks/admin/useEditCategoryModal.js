import { useState, useEffect, useCallback } from "react";
import useCategoryParents from "@/hooks/useCategoryParents";

export default function useEditCategoryModal({
  isOpen,
  category,
  onSuccess,
  actions,
}) {
  const { updateCategory } = actions;
  const parentOptions = useCategoryParents(isOpen, category);

  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    parentId: "none",
    active: true,
  });

  // Reset form when modal opens or category changes
  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        title: category.title || "",
        description: category.description || "",
        parentId: category.parent?.id
          ? category.parent.id.toString()
          : category.parent_id
            ? category.parent_id.toString()
            : "none",
        active: category.active !== false,
      });
    }
  }, [isOpen, category]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.title.trim() || !category) return;

      setLoading(true);
      try {
        const data = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          parent_id:
            formData.parentId !== "none" ? parseInt(formData.parentId) : null,
          active: formData.active,
        };

        await updateCategory(category.id, data);
        onSuccess(false); // Pass false for edits so we don't necessarily trigger refetch
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [formData, category, updateCategory, onSuccess],
  );

  return {
    loading,
    formData,
    parentOptions,
    handleChange,
    handleSubmit,
  };
}
