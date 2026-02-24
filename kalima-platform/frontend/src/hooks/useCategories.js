import { useState, useEffect, useCallback } from 'react';
import useApiMutation from './useApiMutation';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
    const [initLoading, setInitLoading] = useState(true);
    const [childCategories, setChildCategories] = useState({});

    const loading = apiLoading || initLoading;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await fetchApi({
                    endpoint: '/categories/roots?active=true',
                    method: 'get'
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
    }, []); // fetchApi is not memoized, excluding to prevent infinite loops

    const fetchChildCategories = useCallback(async (parentId) => {
        if (!parentId || childCategories[parentId]) return;

        try {
            const data = await fetchApi({
                endpoint: `/categories/${parentId}/children?active=true`,
                method: 'get'
            });
            if (data?.success) {
                setChildCategories(prev => ({
                    ...prev,
                    [parentId]: data.data
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch child categories for parent ${parentId}:`, error);
        }
    }, [childCategories, fetchApi]);

    return {
        categories,
        childCategories,
        fetchChildCategories,
        loading
    };
};
