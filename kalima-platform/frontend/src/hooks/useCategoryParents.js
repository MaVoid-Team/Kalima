import { useState, useEffect, useMemo } from "react";
import useApiMutation from "@/hooks/useApiMutation";

export default function useCategoryParents(isOpen, category) {
  const { mutate: apiMutate } = useApiMutation();
  const [allCategories, setAllCategories] = useState([]);
  const isEdit = !!category;

  // Fetch roots for parent selection
  useEffect(() => {
    if (isOpen) {
      apiMutate({
        endpoint: "/categories/roots?limit=500",
        method: "get",
      }).then((res) => {
        if (res?.success) {
          setAllCategories(res.data || []);
        }
      });
    }
  }, [isOpen, apiMutate]);

  // Determine valid parents (Roots and their sub_categories)
  const validParents = useMemo(() => {
    if (!allCategories.length) return [];

    const options = [];

    // allCategories contains roots
    allCategories.forEach((root) => {
      // If editing this root, we cannot select it or its sub_categories as parent
      if (isEdit && String(root.id) === String(category.id)) {
        return; // skip this root and its children completely
      }

      options.push({
        id: root.id.toString(),
        title: root.title,
      });

      // Add sub_categories (depth 1)
      if (root.sub_categories && root.sub_categories.length > 0) {
        root.sub_categories.forEach((sub) => {
          // If editing this sub_category, we cannot select it as parent
          if (isEdit && String(sub.id) === String(category.id)) {
            return; // skip this sub
          }

          options.push({
            id: sub.id.toString(),
            title: `— ${sub.title}`,
          });
        });
      }
    });

    return options;
  }, [allCategories, isEdit, category]);

  return { validParents, allCategoriesDisabled: allCategories.length === 0 };
}
