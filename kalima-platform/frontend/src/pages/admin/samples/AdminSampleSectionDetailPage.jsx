import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, FileText, Trash2, Download, ExternalLink, Image, Video, FileAudio } from 'lucide-react';
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
        switch (mediaType) {
            case 'Video': return <Video className="h-5 w-5 text-blue-500" />;
            case 'Audio': return <FileAudio className="h-5 w-5 text-orange-500" />;
            case 'Image': return <Image className="h-5 w-5 text-green-500" />;
            default: return <FileText className="h-5 w-5 text-primary" />;
        }
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
                        <h1 className="text-2xl font-bold tracking-tight">{section.title}</h1>
                    </div>
                    {section.description && (
                        <p className="text-muted-foreground text-sm ps-10">{section.description}</p>
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
                                <th className="text-start ps-4 py-3 font-medium">Sample File</th>
                                <th className="text-start py-3 font-medium">Product ID</th>
                                <th className="text-start py-3 font-medium hidden sm:table-cell">Media Type</th>
                                <th className="text-end pe-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {samples.map((sample) => (
                                <tr key={sample.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="ps-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {getIconForType(sample.media_type)}
                                            <div className="flex flex-col">
                                                <span className="font-medium">Sample #{sample.id}</span>
                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                    {sample.high_quality_url && <span>HQ: {formatFileSize(sample.high_quality_size || 0)}</span>}
                                                    {sample.low_quality_url && <span>LQ: {formatFileSize(sample.low_quality_size || 0)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <Link to={`/admin/products/${sample.product_id}`} className="text-primary hover:underline">
                                            Product #{sample.product_id}
                                        </Link>
                                    </td>
                                    <td className="py-3 hidden sm:table-cell">
                                        <Badge variant="outline">{sample.media_type}</Badge>
                                    </td>
                                    <td className="pe-4 py-3 text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            {sample.high_quality_url && (
                                                <Button variant="ghost" size="icon" asChild title="Preview HQ">
                                                    <a href={sample.high_quality_url} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            {sample.low_quality_url && (
                                                <DownloadWithProgress
                                                    url={sample.low_quality_url}
                                                    filename={`LQ_Sample_${sample.id}`}
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Download LQ"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </DownloadWithProgress>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveSample(sample.id)}
                                                className="text-destructive hover:bg-destructive/10"
                                                title="Remove Sample"
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
