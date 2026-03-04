import { useState, useEffect, useCallback } from "react";
import useCategoryParents from "@/hooks/useCategoryParents";

export default function useCreateCategoryModal({ isOpen, onSuccess, actions }) {
  const { createCategory } = actions;
  const parentOptions = useCategoryParents(isOpen, null);

  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    parentId: "none",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        parentId: "none",
      });
    }
  }, [isOpen]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.title.trim()) return;

      setLoading(true);
      try {
        const data = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          parent_id:
            formData.parentId !== "none" ? parseInt(formData.parentId) : null,
        };

        await createCategory(data);
        onSuccess(true); // Pass true to signal creation (to trigger refetch)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [formData, createCategory, onSuccess],
  );

  return {
    loading,
    formData,
    parentOptions,
    handleChange,
    handleSubmit,
  };
}
