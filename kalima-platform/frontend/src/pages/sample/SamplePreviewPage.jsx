import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useApiMutation from '@/hooks/useApiMutation';
import { getImageUrl } from '@/lib/storeUtils';
import { getPdfViewerI18nConfig } from '@/lib/pdfViewerI18n';

/**
 * SamplePreviewPage — full-screen PDF viewer for a single sample.
 * Route: /samples/:id/preview (public)
 */
export default function SamplePreviewPage() {
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
            <div className="flex min-h-screen items-center justify-center bg-background" data-testid="sample-preview-loading">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error || (!loading && !sample)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4" data-testid="sample-preview-error">
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
        <div className="flex flex-col h-screen bg-background" data-testid="sample-preview-page">

            {/* Full Screen Viewer */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/20" data-testid="sample-preview-viewer">
                {isPdf ? (
                    <div className="w-full h-full max-w-6xl">
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
                    </div>
                ) : (
                    /* Word / other — prompt download */
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                        <p className="text-sm">{t('samplePage.previewUnavailable')}</p>
                        <Button asChild data-testid="sample-preview-download-fallback-button">
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
