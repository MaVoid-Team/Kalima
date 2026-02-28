import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, FileText, Package, Calendar, DollarSign, ExternalLink, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useApiMutation from '@/hooks/useApiMutation';
import { getImageUrl, formatFileSize } from '@/lib/storeUtils';
import { getPdfViewerI18nConfig } from '@/lib/pdfViewerI18n';

/**
 * SamplePage — sample details with small preview box for a single sample.
 * Route: /samples/:id (public)
 */
export default function SamplePage() {
    const { t, i18n } = useTranslation(['market', 'PDFViewer']);
    const location = useLocation();
    const cameFromAdmin = Boolean(location.state?.cameFromAdmin);
    const { id } = useParams();
    const { mutate: fetchApi, loading } = useApiMutation();
    const [sample, setSample] = useState(null);
    const [error, setError] = useState(false);
    const viewerI18n = useMemo(() => getPdfViewerI18nConfig(i18n.language), [i18n.language]);

    useEffect(() => {
        if (!id) return;
        fetchApi({ endpoint: `/samples/${id}`, method: 'get' })
            .then(res => {
                if (res?.success) setSample(res.data);
                else setError(true);
            })
            .catch(() => setError(true));
    }, [id, fetchApi]);

    if (loading && !sample) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background" data-testid="sample-page-loading">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error || (!loading && !sample)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4" data-testid="sample-page-error">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-semibold">{t('samplePage.notFound')}</p>
                <Button variant="ghost" asChild>
                    <Link to="/market"><ArrowLeft className="me-2 h-4 w-4" />{t('samplePage.backToMarket')}</Link>
                </Button>
            </div>
        );
    }

    const fileUrl = getImageUrl(sample?.url);
    const isPdf = sample?.mime_type === 'application/pdf';
    const product = sample?.products;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 md:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Button variant="ghost" size="sm" asChild data-testid="sample-page-back-button">
                        <Link to={cameFromAdmin ? `/admin/samples` : (product?.id ? `/product/${product.id}` : '/market')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <span>/</span>
                    <Link to="/market" className="hover:text-foreground">{t('breadcrumbs.digitalProducts', 'Digital Products')}</Link>
                    {product && (
                        <>
                            <span>/</span>
                            <Link to={`/product/${product.id}`} className="hover:text-foreground truncate max-w-[200px]">
                                {product.title}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-foreground truncate max-w-[200px]">{sample?.original_name}</span>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Sample Preview (7 cols) */}
                    <div className="lg:col-span-7">
                        <div className="space-y-6">
                            {/* Preview Box */}
                            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-muted border flex items-center justify-center">
                                {isPdf && fileUrl ? (
                                    <div className="w-full h-full max-w-4xl">
                                        <PDFViewer
                                            config={{
                                                src: fileUrl,
                                                theme: { preference: 'system' },
                                                i18n: viewerI18n,
                                                dir: i18n.dir(),
                                                disabledCategories: ['annotation', 'redaction', 'file', 'local', 'download'],
                                            }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                ) : (
                                    /* Word / other — prompt download */
                                    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                                        <FileText className="h-16 w-16" />
                                        <p className="text-sm text-center px-4">{t('samplePage.previewUnavailable')}</p>
                                        <Button variant="outline" asChild>
                                            <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                                                <Download className="me-2 h-4 w-4" />
                                                {t('samplePage.downloadFile')}
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="default" className="flex-1" asChild>
                                    <Link to={`/samples/${id}/preview`} target="_blank" rel="noopener noreferrer">
                                        <Eye className="me-2 h-4 w-4" />
                                        {t('samplePage.fullPreview', 'Full Preview')}
                                        <ExternalLink className="me-2 h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button variant="outline" className="flex-1" asChild>
                                    <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                                        <Download className="me-2 h-4 w-4" />
                                        {t('samplePage.download')}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sample Details (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-6">
                            {/* Sample Info */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{sample?.original_name}</h1>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Badge variant="outline">
                                            {isPdf ? 'PDF' : 'Word'}
                                        </Badge>
                                        <span>{sample?.size ? formatFileSize(sample.size) : 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Sample Details */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        {t('samplePage.sampleInfo', 'Sample Information')}
                                    </h2>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                                            <span className="text-sm text-muted-foreground">{t('samplePage.fileName', 'File Name')}</span>
                                            <span className="text-sm font-medium truncate ml-2 max-w-[60%]">{sample?.original_name}</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                                            <span className="text-sm text-muted-foreground">{t('samplePage.fileSize', 'File Size')}</span>
                                            <span className="text-sm font-medium">{sample?.size ? formatFileSize(sample.size) : 'N/A'}</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                                            <span className="text-sm text-muted-foreground">{t('samplePage.fileType', 'File Type')}</span>
                                            <Badge variant="outline">
                                                {isPdf ? 'PDF' : 'Word'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                                            <span className="text-sm text-muted-foreground">{t('samplePage.uploadDate', 'Upload Date')}</span>
                                            <span className="text-sm font-medium">
                                                {sample?.created_at ? new Date(sample.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                {product && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {t('samplePage.productInfo', 'Product Information')}
                                        </h2>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm text-muted-foreground">{t('samplePage.productName', 'Product Name')}</span>
                                                <span className="text-sm font-medium truncate ml-2 max-w-[60%]">{product.title}</span>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm text-muted-foreground">{t('samplePage.productType', 'Product Type')}</span>
                                                <Badge variant="secondary">{product.type}</Badge>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm text-muted-foreground">{t('samplePage.price', 'Price')}</span>
                                                <div className="flex items-center gap-2">
                                                    {product.price_after_discount && product.price_after_discount !== product.price ? (
                                                        <>
                                                            <span className="text-sm font-medium">{product.price_after_discount} ج.م</span>
                                                            <span className="text-xs text-muted-foreground line-through">{product.price} ج.م</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-medium">{product.price} ج.م</span>
                                                    )}
                                                </div>
                                            </div>

                                            {product.serial && (
                                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                    <span className="text-sm text-muted-foreground">{t('samplePage.serial', 'Serial')}</span>
                                                    <span className="text-sm font-medium">{product.serial}</span>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button variant="default" className="w-full" asChild>
                                                    <Link to={`/product/${product.id}`}>
                                                        {t('samplePage.viewProduct', 'View Product')}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
