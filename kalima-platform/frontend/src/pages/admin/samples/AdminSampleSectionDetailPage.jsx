import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminSampleSections } from '@/hooks/admin/useAdminSampleSections';
import { toast } from 'sonner';

// Extracted Components
import SampleTable from '@/components/admin/samples/SampleTable';
import SampleDialog from '@/components/admin/samples/SampleDialog';

export default function AdminSampleSectionDetailPage() {
    const { id } = useParams();
    const { t } = useTranslation('admin');
    const { getSection, createSample, updateSample, deleteSample, loading } = useAdminSampleSections();

    const [section, setSection] = useState(null);
    const [fetching, setFetching] = useState(true);

    // Modal state
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSample, setEditingSample] = useState(null);

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

    const handleOpenCreate = () => {
        setEditingSample(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (sample) => {
        setEditingSample(sample);
        setOpenDialog(true);
    };

    const handleCreateSample = async (formData, onProgress, abortSignal) => {
        const res = await createSample(id, formData, onProgress, abortSignal);
        if (res?.success) {
            toast.success(t('samples.sections.sampleAdded', 'Sample added successfully'));
            loadSection();
            return true;
        }
        return false;
    };

    const handleUpdateSample = async (sampleId, formData, onProgress, abortSignal) => {
        const res = await updateSample(id, sampleId, formData, onProgress, abortSignal);
        if (res?.success) {
            toast.success(t('samples.sections.sampleUpdated', 'Sample updated successfully'));
            loadSection();
            return true;
        }
        return false;
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
            {/* Header */}
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
                <Button onClick={handleOpenCreate} data-testid="admin-samples-add-button">
                    <Plus className="h-4 w-4 me-2" />
                    {t('samples.sections.addSample', 'Add Sample')}
                </Button>
            </div>

            {/* Content Table */}
            <SampleTable
                samples={samples}
                sectionId={id}
                onEdit={handleOpenEdit}
                onDelete={handleRemoveSample}
                loading={loading}
            />

            {/* Modal */}
            <SampleDialog
                key={editingSample ? `edit-${editingSample.id}` : 'create'}
                open={openDialog}
                onOpenChange={setOpenDialog}
                sectionId={id}
                sample={editingSample}
                onCreate={handleCreateSample}
                onUpdate={handleUpdateSample}
                showMediaTypeSelector
            />
        </div>
    );
}

