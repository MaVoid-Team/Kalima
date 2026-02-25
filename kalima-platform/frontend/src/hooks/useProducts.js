import { useState, useEffect, useCallback } from 'react';
import useApiMutation from './useApiMutation';
import { buildProductImages } from '../lib/storeUtils';

export const useProducts = (id = null) => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    // List state
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 6
    });
    const [filters, setFilters] = useState({
        search: '',
        category_id: null,
    });

    // Single product state
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState({ main: null, thumbnails: [] });
    const [notFound, setNotFound] = useState(false);

    const [initLoading, setInitLoading] = useState(true);
    const loading = apiLoading || initLoading;

    const fetchProducts = useCallback(async () => {
        try {
            const query = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                is_archived: false,
            });

            if (filters.search) {
                query.append('search', filters.search);
            }
            if (filters.category_id) {
                query.append('category_id', filters.category_id);
            }

            const data = await fetchApi({
                endpoint: `/products?${query.toString()}`,
                method: 'get'
            });

            if (data?.success) {
                setProducts(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.total ?? prev.total,
                    page: data.page ?? prev.page,
                    limit: data.limit ?? prev.limit,
                }));
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]);
        } finally {
            setInitLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, filters.search, filters.category_id]);

    const fetchProductById = useCallback(async (productId) => {
        setNotFound(false);
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}`,
                method: 'get'
            });

            if (data?.success) {
                const prodData = data.data;

                // Attach the first category title as `category` on the product for breadcrumbs
                if (prodData.product_categories && prodData.product_categories.length > 0) {
                    prodData.category = prodData.product_categories[0].categories?.title;
                }

                setProduct(prodData);

                // Use helper from storeUtils to display thumbnails correctly
                const productImages = buildProductImages(prodData, prodData.product_gallery);
                setImages(productImages);
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            setNotFound(true);
        } finally {
            setInitLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setInitLoading(true);
        if (id) {
            fetchProductById(id);
        } else {
            fetchProducts();
        }
    }, [id, fetchProducts, fetchProductById]);

    const setSearch = useCallback((query) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setCategory = useCallback((catId) => {
        setFilters((prev) => ({ ...prev, category_id: catId }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    return {
        // List returns
        products,
        pagination,
        filters,
        setSearch,
        setCategory,
        setPage,
        // Single product returns
        product,
        images,
        notFound,
        // Shared returns
        loading,
    };
};
