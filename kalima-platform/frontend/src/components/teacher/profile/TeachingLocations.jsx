import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, Pencil, School, Building2 } from 'lucide-react';
import { useTeachingLocations } from '@/hooks/useTeachingLocations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Sub-components
import TeachingLocationDialog from './TeachingLocationDialog';
import TeachingLocationDeleteDialog from './TeachingLocationDeleteDialog';

export default function TeachingLocations() {
    const { t } = useTranslation('teacher');
    const { locations, loading, fetchLocations, addLocation, updateLocation, deleteLocation } = useTeachingLocations();
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // Add/Edit flow
    const openEdit = (loc) => {
        setEditing(loc);
        setDialogOpen(true);
    };

    const openAdd = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const handleSave = async (data) => {
        const success = editing
            ? await updateLocation(editing.id, data)
            : await addLocation(data);

        if (success) {
            setDialogOpen(false);
        }
    };

    // Delete flow
    const confirmDelete = async () => {
        if (!toDelete) return;
        const success = await deleteLocation(toDelete.id);
        if (success) {
            setDeleteOpen(false);
            setToDelete(null);
        }
    };

    const openDelete = (loc) => {
        setToDelete(loc);
        setDeleteOpen(true);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('profile.teachingLocations', 'Teaching Locations')}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={openAdd} data-testid="teacher-add-location-button">
                    <Plus className="h-4 w-4 me-1" /> {t('common.add', 'Add')}
                </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        {t('profile.noLocations', 'No teaching locations added yet.')}
                    </p>
                ) : (
                    locations.map((loc) => (
                        <div key={loc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-2 min-w-0">
                                {loc.location_type === 'Center' ?
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" /> :
                                    <School className="h-4 w-4 text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate">{loc.location_name}</span>
                                {loc.location_type && (
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                        {t(`profile.locationType.${loc.location_type.toLowerCase()}`, loc.location_type)}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0 ms-2">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(loc)} data-testid={`teacher-edit-location-${loc.id}`}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openDelete(loc)} data-testid={`teacher-delete-location-${loc.id}`}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>

            {/* Dialogs */}
            <TeachingLocationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                location={editing}
                onSave={handleSave}
                loading={loading}
            />

            <TeachingLocationDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={confirmDelete}
            />
        </Card>
    );
}
