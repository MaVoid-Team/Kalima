import { useState, useCallback } from 'react';
import useApiMutation from '../useApiMutation';

export const useAdminProducts = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    // List State
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20
    });
    const [filters, setFilters] = useState({
        search: '',
        category_id: null,
        is_archived: null, // null = all, true = archived only, false = active only
    });

    // Detail State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [fieldDefinitions, setFieldDefinitions] = useState([]);

    const [initLoading, setInitLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loading = apiLoading || initLoading;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const buildQuery = useCallback(() => {
        const query = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
        });

        if (filters.search) query.append('search', filters.search);
        if (filters.category_id) query.append('category_id', filters.category_id);
        if (filters.is_archived !== null && filters.is_archived !== undefined) {
            query.append('is_archived', filters.is_archived);
        }

        return query.toString();
    }, [pagination.page, pagination.limit, filters]);

    const handleAction = useCallback(async (actionFn) => {
        setActionLoading(true);
        try {
            return await actionFn();
        } finally {
            setActionLoading(false);
        }
    }, []);

    // ─── Fetchers ────────────────────────────────────────────────────────────

    const fetchProducts = useCallback(async () => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/products?${buildQuery()}`,
                method: 'get'
            });

            if (data?.success) {
                setProducts(data.data ?? []);
                setPagination(prev => ({
                    ...prev,
                    total: data.total ?? prev.total,
                    page: data.page ?? prev.page,
                    pages: data.pages ?? Math.ceil((data.total ?? prev.total) / prev.limit) ?? prev.pages,
                    limit: data.limit ?? prev.limit,
                }));
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi, buildQuery]);

    const fetchProductById = useCallback(async (productId) => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}`,
                method: 'get'
            });

            if (data?.success) {
                setSelectedProduct(data.data);
            } else {
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            setSelectedProduct(null);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi]);

    const fetchFieldDefinitions = useCallback(async () => {
        try {
            const data = await fetchApi({
                endpoint: '/required-fields/definitions?active=true',
                method: 'get'
            });
            if (data?.success) {
                setFieldDefinitions(data.data ?? []);
            }
        } catch (error) {
            console.error('Failed to fetch field definitions:', error);
        }
    }, [fetchApi]);

    // ─── Product CRUD ─────────────────────────────────────────────────────────

    const createProduct = (formData, onUploadProgress) =>
        handleAction(() => fetchApi({
            endpoint: '/products',
            method: 'post',
            data: formData,
            onUploadProgress,
        }));

    const updateProduct = (productId, data) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}`,
            method: 'patch',
            data,
        }).then(res => {
            if (res?.success) setSelectedProduct(res.data);
            return res;
        }));

    const deleteProduct = (productId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}`,
            method: 'delete',
        }));

    // ─── Thumbnail ────────────────────────────────────────────────────────────

    const uploadThumbnail = (productId, formData) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/thumbnail`,
            method: 'post',
            data: formData,
        }).then(res => {
            if (res?.success) setSelectedProduct(res.data);
            return res;
        }));

    const removeThumbnail = (productId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/thumbnail`,
            method: 'delete',
        }).then(res => {
            if (res?.success) setSelectedProduct(res.data);
            return res;
        }));

    // ─── Gallery ──────────────────────────────────────────────────────────────

    const addGalleryImages = (productId, formData) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/gallery`,
            method: 'post',
            data: formData,
        }).then(res => {
            // Refresh product to get updated gallery
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    const updateGalleryEntry = (productId, galleryId, data) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/gallery/${galleryId}`,
            method: 'patch',
            data,
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    const removeGalleryEntry = (productId, galleryId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/gallery/${galleryId}`,
            method: 'delete',
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    // ─── Categories ───────────────────────────────────────────────────────────

    const attachCategories = (productId, categoryIds) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/categories`,
            method: 'post',
            data: { category_ids: categoryIds },
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    const detachCategory = (productId, categoryId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/categories/${categoryId}`,
            method: 'delete',
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    // ─── Coupons ───────────────────────────────────────────────────────────

    const getProductCoupons = useCallback((productId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/coupons`,
            method: 'get',
        }).then(res => {
            if (res?.success) return res.data ?? [];
            return res;
        })),
    [handleAction, fetchApi]);

    // ─── Required Fields ─────────────────────────────────────────────────────

    const attachRequiredFields = (productId, fields) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/required-fields`,
            method: 'post',
            data: { fields },
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    const detachRequiredField = (productId, fieldDefinitionId) =>
        handleAction(() => fetchApi({
            endpoint: `/products/${productId}/required-fields/${fieldDefinitionId}`,
            method: 'delete',
        }).then(res => {
            if (res?.success) fetchProductById(productId);
            return res;
        }));

    // ─── Samples ──────────────────────────────────────────────────────────────

    const fetchAllSamples = useCallback(async () => {
        try {
            const data = await fetchApi({ endpoint: '/samples', method: 'get' });
            return data;
        } catch (error) {
            console.error('Failed to fetch samples:', error);
            return null;
        }
    }, [fetchApi]);

    // ─── Filter Setters ───────────────────────────────────────────────────────

    const setSearch = useCallback((query) => {
        setFilters(prev => ({ ...prev, search: query }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const setCategoryFilter = useCallback((categoryId) => {
        setFilters(prev => ({ ...prev, category_id: categoryId }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const setArchivedFilter = useCallback((isArchived) => {
        setFilters(prev => ({ ...prev, is_archived: isArchived }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // State
        products,
        pagination,
        filters,
        selectedProduct,
        fieldDefinitions,
        loading,
        actionLoading,

        // Fetchers
        fetchProducts,
        fetchProductById,
        fetchFieldDefinitions,

        // Product CRUD
        createProduct,
        updateProduct,
        deleteProduct,

        // Thumbnail
        uploadThumbnail,
        removeThumbnail,

        // Gallery
        addGalleryImages,
        updateGalleryEntry,
        removeGalleryEntry,

        // Categories
        attachCategories,
        detachCategory,

        // Coupons
        getProductCoupons,

        // Required Fields
        attachRequiredFields,
        detachRequiredField,

        // Samples
        fetchAllSamples,

        // Filter Setters
        setSearch,
        setCategoryFilter,
        setArchivedFilter,
        setPage,
    };
};

export default useAdminProducts;
