import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Package, Pencil, Trash2 } from 'lucide-react';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { formatCurrency } from '@/lib/storeUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import EditProductDialog from '@/components/admin/products/EditProductDialog';
import DeleteProductDialog from '@/components/admin/products/DeleteProductDialog';
import ThumbnailManager from '@/components/admin/products/ThumbnailManager';
import GalleryManager from '@/components/admin/products/GalleryManager';
import CategoriesManager from '@/components/admin/products/CategoriesManager';
import RequiredFieldsManager from '@/components/admin/products/RequiredFieldsManager';
import SampleManager from '@/components/admin/products/SampleManager';

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
        updateProduct,
        deleteProduct,
        uploadThumbnail,
        removeThumbnail,
        addGalleryImages,
        updateGalleryEntry,
        removeGalleryEntry,
        attachCategories,
        detachCategory,
        attachRequiredFields,
        detachRequiredField,
    } = useAdminProducts();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const refresh = useCallback(() => {
        fetchProductById(id);
    }, [fetchProductById, id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleDelete = () => {
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const res = await deleteProduct(id);
        if (res?.success) navigate('/admin/products');
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

    return (
        <div className="space-y-6 no-scrollbar" data-testid="product-detail-page">
            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/admin/products" className="hover:text-foreground transition-colors flex items-center gap-1" data-testid="product-detail-back-link">
                    {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditOpen(true)}
                        data-testid="product-detail-edit-button"
                    >
                        <Pencil className="me-2 h-4 w-4" />
                        {t('products.actions.edit')}
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
                                {product.perks.split(',').map((perk, i) => (
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
                        onUpload={(formData) => uploadThumbnail(id, formData)}
                        onRemove={() => removeThumbnail(id)}
                        loading={actionLoading}
                    />
                </div>

                <Separator />

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('products.detail.gallery')}</h3>
                    <GalleryManager
                        product={product}
                        onAddImages={(formData) => addGalleryImages(id, formData)}
                        onUpdateEntry={(galleryId, data) => updateGalleryEntry(id, galleryId, data)}
                        onRemoveEntry={(galleryId) => removeGalleryEntry(id, galleryId)}
                        loading={actionLoading}
                    />
                </div>
            </div>

            {/* Sample */}
            <div className="rounded-xl border border-border p-5 space-y-3" data-testid="product-detail-sample">
                <h2 className="font-semibold text-foreground">{t('products.detail.sample')}</h2>
                <Separator />
                <SampleManager product={product} />
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
                <h2 className="font-semibold text-foreground">{t('products.detail.requiredFields')}</h2>
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

            {/* Edit Dialog */}
            <EditProductDialog
                product={product}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={refresh}
                fieldDefinitions={fieldDefinitions}
                onLoadDefinitions={fetchFieldDefinitions}
                onAttachField={(productId, fields) => attachRequiredFields(productId, fields)}
                onDetachField={(productId, fieldDefinitionId) => detachRequiredField(productId, fieldDefinitionId)}
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
