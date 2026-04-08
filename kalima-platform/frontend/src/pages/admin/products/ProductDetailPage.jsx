import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import { ChevronLeft, Package, Pencil, Trash2, Clock } from 'lucide-react';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useAdminCoupons } from '@/hooks/admin/useAdminCoupons';
import { formatCurrency } from '@/lib/storeUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import EditCouponDialog from '@/components/admin/coupons/EditCouponDialog';
import DeleteProductDialog from '@/components/admin/products/DeleteProductDialog';
import ThumbnailManager from '@/components/admin/products/ThumbnailManager';
import GalleryManager from '@/components/admin/products/GalleryManager';
import CategoriesManager from '@/components/admin/products/CategoriesManager';
import RequiredFieldsManager from '@/components/admin/products/RequiredFieldsManager';
import SampleManager from '@/components/admin/products/SampleManager';
import FileUploadProgress from '@/components/admin/settings/FileUploadProgress';
import ReviewManager from '@/components/admin/products/ReviewManager';
import { getDiscountType, getCouponId, isCouponActive } from '@/lib/couponUtils';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    const {
        selectedProduct,
        fieldDefinitions,
        loading,
        actionLoading,
        fetchProductById,
        fetchFieldDefinitions,
        deleteProduct,
        uploadThumbnail,
        removeThumbnail,
        addGalleryImages,
        updateGalleryEntry,
        removeGalleryEntry,
        addGalleryVideo,
        addExternalGalleryVideo,
        removeGalleryVideo,
        attachCategories,
        detachCategory,
        attachRequiredFields,
        detachRequiredField,
        getProductCoupons,
        updateProductSample,
        removeProductSample,
    } = useAdminProducts();

    const {
        updateCoupon,
        generateCouponCode,
        apiLoading: couponLoading,
    } = useAdminCoupons();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [productCoupons, setProductCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [editCouponOpen, setEditCouponOpen] = useState(false);

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFileName, setUploadFileName] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadAbortController, setUploadAbortController] = useState(null);

    const refresh = useCallback(() => {
        fetchProductById(id);
    }, [fetchProductById, id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const loadProductCoupons = useCallback(async () => {
        if (!id) return;

        setCouponsLoading(true);
        try {
            const data = await getProductCoupons(id);
            setProductCoupons(Array.isArray(data) ? data : []);
        } catch {
            setProductCoupons([]);
        } finally {
            setCouponsLoading(false);
        }
    }, [getProductCoupons, id]);

    useEffect(() => {
        loadProductCoupons();
    }, [loadProductCoupons]);

    const handleDelete = () => {
        if (product?.samples || product?.sample_url) {
            toast.error(t('products.delete.hasSampleError', 'Cannot delete product with linked sample. Please remove the sample first.'));
            return;
        }
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const res = await deleteProduct(id);
        if (res?.success) navigate('/admin/products');
    };

    const handleEditCoupon = (coupon) => {
        setSelectedCoupon(coupon);
        setEditCouponOpen(true);
    };

    const handleUpdateCoupon = async (couponId, payload) => {
        const result = await updateCoupon(couponId, payload);
        await loadProductCoupons();
        return result ?? true;
    };

    // ─── Upload Handlers ───────────────────────────────────────────────────────

    const handleThumbnailUpload = async (formData) => {
        const file = formData.get('thumbnail');
        if (!file) return;

        // Create new AbortController for this upload
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName(file.name);
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await uploadThumbnail(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (res?.success) {
                fetchProductById(id);
            } else {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryUpload = async (formData) => {
        // Create new AbortController for this upload
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName('Gallery images');
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await addGalleryImages(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (res?.success) {
                // Product refresh is handled in hook
            } else {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryVideoUpload = async (formData) => {
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName('Gallery video');
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await addGalleryVideo(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (!res?.success) {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryExternalVideo = async (url) => {
        setIsUploading(true);
        try {
            const res = await addExternalGalleryVideo(id, url);
            if (!res?.success) {
                toast.error(res?.message || 'Failed to add external video');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add external video');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSampleUpload = async (formData) => {
        const hqFile = formData.get('high_quality');
        const lqFile = formData.get('low_quality');
        // We allow updates even without new files (for section/media type updates)
        
        // Create new AbortController for this upload
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName(hqFile ? hqFile.name : (lqFile ? lqFile.name : 'Metadata update'));
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await updateProductSample(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            
            if (res?.success) {
                // Product refresh is handled in hook/refresh
                refresh();
                return true;
            } else {
                setUploadError(res?.message || 'Upload failed');
                return false;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
            return false;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleUploadCancel = () => {
        if (uploadAbortController) {
            uploadAbortController.abort();
            setUploadAbortController(null);
        }
        // Immediately reset all upload states to re-enable buttons
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        setUploadError('');
    };

    if (loading && !selectedProduct) {
        return (
            <div className="space-y-6" data-testid="product-detail-skeleton">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!selectedProduct) {
        return (
            <div className="text-center py-16" data-testid="product-detail-not-found">
                <p className="text-muted-foreground">{t('products.noProducts')}</p>
                <Button variant="link" onClick={() => navigate('/admin/products')} className="mt-2">
                    {t('products.backToProducts')}
                </Button>
            </div>
        );
    }

    const product = selectedProduct;
    const isComingSoon = product.release_at && new Date(product.release_at) > new Date();

    return (
        <div className="space-y-6 no-scrollbar" data-testid="product-detail-page">
            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/admin/products" className="hover:text-foreground transition-colors flex items-center gap-1" data-testid="product-detail-back-link">
                    <ChevronLeft className="h-4 w-4" />
                    {t('products.backToProducts')}
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                    <Package className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{product.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline">{t(`products.type.${product.type}`, product.type)}</Badge>
                            <Badge
                                className={cn(
                                    product.is_archived
                                        ? 'bg-destructive/20 text-destructive border-destructive/50'
                                        : 'bg-success/20 text-success border-success/50'
                                )}
                            >
                                {product.is_archived ? t('products.status.archived') : t('products.status.active')}
                            </Badge>
                            {product.serial && (
                                <span className="text-sm text-muted-foreground">{product.serial}</span>
                            )}
                            {isComingSoon && (
                                <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-600 border-amber-500/30"
                                >
                                    <Clock className="h-3.5 w-3.5 me-1.5" />
                                    {t('products.status.comingSoon', 'Coming Soon')}
                                </Badge>
                            )}
                        </div>
                        {isComingSoon && product.release_at && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('products.detail.releaseDate', 'Release Date')}: {new Date(product.release_at).toLocaleDateString(i18n.language, { dateStyle: 'long' })}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid="product-detail-edit-button"
                    >
                        <Link to={`/admin/products/${id}/edit`}>
                            <Pencil className="me-2 h-4 w-4" />
                            {t('products.actions.edit')}
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={actionLoading}
                        data-testid="product-detail-delete-button"
                    >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('products.actions.delete')}
                    </Button>
                </div>
            </div>

            {/* Info Section */}
            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-info">
                <h2 className="font-semibold text-foreground">{t('products.detail.info')}</h2>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">{t('products.form.price')}</span>
                        <p className="font-medium mt-0.5">{formatCurrency(product.price, t)}</p>
                    </div>
                    {product.price_after_discount && (
                        <div>
                            <span className="text-muted-foreground">{t('products.form.priceAfterDiscount')}</span>
                            <p className="font-medium mt-0.5">{formatCurrency(product.price_after_discount, t)}</p>
                        </div>
                    )}
                    {product.serial && (
                        <div>
                            <span className="text-muted-foreground">{t('products.form.serial')}</span>
                            <p className="font-medium mt-0.5">{product.serial}</p>
                        </div>
                    )}
                    {product.description && (
                        <div className="sm:col-span-2 lg:col-span-3">
                            <span className="text-muted-foreground">{t('products.form.description')}</span>
                            <p className="mt-0.5 whitespace-pre-wrap">{product.description}</p>
                        </div>
                    )}
                    {product.perks && (
                        <div className="sm:col-span-2 lg:col-span-3" data-testid="product-detail-perks">
                            <span className="text-muted-foreground">{t('products.form.perks')}</span>
                            <ul className="list-disc ps-5 mt-0.5">
                                {product.perks.split(/[,،]/).map((perk, i) => (
                                    <li key={i}>{perk.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail + Gallery */}
            <div className="rounded-xl border border-border p-5 space-y-5" data-testid="product-detail-media">
                <h2 className="font-semibold text-foreground">{t('products.detail.media')}</h2>
                <Separator />

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('products.detail.thumbnail')}</h3>
                    <ThumbnailManager
                        product={product}
                        onUpload={handleThumbnailUpload}
                        onRemove={() => removeThumbnail(id)}
                        loading={isUploading}
                    />
                </div>

                <Separator />

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('products.detail.gallery')}</h3>
                    <GalleryManager
                        product={product}
                        onAddImages={handleGalleryUpload}
                        onAddVideo={handleGalleryVideoUpload}
                        onAddExternalVideo={handleGalleryExternalVideo}
                        onUpdateEntry={(galleryId, data) => updateGalleryEntry(id, galleryId, data)}
                        onRemoveImage={(galleryId) => removeGalleryEntry(id, galleryId)}
                        onRemoveVideo={(videoId) => removeGalleryVideo(id, videoId)}
                        loading={isUploading}
                    />
                </div>
            </div>

            {/* ── Upload Progress ── */}
            <FileUploadProgress
                progress={uploadProgress}
                isUploading={isUploading}
                onCancel={handleUploadCancel}
                fileName={uploadFileName}
                error={uploadError}
            />

            {/* Sample */}
            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-sample">
                <h2 className="font-semibold text-foreground">{t('products.detail.sample')}</h2>
                <Separator />
                <SampleManager
                    product={product}
                    onUpdateSample={handleSampleUpload}
                    onRemoveSample={() => removeProductSample(id)}
                    loading={isUploading}
                    onRefresh={refresh}
                />
            </div>

            {/* Categories */}
            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-categories">
                <h2 className="font-semibold text-foreground">{t('products.detail.categories')}</h2>
                <Separator />
                <CategoriesManager
                    product={product}
                    onAttach={(ids) => attachCategories(id, ids)}
                    onDetach={(categoryId) => detachCategory(id, categoryId)}
                    loading={actionLoading}
                />
            </div>

            {/* Required Fields */}
            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-required-fields">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">{t('products.detail.requiredFields')}</h2>
                    <Button asChild variant="ghost" size="sm" className="h-8">
                        <Link to={`/admin/products/${product?.id}/edit#editRequiredFields`}>
                            <Pencil className="h-4 w-4 sm:me-2" />
                            <span className="hidden sm:inline">{t('products.actions.edit')}</span>
                        </Link>
                    </Button>
                </div>
                <Separator />
                <RequiredFieldsManager
                    product={product}
                    fieldDefinitions={fieldDefinitions}
                    onAttach={(fields) => attachRequiredFields(id, fields)}
                    onDetach={(defId) => detachRequiredField(id, defId)}
                    onLoadDefinitions={fetchFieldDefinitions}
                    loading={actionLoading}
                />
            </div>

            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-coupons">
                <h2 className="font-semibold text-foreground">{t('products.detail.coupons')}</h2>
                <Separator />

                {couponsLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : productCoupons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('products.detail.noCoupons')}</p>
                ) : (
                    <div className="space-y-2">
                        {productCoupons.map((coupon) => {
                            const couponId = getCouponId(coupon);
                            const discountType = getDiscountType(coupon);
                            const discountValue = discountType === 'PERCENTAGE'
                                ? `${coupon.discount_percentage ?? 0}%`
                                : `${coupon.discount_amount ?? 0} ${t('coupons.form.units.amount')}`;

                            return (
                                <Button
                                    key={couponId}
                                    variant="outline"
                                    className="h-auto w-full justify-between px-3 py-2"
                                    onClick={() => handleEditCoupon(coupon)}
                                    data-testid={`product-detail-coupon-${couponId}`}
                                >
                                    <div className="text-start">
                                        <p className="font-medium">{coupon.code || '—'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {discountValue}
                                            {coupon.expires_at && (
                                                <span>{` • ${t('coupons.table.expiresAt')}: ${format(new Date(coupon.expires_at), 'PPP', { locale: isRtl ? arSA : undefined })}`}</span>
                                            )}
                                        </p>
                                    </div>
                                    <Badge variant={isCouponActive(coupon) ? 'default' : 'outline'}>
                                        {isCouponActive(coupon) ? t('coupons.status.active') : t('coupons.status.inactive')}
                                    </Badge>
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>

            <ReviewManager 
                productId={product.id} 
                className="mt-6 rounded-xl border border-border p-5" 
            />

            <EditCouponDialog
                open={editCouponOpen}
                onOpenChange={(openState) => {
                    setEditCouponOpen(openState);
                    if (!openState) setSelectedCoupon(null);
                }}
                coupon={selectedCoupon}
                loading={couponLoading}
                onGenerateCode={generateCouponCode}
                onSubmitCoupon={handleUpdateCoupon}
                onSuccess={loadProductCoupons}
                products={[product]}
                productPagination={{ page: 1, pages: 1, total: 1, limit: 1 }}
                productsLoading={false}
                productSearch=""
                onProductSearchChange={() => { }}
                onProductPageChange={() => { }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteProductDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDeleteConfirm}
                loading={actionLoading}
                productTitle={product?.title}
            />
        </div>
    );
}
