import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmDeleteAccountDialog({ open, onOpenChange, onConfirm, loading, ns = 'admin' }) {
    const { t } = useTranslation(ns);
    const [confirmText, setConfirmText] = useState('');

    const expectedText = t('settings.account.deleteConfirmationText', 'Delete My Account');
    const isMatched = confirmText === expectedText;

    const handleConfirm = () => {
        if (isMatched) {
            onConfirm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setConfirmText('');
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t('settings.account.deleteTitle', 'Delete Account')}
                    </DialogTitle>
                    <DialogDescription className="space-y-3 pt-3">
                        <p className="font-semibold text-foreground">
                            {t('settings.account.deleteWarning1', 'This action cannot be undone.')}
                        </p>
                        <p>
                            {t('settings.account.deleteWarning2', 'All your data, content, and progress will be permanently deleted.')}
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="confirm-delete" className="font-normal text-muted-foreground">
                            {t('settings.account.deleteTypePrompt', 'Please type')} <span className="font-semibold text-foreground select-none">{expectedText}</span> {t('settings.account.deleteToConfirm', 'to confirm.')}
                        </Label>
                        <Input
                            id="confirm-delete"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={expectedText}
                            className="w-full"
                            style={{ userSelect: 'auto' }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleConfirm}
                        disabled={loading || !isMatched}
                    >
                        {loading ? t('common.loading', 'Loading...') : t('settings.account.deleteConfirmButton', 'Permanently Delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
