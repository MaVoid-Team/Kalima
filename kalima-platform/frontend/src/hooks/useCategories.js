import { useState, useEffect, useCallback } from "react";
import useApiMutation from "./useApiMutation";

const parseCategoriesList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [childCategories, setChildCategories] = useState({});
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [initLoading, setInitLoading] = useState(true);

  const loading = apiLoading || initLoading;

  const fetchChildCategories = useCallback(
    async (parentId) => {
      if (!parentId) return [];

      try {
        const data = await fetchApi({
          endpoint: `/categories/${parentId}/children?active=true`,
          method: "get",
        });

        const children = parseCategoriesList(data?.data ?? data);

        setChildCategories((prev) => ({
          ...prev,
          [parentId]: children,
        }));

        return children;
      } catch (error) {
        console.error(`Failed to fetch child categories for ${parentId}:`, error);

        setChildCategories((prev) => ({
          ...prev,
          [parentId]: [],
        }));

        return [];
      }
    },
    [fetchApi]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi({
          endpoint: "/categories/roots?active=true",
          method: "get",
        });

        const roots = parseCategoriesList(data?.data ?? data);
        setCategories(roots);

        // Prime child map from roots payload (backend already includes sub_categories)
        const primedChildren = roots.reduce((acc, root) => {
          acc[root.id] = Array.isArray(root.sub_categories) ? root.sub_categories : [];
          return acc;
        }, {});

        setChildCategories(primedChildren);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        setChildCategories({});
      } finally {
        setInitLoading(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    categories,
    childCategories,
    fetchChildCategories,
    loading,
  };
};
