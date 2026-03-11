import { useState } from 'react';
import axios from 'axios';
import { Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function DownloadWithProgress({ url, filename, variant = 'outline', className, children, ...props }) {
    const { t } = useTranslation('common');
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [abortController, setAbortController] = useState(null);

    const handleDownload = async () => {
        if (!url) return;
        
        try {
            setDownloading(true);
            setProgress(0);
            
            const controller = new AbortController();
            setAbortController(controller);

            const response = await axios({
                url,
                method: 'GET',
                responseType: 'blob', // Important for file download
                signal: controller.signal,
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                },
            });

            // Create blob link to download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename || url.split('/').pop() || 'download'); // default filename
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            setDownloading(false);
            setAbortController(null);
            setProgress(0);
        } catch (error) {
            if (axios.isCancel(error)) {
                // Cancelled
            } else {
                toast.error(t('downloadFailed', 'Download failed. Please try again.'));
            }
            setDownloading(false);
            setAbortController(null);
            setProgress(0);
        }
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        if (abortController) {
            abortController.abort();
        }
    };

    if (downloading) {
        return (
            <div className={`flex flex-col gap-1 w-full ${className}`}>
                <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                    <span>{progress}%</span>
                    <button type="button" onClick={handleCancel} className="p-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                    </button>
                </div>
                <Progress value={progress} className="h-1 w-full" />
            </div>
        );
    }

    return (
        <Button variant={variant} className={className} onClick={handleDownload} {...props}>
            {children || <><Download className="me-2 h-4 w-4" /> Download</>}
        </Button>
    );
}
