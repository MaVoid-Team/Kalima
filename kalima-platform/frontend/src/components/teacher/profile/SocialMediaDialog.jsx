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

const socialSchema = z.object({
    url: z.string().url('Must be a valid URL').max(1024),
});

export default function SocialMediaDialog({ open, onOpenChange, link, onSave, loading }) {
    const { t } = useTranslation('teacher');

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(socialSchema),
        defaultValues: { url: '' }
    });

    useEffect(() => {
        if (open) {
            reset({ url: link?.url || '' });
        }
    }, [open, link, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {link ? t('profile.editLink', 'Edit Link') : t('profile.addSocialMedia', 'Add Social Media')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <div>
                        <Label htmlFor="url">{t('profile.url', 'URL')} *</Label>
                        <Input id="url" {...register('url')} placeholder="https://facebook.com/yourpage" className="mt-1" dir="ltr" />
                        {errors.url && <p className="text-xs text-destructive mt-1">{errors.url.message}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Cancel')}</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                            {link ? t('common.update', 'Update') : t('common.add', 'Add')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


