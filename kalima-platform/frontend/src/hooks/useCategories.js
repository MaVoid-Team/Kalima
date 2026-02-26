import { useState, useEffect, useCallback } from "react";
import useApiMutation from "./useApiMutation";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [initLoading, setInitLoading] = useState(true);

  const loading = apiLoading || initLoading;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch root categories (the backend provides the nested tree here)
        const data = await fetchApi({
          endpoint: "/categories/roots?active=true",
          method: "get",
        });
        if (data?.success) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setInitLoading(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    categories,
    loading,
  };
};
