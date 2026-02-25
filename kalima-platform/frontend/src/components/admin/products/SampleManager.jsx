import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getImageUrl, formatFileSize } from '@/lib/storeUtils';
import SampleViewerDialog from './SampleViewerDialog';

const PDF_MIME_TYPE = 'application/pdf';

export default function SampleManager({ product }) {
    const { t } = useTranslation('admin');
    const [viewerOpen, setViewerOpen] = useState(false);

    const sample = product?.samples;
    const sampleUrl = sample ? getImageUrl(sample.url) : null;
    const isPdf = sample?.mime_type === PDF_MIME_TYPE;

    if (!sample) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground"
                data-testid="sample-manager-empty"
            >
                <FileText className="h-10 w-10 opacity-40" />
                <p className="text-sm max-w-sm">{t('products.detail.noSample')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4" data-testid="sample-manager">
            {/* File metadata row */}
            <div className="flex flex-wrap items-center gap-4 text-sm" data-testid="sample-manager-info">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium break-all">{sample.original_name}</span>
                </div>
                <Badge variant="outline" data-testid="sample-manager-type-badge">
                    {sample.mime_type === PDF_MIME_TYPE ? 'PDF' : 'Word'}
                </Badge>
                <span className="text-muted-foreground" data-testid="sample-manager-size">
                    {formatFileSize(sample.size)}
                </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {isPdf && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setViewerOpen(true)}
                        data-testid="sample-manager-view-button"
                    >
                        <Maximize2 className="me-2 h-4 w-4" />
                        {t('products.detail.viewSample')}
                    </Button>
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid="sample-manager-page-link-button"
                >
                    <Link to={`/samples/${sample.id}`}>
                        <ExternalLink className="me-2 h-4 w-4" />
                        {t('products.detail.openSamplePage')}
                    </Link>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid="sample-manager-download-button"
                >
                    <a href={sampleUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="me-2 h-4 w-4" />
                        {t('products.detail.downloadSample')}
                    </a>
                </Button>
            </div>

            {/* Inline PDF preview */}
            {isPdf && (
                <div
                    className="rounded-lg border border-border overflow-hidden"
                    style={{ height: '420px' }}
                >
                    <div className="flex-1 overflow-hidden" data-testid="sample-manager-viewer">
                        <PDFViewer
                            config={{
                                src: sampleUrl,
                                theme: { preference: 'system' },
                                disabledCategories: ['annotation', 'redaction'],
                                spread: {
                                    defaultSpreadMode: 'single'
                                }
                            }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>
            )}

            {/* Full-screen dialog */}
            {isPdf && (
                <SampleViewerDialog
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                    sampleUrl={sampleUrl}
                    sampleName={sample.original_name}
                />
            )}
        </div>
    );
}
