import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, FileVideo, Image, Upload, Trash2, X, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminSampleSections } from '@/hooks/admin/useAdminSampleSections';
import { formatFileSize } from '@/lib/storeUtils';
import DownloadWithProgress from '@/components/ui/DownloadWithProgress';

const getAccept = (mediaType) => {
    switch (mediaType) {
        case 'video': return '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';
        case 'image': return '.jpg,.jpeg,.png,.webp,.gif,.svg,image/*';
        case 'pdf': return '.pdf,application/pdf';
        case 'word': return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'powerpoint': return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
        default:
            return '*/*';
    }
};

// Helper: is this media type displayable inline?
const isPreviewable = (mediaType) => mediaType === 'image' || mediaType === 'video';

// Helper: icon for media type
const MediaIcon = ({ mediaType, className }) => {
    if (mediaType === 'video') return <FileVideo className={className} />;
    if (mediaType === 'image') return <Image className={className} />;
    return <FileText className={className} />;
};

export default function SampleManager({ product, loading, onRefresh }) {
    const { t } = useTranslation('admin');
    const { sections, fetchSections, createSample, deleteSample } = useAdminSampleSections();

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [sectionId, setSectionId] = useState('');
    const [mediaType, setMediaType] = useState('pdf');

    // We can only have one sample per product currently, but it might be tied to a section.
    // Let's assume the backend now populates `product.sample` as an object { id, section_id, media_type, high_quality_url, low_quality_url, sizes, ... }
    const sample = product?.sample || product?.samples;

    const apiUrl = import.meta.env.VITE_API_URL || '/api/v2';
    const previewUrl = sample ? `${apiUrl}/sample-sections/${sample.section_id}/samples/${sample.id}/preview` : '';
    const downloadUrl = sample ? `${apiUrl}/sample-sections/${sample.section_id}/samples/${sample.id}/download` : '';

    const hqFileRef = useRef(null);
    const lqFileRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setUploading(false);
        setUploadProgress(0);
        if (hqFileRef.current) hqFileRef.current.value = '';
        if (lqFileRef.current) lqFileRef.current.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const hqFile = hqFileRef.current?.files?.[0];
        const lqFile = lqFileRef.current?.files?.[0];

        if (!sectionId) {
            toast.error(t('samples.errors.noSection', 'Please select a sample section.'));
            return;
        }
        if (!hqFile && !lqFile) {
            toast.error(t('samples.errors.noFile', 'Please select at least one file to upload.'));
            return;
        }

        const formData = new FormData();
        formData.append('product_id', product.id);
        formData.append('media_type', mediaType);
        if (hqFile) formData.append('high_quality', hqFile);
        if (lqFile) formData.append('low_quality', lqFile);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setUploading(true);
        setUploadProgress(0);
        try {
            const res = await createSample(sectionId, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);

            if (res && res.success) {
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            if (error?.name !== 'AbortError') {
                toast.error(t('samples.errors.uploadFailed', 'Failed to upload sample.'));
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
            abortControllerRef.current = null;
            if (hqFileRef.current) hqFileRef.current.value = '';
            if (lqFileRef.current) lqFileRef.current.value = '';
        }
    };

    const handleRemoveSample = async () => {
        if (!sample?.section_id || !sample?.id) return;
        try {
            const res = await deleteSample(sample.section_id, sample.id);
            if (res && res.success) {
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            toast.error(t('samples.errors.deleteFailed', 'Failed to delete sample.'));
        }
    };

    if (!sample) {
        return (
            <div className="space-y-4">
                <form onSubmit={handleUpload} className="space-y-4 max-w-lg border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-lg">{t('samples.addTitle', 'Add Sample')}</h3>

                    <div className="space-y-2">
                        <Label>{t('samples.sectionLabel', 'Sample Section')}</Label>
                        <Select value={sectionId} onValueChange={setSectionId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('samples.selectSection', 'Select a section...')} />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map(sec => (
                                    <SelectItem key={sec.id} value={String(sec.id)}>{sec.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('samples.mediaTypeLabel', 'Media Type')}</Label>
                        <Select value={mediaType} onValueChange={setMediaType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">{t('samples.mediaPdf', 'PDF')}</SelectItem>
                                <SelectItem value="image">{t('samples.mediaImage', 'Image')}</SelectItem>
                                <SelectItem value="video">{t('samples.mediaVideo', 'Video')}</SelectItem>
                                <SelectItem value="word">{t('samples.mediaWord', 'Word')}</SelectItem>
                                <SelectItem value="powerpoint">{t('samples.mediaPowerpoint', 'PowerPoint')}</SelectItem>
                            </SelectContent>
                        </Select>
                        {(mediaType === 'pdf' || mediaType === 'word' || mediaType === 'powerpoint') && (
                            <p className="text-xs text-muted-foreground">
                                {t('samples.docFormats', 'Accepted: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx) — download only')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('samples.hqFileLabel', 'High Quality File (Protected Preview)')}</Label>
                        <Input type="file" ref={hqFileRef} accept={getAccept(mediaType)} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('samples.lqFileLabel', 'Low Quality File (Downloadable)')}</Label>
                        <Input type="file" ref={lqFileRef} accept={getAccept(mediaType)} />
                    </div>

                    {uploading && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{uploadProgress < 100 ? t('common.uploading', 'Uploading...') : t('common.processing', 'Processing...')}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        {uploading && (
                            <Button type="button" variant="outline" onClick={handleCancelUpload}>
                                <X className="me-2 h-4 w-4" /> {t('common.cancel', 'Cancel')}
                            </Button>
                        )}
                        <Button type="submit" disabled={loading || uploading}>
                            <Upload className="me-2 h-4 w-4" />
                            {uploading ? t('common.uploading', 'Uploading...') : t('common.upload', 'Upload')}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    const mt = sample.media_type;

    return (
        <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden">
                {/* Inline preview for images */}
                {mt === 'image' && sample.high_quality_url && (
                    <div className="w-full max-h-64 overflow-hidden bg-muted flex items-center justify-center">
                        <img
                            src={previewUrl}
                            alt="Sample preview"
                            className="max-h-64 object-contain w-full"
                        />
                    </div>
                )}
                {/* Inline preview for videos */}
                {mt === 'video' && sample.high_quality_url && (
                    <div className="w-full bg-black">
                        <video
                            src={previewUrl}
                            controls
                            className="w-full max-h-64"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between p-4">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            <MediaIcon mediaType={mt} className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">{product.title} Sample</span>
                            <Badge variant="outline">{mt || 'Unknown'}</Badge>
                        </div>
                        {sample.section && (
                            <p className="text-sm text-muted-foreground">
                                {t('samples.inSection', 'In Section:')} {sample.section?.title}
                            </p>
                        )}
                        {/* Word/PowerPoint note */}
                        {(mt === 'pdf' || mt === 'word' || mt === 'powerpoint') && (
                            <p className="text-xs text-muted-foreground">
                                {t('samples.docDownloadOnly', 'Word and PowerPoint files are available as download only.')}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* For non-previewable types (Document, Audio), show a HQ open link */}
                        {!isPreviewable(mt) && sample.high_quality_url && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={previewUrl} target="_blank" rel="noreferrer">
                                    <Download className="me-2 h-4 w-4" /> {t('samples.open', 'Open')}
                                </a>
                            </Button>
                        )}
                        {sample.low_quality_url && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={downloadUrl} download>
                                    <Download className="me-2 h-4 w-4" /> {t('samples.lqDownload', 'LQ Download')}
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={handleRemoveSample} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
