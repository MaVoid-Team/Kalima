import { useState, useEffect, useRef } from 'react';
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
import { Upload, X, ImageIcon } from 'lucide-react';

export default function SampleSectionDialog({ open, onOpenChange, section, onSubmit, loading }) {
    const { t } = useTranslation('admin');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sort_order: 0,
        active: true,
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (section) {
            setFormData({
                title: section.title || '',
                description: section.description || '',
                sort_order: section.sort_order || 0,
                active: section.active !== undefined ? section.active : true,
            });
            setThumbnailPreview(section.thumbnail_url || null);
        } else {
            setFormData({
                title: '',
                description: '',
                sort_order: 0,
                active: true,
            });
            setThumbnailPreview(null);
        }
        setThumbnailFile(null);
    }, [section, open]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        submitData.append('title', formData.title);
        if (formData.description) submitData.append('description', formData.description);
        submitData.append('sort_order', formData.sort_order);
        submitData.append('active', formData.active);
        if (thumbnailFile) {
            submitData.append('thumbnail', thumbnailFile);
        }
        await onSubmit(submitData);
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
                        <Label>{t('samples.sections.thumbnailLabel', 'Thumbnail')}</Label>
                        {thumbnailPreview ? (
                            <div className="relative w-full">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full h-32 object-cover rounded-lg border border-border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 end-2 h-6 w-6"
                                    onClick={handleRemoveThumbnail}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {t('samples.sections.uploadThumbnail', 'Click to upload thumbnail')}
                                </span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                        {thumbnailPreview && !thumbnailFile && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="me-2 h-3.5 w-3.5" />
                                {t('samples.sections.changeThumbnail', 'Change thumbnail')}
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('samples.sections.sortOrderLabel', 'Sort Order')}</Label>
                        <Input
                            id="sort_order"
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
