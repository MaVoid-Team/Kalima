import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function PaymentMethodImageUpload({
    value,
    onChange,
    onUploadProgress,
    disabled = false,
    className = '',
}) {
    const { t } = useTranslation('admin');
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(value || null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFile = useCallback((file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { error: t('paymentMethods.image.invalidType', 'Invalid file type. Please upload JPEG, PNG, or WebP images.') };
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { error: t('paymentMethods.image.tooLarge', 'File too large. Maximum size is 5MB.') };
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Call onChange with the file
        onChange(file);

        return { success: true };
    }, [onChange, t]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, [disabled, handleFile]);

    const handleFileInput = useCallback((e) => {
        if (disabled) return;

        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, [disabled, handleFile]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        onChange(null);
    }, [onChange]);

    const simulateUploadProgress = useCallback(() => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);
        return interval;
    }, []);

    return (
        <div className={`space-y-2 ${className}`}>
            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Payment method preview"
                        className="h-24 w-24 rounded-md object-cover border"
                    />
                    {!disabled && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemove}
                            data-testid="payment-method-image-remove"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !disabled && document.getElementById('payment-method-image-input')?.click()}
                    data-testid="payment-method-image-upload"
                >
                    <input
                        id="payment-method-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileInput}
                        disabled={disabled}
                        className="hidden"
                    />
                    <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                            <p>{t('paymentMethods.image.dragDrop', 'Drag & drop image here')}</p>
                            <p className="text-xs">{t('paymentMethods.image.orClick', 'or click to browse')}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('paymentMethods.image.supportedFormats', 'JPEG, PNG, WebP (max 5MB)')}
                        </p>
                    </div>
                </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t('paymentMethods.image.uploading', 'Uploading...')}</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1" />
                </div>
            )}
        </div>
    );
}
