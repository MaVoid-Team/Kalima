import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, FileText, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import useApiMutation from '@/hooks/useApiMutation';
import { getPdfViewerI18nConfig } from '@/lib/pdfViewerI18n';

/**
 * SamplePreviewPage — full-screen media viewer for a single sample.
 * Route: /samples/:id/preview  (public)
 *
 * Handles: Document (PDF/Word), Video, Audio, Image
 */
export default function SamplePreviewPage() {
    const { t, i18n } = useTranslation(['market', 'PDFViewer']);
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
                <p className="text-lg font-semibold">{t('samplePage.notFound', 'Sample not found')}</p>
                <Button variant="ghost" asChild>
                    <Link to={`/samples/${id}`}>
                        <ArrowLeft className="me-2 h-4 w-4" />
                        {t('samplePage.backToSample', 'Back to Sample')}
                    </Link>
                </Button>
            </div>
        );
    }

    const apiUrl = import.meta.env.VITE_API_URL || '/api/v2';
    const sectionId = sample?.section_id;
    const previewUrl = sectionId ? `${apiUrl}/sample-sections/${sectionId}/samples/${sample.id}/preview` : '';
    const downloadUrl = sectionId ? `${apiUrl}/sample-sections/${sectionId}/samples/${sample.id}/download` : '';

    const mediaType = sample?.media_type || 'Document';
    const isPdf = sample?.mime_type === 'application/pdf';

    return (
        <div className="flex flex-col h-screen bg-background" data-testid="sample-preview-page">

            {/* Slim top bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/80 backdrop-blur shrink-0">
                <Button variant="ghost" size="sm" asChild data-testid="sample-preview-back-button">
                    <Link to={`/samples/${id}`}>
                        <ArrowLeft className="h-4 w-4 me-1" />
                        {t('samplePage.backToSample', 'Sample Details')}
                    </Link>
                </Button>
                <span dir="auto" className="text-sm font-medium truncate text-muted-foreground flex-1">
                    {sample?.original_name}
                </span>
                {downloadUrl && (
                    <Button variant="outline" size="sm" asChild data-testid="sample-preview-download-button">
                        <a href={downloadUrl} download>
                            <Download className="h-4 w-4 me-1" />
                            {t('samplePage.download', 'Download')}
                        </a>
                    </Button>
                )}
            </div>

            {/* Full-screen viewer */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/20" data-testid="sample-preview-viewer">

                {/* Video */}
                {mediaType === 'Video' && previewUrl && (
                    <video
                        className="max-h-full max-w-full"
                        controls
                        src={previewUrl}
                        data-testid="sample-preview-video-player"
                    >
                        <track kind="captions" />
                    </video>
                )}

                {/* Audio */}
                {mediaType === 'Audio' && (
                    <div className="flex flex-col items-center justify-center gap-8 p-8">
                        <div className="h-32 w-32 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Music className="h-16 w-16 text-orange-500" />
                        </div>
                        {previewUrl && (
                            <audio
                                className="w-full max-w-lg"
                                controls
                                src={previewUrl}
                                data-testid="sample-preview-audio-player"
                            >
                                <track kind="captions" />
                            </audio>
                        )}
                    </div>
                )}

                {/* Image */}
                {mediaType === 'Image' && previewUrl && (
                    <img
                        src={previewUrl}
                        alt={sample?.original_name || 'Sample'}
                        className="max-h-full max-w-full object-contain"
                        data-testid="sample-preview-image"
                    />
                )}

                {/* PDF Document */}
                {mediaType === 'Document' && isPdf && previewUrl && (
                    <div className="w-full h-full max-w-6xl mx-auto">
                        <PDFViewer
                            config={{
                                src: previewUrl,
                                theme: { preference: 'system' },
                                i18n: viewerI18n,
                                dir: i18n.dir(),
                                disabledCategories: ['annotation', 'redaction', 'local', 'download', 'file'],
                            }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                )}

                {/* Word / unsupported — download fallback */}
                {(mediaType === 'Document' && !isPdf && !previewUrl) ||
                (mediaType === 'Video' && !previewUrl) ||
                (mediaType === 'Image' && !previewUrl) ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-8">
                        <FileText className="h-20 w-20 opacity-30" />
                        <p className="text-sm text-center">{t('samplePage.previewUnavailable', 'Preview not available.')}</p>
                        {downloadUrl && (
                            <Button asChild data-testid="sample-preview-download-fallback-button">
                                <a href={downloadUrl} download>
                                    <Download className="me-2 h-4 w-4" />
                                    {t('samplePage.downloadFile', 'Download File')}
                                </a>
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
