import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Upload, Download, ExternalLink, Link2, Check, Trash2, Eye, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { getImageUrl, formatFileSize } from '@/lib/storeUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PDF_MIME_TYPE = 'application/pdf';

export default function SampleManager({ product, onUpdateSample, onRemoveSample, loading }) {
    const { t } = useTranslation('admin');
    const [copied, setCopied] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const sample = product?.samples;
    const sampleUrl = sample ? getImageUrl(sample.url) : null;
    const isPdf = sample?.mime_type === PDF_MIME_TYPE;

    const shareLink = sample ? `${window.location.origin}/samples/${sample.id}` : null;

    const handleCopyShareLink = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            toast.success(t('products.detail.shareLinkCopied', 'Share link copied to clipboard!'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers without clipboard API
            const el = document.createElement('textarea');
            el.value = shareLink;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            toast.success(t('products.detail.shareLinkCopied', 'Share link copied to clipboard!'));
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setUploading(false);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error(t('products.detail.invalidSampleType', 'Invalid file type. Please upload a PDF or Word document.'));
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('sample', file);

        // Create abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setUploading(true);
        setUploadProgress(0);
        try {
            await onUpdateSample(product.id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            toast.success(t('products.detail.sampleUpdated', 'Sample updated successfully!'));
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error(t('products.detail.sampleUpdateError', 'Failed to update sample. Please try again.'));
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
            abortControllerRef.current = null;
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveSample = async () => {
        try {
            await onRemoveSample(product.id);
            toast.success(t('products.detail.sampleRemoved', 'Sample removed successfully!'));
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error(t('products.detail.sampleRemoveError', 'Failed to remove sample. Please try again.'));
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    if (!sample) {
        return (
            <div className="space-y-4">
                {/* Empty state */}
                <div
                    className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground"
                    data-testid="sample-manager-empty"
                >
                    <FileText className="h-10 w-10 opacity-40" />
                    <p className="text-sm max-w-sm">{t('products.detail.noSampleAvailable', 'No sample file available for this product. Upload a PDF or Word document to provide a preview.')}</p>
                </div>

                {/* Upload button */}
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadClick}
                        disabled={loading || uploading}
                        data-testid="sample-manager-upload-button"
                    >
                        <Upload className="me-2 h-4 w-4" />
                        {uploading ? t('products.detail.uploading', 'Uploading...') : t('products.detail.uploadSample', 'Upload Sample')}
                    </Button>
                </div>

                {/* Upload progress */}
                {uploading && uploadProgress > 0 && (
                    <div className="max-w-xs mx-auto space-y-2">
                        <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                            <span>{uploadProgress < 100 ? t('products.detail.uploading', 'Uploading...') : t('products.detail.processing', 'Processing...')}</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelUpload}
                                className="text-xs"
                            >
                                <X className="me-1 h-3 w-3" />
                                {t('common.cancel', 'Cancel')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="sample-manager-file-input"
                />
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

            {/* Quick share link display */}
            {shareLink && (
                <div className="space-y-2" data-testid="sample-manager-share-section">
                    {/* Share link header */}
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Link2 className="h-4 w-4" />
                        <span>{t('products.detail.shareLink', 'Share Link')}</span>
                    </div>
                    
                    {/* Share link input and copy button */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm">
                            {/* Link icon */}
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                                <Link2 className="h-4 w-4" />
                            </div>
                            
                            {/* URL display */}
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-sm text-foreground break-all bg-muted/50 rounded px-2 py-1 border border-border/50">
                                    {shareLink}
                                </div>
                            </div>
                            
                            {/* Copy button */}
                            <Button
                                type="button"
                                variant={copied ? "default" : "outline"}
                                size="sm"
                                onClick={handleCopyShareLink}
                                disabled={copied}
                                className={cn(
                                    "shrink-0 transition-all duration-200",
                                    copied 
                                        ? "bg-green-500 text-white border-green-500 hover:bg-green-600" 
                                        : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                )}
                                data-testid="sample-manager-copy-link-button"
                            >
                                {copied ? (
                                    <>
                                        <Check className="me-1 h-4 w-4" />
                                        <span className="hidden sm:inline">{t('products.detail.copied', 'Copied!')}</span>
                                        <span className="sm:hidden">{t('common.done', 'Done')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="me-1 h-4 w-4" />
                                        <span className="hidden sm:inline">{t('products.detail.copyLink', 'Copy')}</span>
                                        <span className="sm:hidden">{t('common.copy', 'Copy')}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        
                        {/* Success feedback overlay */}
                        {copied && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-500/10 border border-green-500/30 pointer-events-none">
                                <div className="flex items-center gap-2 text-green-700 bg-white rounded-full px-3 py-1 shadow-sm">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-medium">{t('products.detail.linkCopied', 'Link copied!')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Share instructions */}
                    <p className="text-xs text-muted-foreground">
                        {t('products.detail.shareInstructions', 'Share this link with customers to let them preview the sample before purchasing.')}
                    </p>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Preview button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid="sample-manager-preview-button"
                >
                    <Link to={`/samples/${sample.id}/preview`} target="_blank" rel="noopener noreferrer">
                        <Eye className="me-2 h-4 w-4" />
                        {t('products.detail.previewSample')}
                    </Link>
                </Button>

                {/* Sample page link */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid="sample-manager-page-link-button"
                >
                    <Link to={`/samples/${sample.id}`} state={{ cameFromAdmin: false }}>
                        <ExternalLink className="me-2 h-4 w-4" />
                        {t('products.detail.openSamplePage')}
                    </Link>
                </Button>

                {/* Download button */}
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

                {/* Replace button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    disabled={loading || uploading}
                    data-testid="sample-manager-replace-button"
                >
                    <Upload className="me-2 h-4 w-4" />
                    {uploading ? t('products.detail.uploading', 'Uploading...') : t('products.detail.replaceSample', 'Replace Sample')}
                </Button>

                {/* Remove button */}
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                    data-testid="sample-manager-remove-button"
                >
                    <Trash2 className="me-2 h-4 w-4" />
                    {t('products.detail.removeSample')}
                </Button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="sample-manager-file-input"
            />

            {/* Upload progress for existing sample replacement */}
            {uploading && uploadProgress > 0 && (
                <div className="max-w-xs mx-auto space-y-2">
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>{uploadProgress < 100 ? t('products.detail.uploading', 'Uploading...') : t('products.detail.processing', 'Processing...')}</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelUpload}
                            className="text-xs"
                        >
                            <X className="me-1 h-3 w-3" />
                            {t('common.cancel', 'Cancel')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {t('products.detail.confirmRemoveSampleTitle', 'Remove Sample')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('products.detail.confirmRemoveSampleDescription', 'Are you sure you want to remove this sample file? This action cannot be undone and will permanently delete the sample from this product.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>
                            {t('common.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveSample}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? t('common.removing', 'Removing...') : t('products.detail.removeSample', 'Remove Sample')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
