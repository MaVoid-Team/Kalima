import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Folder, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import useExport from '@/hooks/useExport';
import SampleSectionDialog from '@/components/admin/samples/SampleSectionDialog';
import SampleDialog from '@/components/admin/samples/SampleDialog';
import { toast } from 'sonner';

export default function AdminSamplesPage() {
    const { t, i18n } = useTranslation('admin');
    const { sections, loading, fetchSections, createSection, updateSection, deleteSection, createSample } = useAdminSampleSections();
    const { exportData, loading: exportLoading, exportProgress } = useExport();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [exportLanguage, setExportLanguage] = useState(i18n.language?.startsWith('en') ? 'en' : 'ar');

    const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);

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
    
    // Create Sample from root 
    const handleCreateSample = async (formData, onProgress, abortSignal) => {
        const secId = formData.get('sample_section_id');
        if (!secId) return false;
        const res = await createSample(secId, formData, onProgress, abortSignal);
        if (res?.success) {
            toast.success(t('samples.sections.sampleAdded', 'Sample added successfully'));
            fetchSections();
            return true;
        }
        return false;
    };

    const handleExport = (format) => {
        exportData({
            resource: 'samples',
            format,
            lang: exportLanguage,
            rtl: exportLanguage === 'ar',
        });
    };

    return (
        <div className="space-y-6" data-testid="admin-sample-sections-page">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('samples.sections.title', 'Sample Sections')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{t('samples.sections.subtitle', 'Manage sample sections to organize your samples.')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={exportLanguage} onValueChange={setExportLanguage} dir={i18n.dir()}>
                        <SelectTrigger className="h-9 min-w-[124px]" data-testid="samples-export-language">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="ar">{t('samples.sections.exportArabic', 'Arabic')}</SelectItem>
                            <SelectItem value="en">{t('samples.sections.exportEnglish', 'English')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu dir={i18n.dir()}>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="samples-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('samples.sections.export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exportLoading} data-testid="samples-export-csv">
                                {t('samples.sections.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('xlsx')} disabled={exportLoading} data-testid="samples-export-excel">
                                {t('samples.sections.exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={() => setIsSampleDialogOpen(true)} data-testid="samples-add-button">
                        <Plus className="me-2 h-4 w-4" />
                        {t('samples.sections.addSample', 'Add Sample')}
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="sections-add-button">
                        <Plus className="me-2 h-4 w-4" />
                        {t('samples.sections.addTitle', 'Add Section')}
                    </Button>
                </div>
            </div>

            {exportLoading && exportProgress > 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>{exportProgress < 100 ? t('export.exporting', 'Exporting...') : t('export.processing', 'Processing...')}</span>
                        <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                </div>
            )}

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
                    <table className="kalima-data-table">
                        <thead>
                            <tr>
                                <th className="kalima-number ps-4 py-3 font-medium w-[40px]">#</th>
                                <th className="text-start py-3 font-medium">{t('samples.sections.table.title', 'Title')}</th>
                                <th className="text-start py-3 font-medium hidden md:table-cell">{t('samples.sections.table.description', 'Description')}</th>
                                <th className="kalima-number py-3 font-medium hidden sm:table-cell">{t('samples.sections.table.order', 'Order')}</th>
                                <th className="text-start py-3 font-medium">{t('samples.sections.table.status', 'Status')}</th>
                                <th className="kalima-actions pe-4 py-3 font-medium">{t('samples.sections.table.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((section) => (
                                <tr key={section.id}>
                                    <td className="kalima-number ps-4 py-3 text-muted-foreground">{section.id}</td>
                                    <td className="kalima-truncate py-3" title={section.title}>
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
                                    <td className="kalima-truncate py-3 text-muted-foreground hidden md:table-cell" title={section.description || undefined}>
                                        {section.description || '—'}
                                    </td>
                                    <td className="kalima-number py-3 hidden sm:table-cell">
                                        {section.sort_order}
                                    </td>
                                    <td className="py-3" data-cell="status">
                                        <Badge variant={section.active ? 'default' : 'secondary'} className="text-xs">
                                            {section.active ? (
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {t('common.active', 'Active')}</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> {t('common.inactive', 'Inactive')}</span>
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="kalima-actions pe-4 py-3">
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
                                                title={t('common.edit', 'Edit')}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => confirmDelete(section)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                title={t('common.delete', 'Delete')}
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

            <SampleDialog
                open={isSampleDialogOpen}
                onOpenChange={setIsSampleDialogOpen}
                sectionId={null} 
                sample={null}
                onCreate={handleCreateSample}
                showMediaTypeSelector
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
