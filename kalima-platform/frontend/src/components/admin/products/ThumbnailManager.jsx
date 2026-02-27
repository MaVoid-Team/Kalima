import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/storeUtils';

export default function ThumbnailManager({ product, onUpload, onRemove, loading }) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef(null);

    const thumbnailUrl = getImageUrl(product?.thumbnail_image?.url);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('thumbnail', file);
        onUpload(formData);
        // Reset so user can re-upload same file
        e.target.value = '';
    };

    return (
        <div className="space-y-3" data-testid="thumbnail-manager">
            {/* Preview */}
            <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg border border-border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt={product?.title}
                            className="w-full h-full object-cover"
                            data-testid="thumbnail-manager-preview"
                        />
                    ) : (
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                    <p className="text-sm text-muted-foreground">
                        {thumbnailUrl ? t('products.detail.replaceThumbnail') : t('products.detail.noThumbnail')}
                    </p>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        data-testid="thumbnail-manager-file-input"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="thumbnail-manager-upload-button"
                    >
                        <Upload className="me-2 h-4 w-4" />
                        {thumbnailUrl ? t('products.detail.replaceThumbnail') : t('products.detail.uploadThumbnail')}
                    </Button>

                    {thumbnailUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={loading}
                            onClick={onRemove}
                            className="text-destructive hover:text-destructive"
                            data-testid="thumbnail-manager-remove-button"
                        >
                            <Trash2 className="me-2 h-4 w-4" />
                            {t('products.detail.removeThumbnail')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
