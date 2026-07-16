import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SampleSectionDialog({ open, onOpenChange, section, onSubmit, loading }) {
    const { t } = useTranslation('admin');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sort_order: 0,
        active: true,
    });

    useEffect(() => {
        if (section) {
            setFormData({
                title: section.title || '',
                description: section.description || '',
                sort_order: section.sort_order || 0,
                active: section.active !== undefined ? section.active : true,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                sort_order: 0,
                active: true,
            });
        }
    }, [section, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            sort_order: Number(formData.sort_order),
            active: Boolean(formData.active),
        };
        await onSubmit(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {section ? t('samples.sections.editTitle', 'Edit Section') : t('samples.sections.addTitle', 'Add Section')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('samples.sections.titleLabel', 'Title')}</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            dir="auto"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('samples.sections.descriptionLabel', 'Description')}</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            dir="auto"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('samples.sections.sortOrderLabel', 'Sort Order')}</Label>
                        <Input
                            id="sort_order"
                            data-testid="sample-section-sort-order-input"
                            type="number"
                            min="0"
                            value={formData.sort_order}
                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="active">{t('samples.sections.activeLabel', 'Active')}</Label>
                        <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={loading || !formData.title.trim()}>
                            {loading ? '...' : t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
