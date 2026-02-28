import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function DeleteRequiredFieldDialog({
  open,
  onOpenChange,
  field,
  onConfirm,
  loading,
}) {
  const { t, i18n } = useTranslation('admin');

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="requiredFields-delete-dialog"
        dir={i18n.dir()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('requiredFields.delete.title')}
          </DialogTitle>
          <DialogDescription>
            {t('requiredFields.delete.description', { 
              label: field?.label || '' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">
              {t('requiredFields.delete.warning')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('requiredFields.delete.warningDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">{t('requiredFields.fields.label')}:</span> {field?.label || '-'}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t('requiredFields.fields.fieldType')}:</span> {field?.field_type || '-'}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t('requiredFields.fields.active')}:</span> {field?.active ? t('common.active') : t('common.inactive')}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            data-testid="requiredFields-delete-cancel-button"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            data-testid="requiredFields-delete-confirm-button"
          >
            {loading ? <LoadingSpinner className="h-4 w-4" /> : t('requiredFields.delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
