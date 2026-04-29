import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_CATEGORIES, useNotifications } from '@/contexts/NotificationsContext';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function SendNotificationModal({ open, onOpenChange, userId, entityType, entityId }) {
    const { t } = useTranslation('notifications');
    const { adminSendNotification } = useNotifications();

    const [sending, setSending] = useState(false);
    const [category, setCategory] = useState(10);
    const [messageKey, setMessageKey] = useState('CUSTOM');

    const handleSend = async () => {
        setSending(true);
        try {
            await adminSendNotification({
                user_ids: [userId],
                category,
                message_key: messageKey,
                entity_type: entityType,
                entity_id: entityId
            });
            toast.success(t('admin.send_success'));
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to send notification:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        {t('admin.send_notification')}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        Send a direct notification to this user.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.category')}</label>
                        <Select value={category.toString()} onValueChange={(v) => setCategory(parseInt(v))}>
                            <SelectTrigger className="h-12 rounded-xl border-border bg-muted/30 font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {Object.entries(NOTIFICATION_CATEGORIES).map(([key, val]) => (
                                    <SelectItem key={val} value={val.toString()}>
                                        {t(`categories.${val}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.message_key')}</label>
                        <Select value={messageKey} onValueChange={setMessageKey}>
                            <SelectTrigger className="h-12 rounded-xl border-border bg-muted/30 font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="CUSTOM">{t('keys.CUSTOM')}</SelectItem>
                                <SelectItem value="ORDER_ADMIN_NOTE">{t('keys.ORDER_ADMIN_NOTE')}</SelectItem>
                                <SelectItem value="ACCOUNT_UPDATE">{t('keys.ACCOUNT_UPDATE')}</SelectItem>
                                <SelectItem value="SYSTEM_ANNOUNCEMENT">{t('keys.SYSTEM_ANNOUNCEMENT')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleSend} 
                        className="w-full h-12 rounded-xl font-bold" 
                        disabled={sending}
                        loading={sending}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {t('admin.send_notification')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
