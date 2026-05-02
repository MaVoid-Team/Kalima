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

export default function NotificationBell() {
    const { t, i18n } = useTranslation('notifications');
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
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
                    <>
                        <div 
                            className="fixed inset-0 z-[90] bg-black/5" 
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={cn(
                                "absolute top-full mt-2 w-80 md:w-96 max-h-[500px] bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl z-[100] overflow-hidden flex flex-col",
                                i18n.language === 'ar' ? "left-0 origin-top-left" : "right-0 origin-top-right"
                            )}
                        >
                            <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                                <h3 className="font-bold text-sm uppercase tracking-wider">{t('title')}</h3>
                                {unreadCount > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={markAllAsRead}
                                        className="h-7 text-[10px] uppercase font-bold"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        {t('mark_all_read')}
                                    </Button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[100px]">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Bell className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs font-medium">{t('no_notifications')}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className="p-4 hover:bg-primary/5 transition-colors cursor-pointer relative group"
                                            >
                                                <div className="flex gap-3">
                                                    <div 
                                                        className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                                                        style={{ backgroundColor: CATEGORY_COLORS[notification.category] || CATEGORY_COLORS[10] }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                                                            {t(`keys.${notification.message_key}`, notification.message_key)}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: dateLocale }) : ''}
                                                            </span>
                                                            {notification.entity_type && (
                                                                <ExternalLink className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 border-t border-border bg-muted/30">
                                <Button 
                                    variant="ghost" 
                                    className="w-full h-8 text-xs font-bold text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/notifications');
                                    }}
                                >
                                    {t('view_all')}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
