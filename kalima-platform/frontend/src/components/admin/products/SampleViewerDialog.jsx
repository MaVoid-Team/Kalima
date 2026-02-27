import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function SampleViewerDialog({ open, onOpenChange, sampleUrl, sampleName }) {
    const { t } = useTranslation('admin');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0  custom-scrollbar"
                data-testid="sample-viewer-dialog"
            >
                <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
                    <DialogTitle className="text-sm font-medium truncate">
                        {sampleName ?? t('products.detail.sample')}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden" data-testid="sample-viewer-dialog-content">
                    <PDFViewer
                        config={{
                            src: sampleUrl,
                            theme: { preference: 'system' },
                            disabledCategories: ['annotation', 'redaction'],
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
