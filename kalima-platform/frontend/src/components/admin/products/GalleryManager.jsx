import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Eye, EyeOff, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/storeUtils';

export default function GalleryManager({ product, onAddImages, onUpdateEntry, onRemoveEntry, loading }) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef(null);

    const gallery = product?.product_gallery ?? [];

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach(f => formData.append('gallery', f));
        onAddImages(formData);
        e.target.value = '';
    };

    return (
        <div className="space-y-4" data-testid="gallery-manager">
            {/* Upload button */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                    data-testid="gallery-manager-file-input"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="gallery-manager-upload-button"
                >
                    <Upload className="me-2 h-4 w-4" />
                    {t('products.detail.addGalleryImages')}
                </Button>
            </div>

            {/* Gallery grid */}
            {gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                    <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t('products.detail.noGalleryImages')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {gallery.map((entry) => {
                        const imageUrl = getImageUrl(entry.images?.url);
                        return (
                            <div
                                key={entry.id}
                                className="relative group rounded-lg overflow-hidden border border-border"
                                data-testid={`gallery-entry-${entry.id}`}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt=""
                                        className={`w-full h-28 object-cover transition-opacity ${!entry.active ? 'opacity-40' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-28 bg-muted flex items-center justify-center">
                                        <ImageOff className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Status badge */}
                                <div className="absolute top-1 start-1">
                                    <Badge
                                        variant={entry.active ? 'default' : 'secondary'}
                                        className="text-xs px-1.5"
                                    >
                                        {entry.active ? t('products.detail.galleryImageActive') : t('products.detail.galleryImageHidden')}
                                    </Badge>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        disabled={loading}
                                        onClick={() => onUpdateEntry(entry.id, { active: !entry.active })}
                                        title={t('products.detail.toggleVisibility')}
                                        data-testid={`gallery-entry-toggle-${entry.id}`}
                                    >
                                        {entry.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-red-500/40"
                                        disabled={loading}
                                        onClick={() => onRemoveEntry(entry.id)}
                                        title={t('products.detail.removeImage')}
                                        data-testid={`gallery-entry-remove-${entry.id}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
