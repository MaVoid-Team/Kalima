import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const getLocationSchema = (t) => z.object({
    location_name: z.string().min(1, t('profile.validation.locationNameRequired', 'Location name is required')).max(255),
    location_type: z.enum(['School', 'Center']).optional(),
});

export default function TeachingLocationDialog({ open, onOpenChange, location, onSave, loading }) {
    const { t } = useTranslation('teacher');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(getLocationSchema(t)),
        defaultValues: { location_type: 'School', location_name: '' }
    });

    useEffect(() => {
        if (open) {
            reset({
                location_name: location?.location_name || '',
                location_type: location?.location_type || 'School'
            });
        }
    }, [open, location, reset]);

    const locationType = watch('location_type');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {location ? t('profile.editLocation', 'Edit Location') : t('profile.addLocation', 'Add Location')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <div>
                        <Label htmlFor="location_name">{t('profile.locationName', 'Location Name')} *</Label>
                        <Input id="location_name" {...register('location_name')} placeholder={t('profile.locationPlaceholder', 'e.g. Al-Azhar School')} className="mt-1" />
                        {errors.location_name && <p className="text-xs text-destructive mt-1">{errors.location_name.message}</p>}
                    </div>
                    <div>
                        <Label>{t('profile.locationTypeLabel', 'Type')}</Label>
                        <Select value={locationType} onValueChange={(v) => setValue('location_type', v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('profile.selectType', 'Select type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="School">{t('profile.locationType.school', 'School')}</SelectItem>
                                <SelectItem value="Center">{t('profile.locationType.center', 'Center')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Cancel')}</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                            {location ? t('common.update', 'Update') : t('common.add', 'Add')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


