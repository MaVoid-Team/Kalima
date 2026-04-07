import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, FileText, Trash2, Download, ExternalLink, Eye, Image, Video, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import DownloadWithProgress from '@/components/ui/DownloadWithProgress';
import { useAdminSampleSections } from '@/hooks/admin/useAdminSampleSections';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/storeUtils';

export default function AdminSampleSectionDetailPage() {
    const { id } = useParams();
    const { t } = useTranslation('admin');
    const { getSection, deleteSample, loading } = useAdminSampleSections();

    const [section, setSection] = useState(null);
    const [fetching, setFetching] = useState(true);

    const loadSection = async () => {
        setFetching(true);
        const data = await getSection(id);
        if (data) setSection(data);
        setFetching(false);
    };

    useEffect(() => {
        loadSection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleRemoveSample = async (sampleId) => {
        const res = await deleteSample(id, sampleId);
        if (res?.success) {
            toast.success(t('samples.sections.sampleRemoved', 'Sample removed successfully'));
            loadSection();
        }
    };

    const getIconForType = (mediaType) => {
        const mt = mediaType?.toLowerCase();
        if (mt === 'video') return <Video className="h-5 w-5 text-blue-500" />;
        if (mt === 'audio') return <FileAudio className="h-5 w-5 text-orange-500" />;
        if (mt === 'image') return <Image className="h-5 w-5 text-green-500" />;
        return <FileText className="h-5 w-5 text-primary" />;
    };

    if (fetching) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-10 w-10 opacity-40 mb-2" />
                <p>{t('samples.sections.notFound', 'Sample section not found.')}</p>
                <Button variant="link" asChild className="mt-4">
                    <Link to="/admin/samples">{t('samples.sections.backToSections', 'Back to Sections')}</Link>
                </Button>
            </div>
        );
    }

    const { samples = [] } = section;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="-ms-2">
                            <Link to="/admin/samples">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight" dir="auto">{section.title}</h1>
                    </div>
                    {section.description && (
                        <p className="text-muted-foreground text-sm ps-10" dir="auto">{section.description}</p>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                {samples.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <FileText className="h-10 w-10 opacity-30 mb-2" />
                        <p>{t('samples.sections.noSamplesNested', 'No samples are nested in this section yet.')}</p>
                        <p className="text-sm mt-1">{t('samples.sections.addFromProduct', 'You can add samples to this section from the Product details page.')}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="text-start ps-4 py-3 font-medium">{t('samples.table.file', 'Sample File')}</th>
                                <th className="text-start py-3 font-medium">{t('samples.table.productId', 'Product ID')}</th>
                                <th className="text-start py-3 font-medium hidden sm:table-cell">{t('samples.table.mediaType', 'Media Type')}</th>
                                <th className="text-end pe-4 py-3 font-medium">{t('common.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {samples.map((sample) => {
                                const apiUrl = import.meta.env.VITE_API_URL || '/api/v2';
                                const previewUrl = `${apiUrl}/sample-sections/${id}/samples/${sample.id}/preview`;
                                const downloadUrl = `${apiUrl}/sample-sections/${id}/samples/${sample.id}/download`;

                                return (
                                    <tr key={sample.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="ps-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {getIconForType(sample.media_type)}
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{t('samples.count')} #{sample.id}</span>
                                                    <div className="text-xs text-muted-foreground flex gap-2">
                                                        {sample.high_quality_url && <span>{t('samples.hq')}: {formatFileSize(sample.high_quality_size || 0)}</span>}
                                                        {sample.low_quality_url && <span>{t('samples.lq')}: {formatFileSize(sample.low_quality_size || 0)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <Link to={`/admin/products/${sample.product_id}`} className="text-primary hover:underline">
                                                {t('samples.table.product', 'Product')} #{sample.product_id}
                                            </Link>
                                        </td>
                                        <td className="py-3 hidden sm:table-cell">
                                            <Badge variant="outline">
                                                {t(`samples.mediaTypes.${sample.media_type}`, sample.media_type)}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View sample details page */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title={t('samples.view', 'View Sample')}
                                                    data-testid={`admin-sample-view-${sample.id}`}
                                                >
                                                    <Link
                                                        to={`/samples/${sample.id}`}
                                                        state={{ cameFromAdmin: true }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {/* Full-screen preview (opens in-app preview page) */}
                                                {sample.high_quality_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title={t('samples.view', 'Full Preview')}
                                                        data-testid={`admin-sample-preview-${sample.id}`}
                                                    >
                                                        <Link
                                                            to={`/samples/${sample.id}/preview`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}

                                                {/* Download LQ — still a direct anchor */}
                                                {sample.low_quality_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title={t('samples.download', 'Download LQ')}
                                                        data-testid={`admin-sample-download-${sample.id}`}
                                                    >
                                                        <a href={downloadUrl} download>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveSample(sample.id)}
                                                    className="text-destructive hover:bg-destructive/10"
                                                    title={t('common.delete', 'Remove Sample')}
                                                    disabled={loading}
                                                    data-testid={`admin-sample-delete-${sample.id}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
