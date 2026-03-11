import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkIcon, Plus, Trash2, Pencil } from 'lucide-react';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Sub-components
import SocialMediaDialog from './SocialMediaDialog';
import SocialMediaDeleteDialog from './SocialMediaDeleteDialog';

export default function SocialMedia() {
    const { t } = useTranslation('teacher');
    const { links, loading, fetchSocialMedia, addLink, updateLink, deleteLink } = useSocialMedia();
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        fetchSocialMedia();
    }, [fetchSocialMedia]);

    // Add/Edit flow
    const openEdit = (link) => {
        setEditing(link);
        setDialogOpen(true);
    };

    const openAdd = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const handleSave = async (data) => {
        const success = editing
            ? await updateLink(editing.id, data)
            : await addLink(data);

        if (success) {
            setDialogOpen(false);
        }
    };

    // Delete flow
    const confirmDelete = async () => {
        if (!toDelete) return;
        const success = await deleteLink(toDelete.id);
        if (success) {
            setDeleteOpen(false);
            setToDelete(null);
        }
    };

    const openDelete = (link) => {
        setToDelete(link);
        setDeleteOpen(true);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    {t('profile.socialMedia', 'Social Media')}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={openAdd} data-testid="teacher-add-social-button">
                    <Plus className="h-4 w-4 me-1" /> {t('common.add', 'Add')}
                </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                {links.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        {t('profile.noSocialMedia', 'No social media links added yet.')}
                    </p>
                ) : (
                    links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline underline-offset-2 truncate max-w-[200px]"
                            >
                                {link.url}
                            </a>
                            <div className="flex gap-1 shrink-0 ms-2">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(link)} data-testid={`teacher-edit-social-${link.id}`}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openDelete(link)} data-testid={`teacher-delete-social-${link.id}`}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>

            {/* Dialogs */}
            <SocialMediaDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                link={editing}
                onSave={handleSave}
                loading={loading}
            />

            <SocialMediaDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={confirmDelete}
            />
        </Card>
    );
}
