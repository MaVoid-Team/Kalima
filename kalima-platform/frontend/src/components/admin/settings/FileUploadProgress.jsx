import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FileUploadProgress({ 
    progress, 
    isUploading, 
    onCancel, 
    fileName, 
    error 
}) {
    const { t } = useTranslation('admin');
    
    if (!isUploading && !error) return null;
    
    return (
        <Card className="mt-4">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {error ? (
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : isUploading ? (
                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate">
                                {fileName || t('settings.upload.file', 'File')}
                            </span>
                        </div>
                        {isUploading && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onCancel}
                                disabled={!isUploading}
                                className="shrink-0"
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t('common.cancel')}
                            </Button>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Progress value={progress} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                                {t('settings.upload.progress', { progress: Math.round(progress) })}
                            </span>
                            {error && (
                                <span className="text-destructive">
                                    {error}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                            {t('settings.upload.error', 'Upload failed')}: {error}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
