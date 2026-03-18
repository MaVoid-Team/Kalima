import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Folder, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { useAdminSampleSections } from '@/hooks/admin/useAdminSampleSections';
import SampleSectionDialog from '@/components/admin/samples/SampleSectionDialog';
import { toast } from 'sonner';

export default function AdminSamplesPage() {
    const { t, i18n } = useTranslation('admin');
    const { sections, loading, fetchSections, createSection, updateSection, deleteSection } = useAdminSampleSections();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState(null);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    const handleOpenAddDialog = () => {
        setEditingSection(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (section) => {
        setEditingSection(section);
        setIsDialogOpen(true);
    };

    const handleDialogSubmit = async (data) => {
        if (editingSection) {
            await updateSection(editingSection.id, data);
        } else {
            await createSection(data);
        }
        setIsDialogOpen(false);
    };

    const confirmDelete = (section) => {
        setSectionToDelete(section);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!sectionToDelete) return;
        const res = await deleteSection(sectionToDelete.id);
        if (res?.success) {
            setDeleteOpen(false);
            setSectionToDelete(null);
        }
    };

    return (
        <div className="space-y-6" data-testid="admin-sample-sections-page">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('samples.sections.title', 'Sample Sections')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{t('samples.sections.subtitle', 'Manage sample sections to organize your samples.')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleOpenAddDialog} data-testid="sections-add-button">
                        <Plus className="me-2 h-4 w-4" />
                        {t('samples.sections.addTitle', 'Add Section')}
                    </Button>
                </div>
            </div>

            {loading && sections.length === 0 ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            ) : sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground" data-testid="admin-sections-empty">
                    <Folder className="h-10 w-10 opacity-40" />
                    <p className="text-sm">{t('samples.sections.noSections', 'No sample sections available yet.')}</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden" data-testid="admin-sections-list">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="text-start ps-4 py-3 font-medium w-[40px]">#</th>
                                <th className="text-start py-3 font-medium">{t('samples.sections.table.title', 'Title')}</th>
                                <th className="text-start py-3 font-medium hidden md:table-cell">{t('samples.sections.table.description', 'Description')}</th>
                                <th className="text-start py-3 font-medium hidden sm:table-cell">{t('samples.sections.table.order', 'Order')}</th>
                                <th className="text-start py-3 font-medium">{t('samples.sections.table.status', 'Status')}</th>
                                <th className="text-end pe-4 py-3 font-medium">{t('samples.sections.table.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sections.map((section) => (
                                <tr key={section.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="ps-4 py-3 text-muted-foreground">{section.id}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            {section.thumbnail_url ? (
                                                <img src={section.thumbnail_url} alt="" className="w-8 h-8 rounded shrink-0 object-cover" />
                                            ) : (
                                                <Folder className="h-5 w-5 text-primary shrink-0" />
                                            )}
                                            <Link
                                                to={`/admin/samples/${section.id}`}
                                                className="font-medium hover:underline max-w-[180px] block"
                                            >
                                                {section.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                                        {section.description || '—'}
                                    </td>
                                    <td className="py-3 hidden sm:table-cell">
                                        {section.sort_order}
                                    </td>
                                    <td className="py-3">
                                        <Badge variant={section.active ? 'default' : 'secondary'} className="text-xs">
                                            {section.active ? (
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {t('common.active', 'Active')}</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> {t('common.inactive', 'Inactive')}</span>
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="pe-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to={`/admin/samples/${section.id}`}>
                                                    {t('samples.sections.manageSamples', 'Samples')}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditDialog(section)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => confirmDelete(section)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <SampleSectionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                section={editingSection}
                onSubmit={handleDialogSubmit}
                loading={loading}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            {t('samples.sections.deleteConfirmTitle', 'Delete Section?')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('samples.sections.deleteConfirmDesc', 'Are you sure you want to delete this sample section? This will also remove any samples nested within it.')}
                            {sectionToDelete?.title && (
                                <span className="block mt-1 font-medium text-foreground">
                                    &ldquo;{sectionToDelete.title}&rdquo;
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? '...' : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
