import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useApiMutation from '@/hooks/useApiMutation';
import { getImageUrl, formatFileSize } from '@/lib/storeUtils';
import { getPdfViewerI18nConfig } from '@/lib/pdfViewerI18n';

/**
 * SamplePage — full-width PDF/file viewer for a single sample.
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

    return (
        <div className="flex flex-col h-screen bg-background" data-testid="sample-page">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="sm" asChild data-testid="sample-page-back-button">
                        <Link to={cameFromAdmin ? `/admin/samples` : (sample?.products?.id ? `/product/${sample.products.id}` : '/market')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate" data-testid="sample-page-filename">
                            {sample?.original_name}
                        </p>
                        {sample?.size && (
                            <p className="text-xs text-muted-foreground" data-testid="sample-page-filesize">
                                {formatFileSize(sample.size)}
                            </p>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild data-testid="sample-page-download-button">
                    <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="me-2 h-4 w-4" />
                        {t('samplePage.download')}
                    </a>
                </Button>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-hidden" data-testid="sample-page-viewer">
                {isPdf ? (
                    <PDFViewer
                        config={{
                            src: fileUrl,
                            theme: { preference: 'system' },
                            i18n: viewerI18n,
                            dir: i18n.dir(),
                            disabledCategories: ['annotation', 'redaction'],
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : (
                    /* Word / other — prompt download */
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                        <p className="text-sm">{t('samplePage.previewUnavailable')}</p>
                        <Button asChild data-testid="sample-page-download-fallback-button">
                            <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="me-2 h-4 w-4" />
                                {t('samplePage.downloadFile')}
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
