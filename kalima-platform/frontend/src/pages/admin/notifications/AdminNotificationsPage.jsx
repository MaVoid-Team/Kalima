import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_COLORS, NOTIFICATION_CATEGORIES, useNotifications } from '@/contexts/NotificationsContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Users, User, UserCheck, Calendar, Filter, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Activity } from 'lucide-react';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

const MESSAGE_KEYS = [
    'SYSTEM_ANNOUNCEMENT',
    'ACCOUNT_UPDATE',
    'CUSTOM',
    'ORDER_STATUS_RECEIVED',
    'ORDER_STATUS_CONFIRMED',
    'ORDER_STATUS_RETURNED'
];

const TARGET_TYPES = {
    INDIVIDUAL: 'individual',
    ROLE: 'role'
};

export default function AdminNotificationsPage() {
    const { t, i18n } = useTranslation('notifications');
    const { adminListAllNotifications, adminSendNotification } = useNotifications();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // New notification form
    const [targetType, setTargetType] = useState(TARGET_TYPES.INDIVIDUAL);
    const [targetIds, setTargetIds] = useState('');
    const [targetRole, setTargetRole] = useState('Student');
    const [category, setCategory] = useState(10);
    const [messageKey, setMessageKey] = useState('SYSTEM_ANNOUNCEMENT');

    const dateLocale = i18n.language === 'ar' ? ar : enUS;

    const fetchNotifications = async (pageNum = 1, append = false) => {
        setLoading(true);
        try {
            const { data } = await adminListAllNotifications({ page: pageNum, limit: 20 });
            if (append) {
                setNotifications(prev => [...prev, ...data.notifications]);
            } else {
                setNotifications(data.notifications);
            }
            setHasMore(data.pagination.page < data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch admin notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSendNotification = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const payload = {
                category,
                message_key: messageKey,
            };

            if (targetType === TARGET_TYPES.INDIVIDUAL) {
                payload.user_ids = targetIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                if (payload.user_ids.length === 0) {
                    toast.error(t('admin.invalid_user_ids', 'Please enter valid User IDs'));
                    setSending(false);
                    return;
                }
            } else {
                payload.role = targetRole;
            }

            await adminSendNotification(payload);
            toast.success(t('admin.send_success'));
            fetchNotifications(1, false);
            
            // Reset form
            setTargetIds('');
        } catch (error) {
            console.error('Failed to send notification:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Bell className="h-10 w-10 text-primary" />
                        </div>
                        {t('admin.mass_notifications')}
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {t('admin.manage_desc', 'Manage and send system-wide notifications')}
                    </p>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Send Notification Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            {t('admin.send_notification')}
                        </h2>
                        
                        <form onSubmit={handleSendNotification} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.target_type', 'Target Type')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={targetType === TARGET_TYPES.INDIVIDUAL ? 'default' : 'outline'}
                                        onClick={() => setTargetType(TARGET_TYPES.INDIVIDUAL)}
                                        className="h-12 rounded-xl font-bold"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        {t('admin.target_user')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={targetType === TARGET_TYPES.ROLE ? 'default' : 'outline'}
                                        onClick={() => setTargetType(TARGET_TYPES.ROLE)}
                                        className="h-12 rounded-xl font-bold"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        {t('admin.target_role')}
                                    </Button>
                                </div>
                            </div>

                            {targetType === TARGET_TYPES.INDIVIDUAL ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.select_users')}</label>
                                    <Input 
                                        placeholder={t('admin.userIdsPlaceholder')}
                                        value={targetIds}
                                        onChange={(e) => setTargetIds(e.target.value)}
                                        className="h-12 rounded-xl border-border bg-muted/30 font-medium"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-medium">{t('admin.commaSeparatedIds')}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.target_role')}</label>
                                    <Select value={targetRole} onValueChange={setTargetRole}>
                                        <SelectTrigger className="h-12 w-full min-w-0 rounded-xl border-border bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Student">{t('admin.roles.Student', 'Student')}</SelectItem>
                                            <SelectItem value="Teacher">{t('admin.roles.Teacher', 'Teacher')}</SelectItem>
                                            <SelectItem value="Parent">{t('admin.roles.Parent', 'Parent')}</SelectItem>
                                            <SelectItem value="Moderator">{t('admin.roles.Moderator', 'Moderator')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="min-w-0 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.category')}</label>
                                    <Select value={category.toString()} onValueChange={(v) => setCategory(parseInt(v))}>
                                        <SelectTrigger className="h-12 w-full min-w-0 rounded-xl border-border bg-muted/30 font-bold">
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
                                <div className="min-w-0 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.message_key')}</label>
                                    <Select value={messageKey} onValueChange={setMessageKey}>
                                        <SelectTrigger className="h-12 w-full min-w-0 rounded-xl border-border bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-w-[min(22rem,calc(100vw-2rem))] rounded-xl">
                                            {MESSAGE_KEYS.map((key) => (
                                                <SelectItem key={key} value={key} className="whitespace-normal break-words">
                                                    {t(`keys.${key}`, key)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20"
                                disabled={sending}
                                loading={sending}
                            >
                                <Send className="h-5 w-5 mr-2" />
                                {t('admin.send_notification')}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Notifications History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                {t('admin.recent_activity', 'Recent Activity')}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => fetchNotifications(1, false)} className="h-8 font-bold">
                                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                                {t('common.refresh', 'Refresh')}
                            </Button>

                        </div>

                        <div className="divide-y divide-border/50">
                            {loading && page === 1 ? (
                                <div className="p-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-bold">{t('admin.no_history', 'No notifications sent yet')}</p>
                                </div>

                            ) : (
                                notifications.map((notification) => (
                                    <div key={notification.id} className="p-6 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div 
                                                    className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" 
                                                    style={{ backgroundColor: CATEGORY_COLORS[notification.category] || CATEGORY_COLORS[10] }}
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted" style={{ color: CATEGORY_COLORS[notification.category] }}>
                                                            {t(`categories.${notification.category}`)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                            {t('admin.notification_id', 'ID')}: #{notification.id}
                                                        </span>
                                                    </div>
                                                    <p className="text-base font-semibold text-foreground">
                                                        {t(`keys.${notification.message_key}`, notification.message_key)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                            {notification.user_id ? (
                                                                <>
                                                                    <User className="h-3 w-3" />
                                                                    {t('admin.user_label', 'User')}: {notification.user?.name || notification.user_id}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Users className="h-3 w-3" />
                                                                    {t('admin.role_label', 'Role')}: {t(`admin.roles.${notification.role}`, notification.role)}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                            <CheckCircle2 className={cn("h-3 w-3", notification.is_read ? "text-green-500" : "text-muted-foreground/30")} />
                                                            {notification.is_read ? t('admin.read', 'Read') : t('admin.unread', 'Unread')}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs font-black text-muted-foreground uppercase">
                                                    {format(new Date(notification.created_at), 'MMM d, yyyy', { locale: dateLocale })}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground/50 mt-1 uppercase">
                                                    {format(new Date(notification.created_at), 'p', { locale: dateLocale })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {hasMore && (
                            <div className="p-6 border-t border-border flex justify-center bg-muted/10">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl font-bold"
                                    onClick={() => {
                                        const nextPage = page + 1;
                                        setPage(nextPage);
                                        fetchNotifications(nextPage, true);
                                    }}
                                    loading={loading}
                                >
                                    {t('admin.load_more', 'Load More Activity')}
                                </Button>
                            </div>

                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
