import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit3, Save, X, Trash2, CheckCircle2, XCircle, Mail, Phone, Crown, Zap, ShieldCheck, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useTranslation } from 'react-i18next';

export default function DetailHeader({
    user,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onApprove,
    onReject,
    onDelete,
    actionLoading,
    isRtl,
    t
}) {
    const { i18n } = useTranslation();

    const getFlagConfig = (flag) => {
        const f = flag || 'NORMAL';
        if (f === 'ELITE') return { icon: Crown, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5' };
        if (f === 'PRO') return { icon: Zap, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-indigo-500/5' };
        if (f === 'OBSERVER') return { icon: Eye, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
        if (f === 'Warned') return { icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse' };
        return { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    };

    const flagConfig = getFlagConfig(user.flag);
    const FlagIcon = flagConfig.icon;

    return (
        <div className="sticky top-0 z-20 -mx-4 md:-mx-8 border-b bg-background/80 backdrop-blur-xl overflow-hidden transition-all duration-300">
            {/* Elegant Cover Photo Banner */}
            <div className="h-32 md:h-40 w-full bg-linear-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10" />

                {/* Back Button Over Banner */}
                <div className="absolute top-4 start-4 z-10">
                    <Button variant="secondary" size="icon" asChild className="h-9 w-9 rounded-full bg-background/50 backdrop-blur-md border-none shadow-sm hover:bg-background/80 transition-all">
                        <Link to="/admin/users">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="px-4 md:px-8 pb-4 pt-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 md:-mt-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 min-w-0">
                        <div className="relative shrink-0">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background ring-1 ring-primary/10 shadow-xl transition-transform hover:scale-105 duration-300">
                                <AvatarImage src={user.profile_pic_url} alt={user.name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                                    {user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {!user.is_deleted && user.confirmed && (
                                <div className="absolute bottom-2 right-2 bg-success text-white rounded-full p-1 border-2 border-background shadow-lg">
                                    <CheckCircle2 className={`h-4 w-4 ${i18n.language === 'ar' ? 'scale-x-[-1]' : ''}`} />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 md:pb-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-3xl font-extrabold tracking-tight truncate max-w-[200px] md:max-w-md lg:max-w-lg">
                                    {user.name}
                                </h1>
                                {user.is_deleted ? (
                                    <Badge variant="destructive" className="uppercase text-[10px] tracking-widest font-black h-5">
                                        {t('status.deleted')}
                                    </Badge>
                                ) : user.confirmed ? (
                                    <Badge className="bg-success/20 text-success border-success/30 uppercase text-[10px] tracking-widest font-black h-5">
                                        {t('status.verified')}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="uppercase text-[10px] tracking-widest font-black h-5">
                                        {t('status.pending')}
                                    </Badge>
                                )}

                                <Badge variant="outline" className={`h-5 gap-1 px-2 border-dashed uppercase text-[10px] tracking-widest font-black ${flagConfig.color}`}>
                                    <FlagIcon className={`${i18n.language === 'ar' ? 'scale-x-[-1]' : ''} h-3 w-3`} />
                                    {t(`details.flags.${user.flag || 'NORMAL'}`, user.flag || 'NORMAL')}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4 text-primary/60" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="hidden sm:flex items-center gap-1.5 border-s ps-3 border-border/50">
                                        <Phone className="h-4 w-4 text-primary/60" />
                                        <span dir="ltr">{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={onCancel} disabled={actionLoading}>
                                    <X className="h-4 w-4 me-2" />
                                    {t('actions.cancel')}
                                </Button>
                                <Button size="sm" onClick={onSave} disabled={actionLoading}>
                                    {actionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <Save className="h-4 w-4 me-2" />}
                                    {t('actions.save')}
                                </Button>
                            </>
                        ) : (
                            <>
                                {!user.is_deleted && !user.confirmed && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-success hover:text-success hover:bg-success/10 border-success/30"
                                        onClick={onApprove}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle2 className="h-4 w-4 me-2" />
                                        {t('actions.approve')}
                                    </Button>
                                )}
                                {!user.is_deleted && user.confirmed && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-warning hover:text-warning hover:bg-warning/10 border-warning/30"
                                        onClick={onReject}
                                        disabled={actionLoading}
                                    >
                                        <XCircle className="h-4 w-4 me-2" />
                                        {t('actions.reject')}
                                    </Button>
                                )}
                                <Button size="sm" onClick={onEdit}>
                                    <Edit3 className="h-4 w-4 me-2" />
                                    {t('actions.edit')}
                                </Button>
                                {!user.is_deleted && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/30">
                                                <Trash2 className="h-4 w-4 me-2" />
                                                {t('actions.delete')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('details.confirmDeleteTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>{t('details.confirmDeleteDesc')}</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    {t('actions.delete')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
