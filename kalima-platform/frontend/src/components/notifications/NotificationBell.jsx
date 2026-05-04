import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, CATEGORY_COLORS } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { X } from 'lucide-react';
export default function NotificationBell() {
    const { t, i18n } = useTranslation('notifications');
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading, error } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const dateLocale = i18n.language === 'ar' ? ar : enUS;

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        setIsOpen(false);

        if (notification.entity_type === 'purchase') {
            navigate(`/orders/${notification.entity_id}`);
        } else if (notification.entity_type === 'user') {
            // navigate to user profile
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative hover:bg-primary/10 hover:text-primary h-9 w-9"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className={cn(
                        "absolute -top-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center z-10 animate-pulse",
                        i18n.language === 'ar' ? 'left-0' : 'right-0'
                    )}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div
                        key="notification-backdrop"
                        className="fixed inset-0 z-[90] bg-black/5"
                        onClick={() => setIsOpen(false)}
                    />
                )}
                {isOpen && (
                    <motion.div
                        key="notification-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "absolute top-full mt-4 w-[320px] md:w-[400px] max-h-[500px] bg-card/90 backdrop-blur-2xl border border-border/50 rounded-3xl z-[150] overflow-hidden flex flex-col shadow-2xl",
                            i18n.language === 'ar' ? "left-0 sm:-left-4 origin-top-left" : "right-0 sm:-right-4 origin-top-right"
                        )}
                    >
                        <div className="p-5 border-b border-border/50 flex items-center justify-between bg-primary/5">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/70">{t('title')}</h3>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-8 px-3 text-[10px] uppercase font-black tracking-widest text-primary hover:bg-primary/10 rounded-full border border-primary/20"
                                >
                                    <Check className="h-3 w-3 mr-1.5" />
                                    {t('mark_all_read')}
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[250px] flex flex-col">
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <div className="relative">
                                        <Bell className="h-10 w-10 opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] uppercase font-black tracking-widest mt-4 animate-pulse">{t('common.loading', 'Loading...')}</p>
                                </div>
                            ) : error ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-8">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-destructive/10 rounded-full blur-3xl scale-[2.5]" />
                                        <div className="relative p-5 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl border border-destructive/10 shadow-inner text-destructive">
                                            <Bell className="h-10 w-10 opacity-40" />
                                            <div className="absolute top-0 right-0 -mr-1 -mt-1 bg-destructive text-white rounded-full p-0.5">
                                                <X className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="text-base font-black text-foreground mb-2">{t('error_title', 'Fetch Failed')}</h4>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                                        {t('error_desc', 'Something went wrong while fetching your notifications. Please try again.')}
                                    </p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-8">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-[2.5]" />
                                        <div className="relative p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/10 shadow-inner">
                                            <Bell className="h-10 w-10 text-primary/40" />
                                        </div>
                                    </div>
                                    <h4 className="text-base font-black text-foreground mb-2">{t('no_notifications')}</h4>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                                        {t('empty_desc')}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/30">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className="p-5 hover:bg-primary/5 transition-all cursor-pointer relative group border-l-4 border-l-transparent data-[unread=true]:border-l-primary"
                                            data-unread={!notification.is_read}
                                        >
                                            <div className="flex gap-4">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm"
                                                    style={{ backgroundColor: CATEGORY_COLORS[notification.category] || CATEGORY_COLORS[10] }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm leading-relaxed",
                                                        notification.is_read ? "text-muted-foreground font-medium" : "text-foreground font-bold"
                                                    )}>
                                                        {t(`keys.${notification.message_key}`, notification.message_key)}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-wider">
                                                            {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: dateLocale }) : ''}
                                                        </span>
                                                        {notification.entity_type && (
                                                            <div className="p-1.5 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                                <ExternalLink className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-border/50 bg-muted/20">
                            <Button
                                variant="ghost"
                                className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                            >
                                {t('view_all')}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
