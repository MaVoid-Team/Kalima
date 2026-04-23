import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import {
    ArrowLeft, User, Mail, Phone, Calendar,
    ShieldCheck, Eye, ShoppingBag, UserPlus, BookOpen,
    MapPin, Hash, GraduationCap, BarChart3, Users,
    Trash2, CheckCircle2, XCircle
} from 'lucide-react';

import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/ui/loading-spinner';
import UserRolesSection from '@/components/admin/users/UserRolesSection';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/* ─── helpers ────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = 'text-primary' }) {
    const { i18n } = useTranslation('userManagement');
    return (
        <Card className="shadow-sm" data-testid={`user-detail-stat-${label}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted/60 ${color}`}>
                    <Icon className={`h-5 w-5 ${i18n.language === 'ar' ? 'scale-x-[-1]' : ''}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-none mb-1 truncate">{label}</p>
                    <p className="text-xl font-bold truncate">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function UserDetailPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation('userManagement');
    const isRtl = i18n.dir() === 'rtl';
    const { hasAdminAccess } = useRole();

    const {
        selectedUser,
        loading,
        actionLoading,
        fetchUserById,
        assignRole,
        revokeRole,
        deleteUser,
        approveUser,
        rejectUser
    } = useAdminUsers();

    useEffect(() => {
        if (id) {
            fetchUserById(id);
        }
    }, [id, fetchUserById]);

    const handleAddRole = async (portal, role) => {
        await assignRole(id, portal, role);
        // Refresh user to get updated user_roles in selectedUser
        fetchUserById(id);
    };

    const handleRevokeRole = async (portal, role) => {
        await revokeRole(id, portal, role);
        fetchUserById(id);
    };

    const handleDeleteUser = async () => {
        const res = await deleteUser(id);
        if (res?.success) {
            fetchUserById(id);
        }
    };

    const handleApprove = async () => {
        const res = await approveUser(id);
        if (res?.success) {
            fetchUserById(id);
        }
    };

    const handleReject = async () => {
        const res = await rejectUser(id);
        if (res?.success) {
            fetchUserById(id);
        }
    };

    /* ── loading / not-found states ── */
    if (loading && !selectedUser) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!selectedUser) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <p className="text-xl text-muted-foreground">{t('details.userNotFound', 'User not found.')}</p>
                <Button variant="outline" asChild data-testid="user-detail-back-button">
                    <Link to="/admin/users">{t('details.back')}</Link>
                </Button>
            </div>
        );
    }

    /* ── derived values ── */
    const analytics = selectedUser.user_analytics || {};
    const teacher = selectedUser.teachers;
    const teachesAt = selectedUser.teaches_at || [];
    const students = selectedUser.students ? (Array.isArray(selectedUser.students) ? selectedUser.students : []) : [];
    const lecturers = selectedUser.lecturers ? (Array.isArray(selectedUser.lecturers) ? selectedUser.lecturers : []) : [];
    const assistants = selectedUser.assistants ? (Array.isArray(selectedUser.assistants) ? selectedUser.assistants : []) : [];
    const parents = selectedUser.parents ? (Array.isArray(selectedUser.parents) ? selectedUser.parents : []) : [];
    const userCreated = selectedUser.userCreated || {};
    const roles = selectedUser.user_roles || [];

    const activeLevels = teacher
        ? [
            teacher.is_primary && t('details.primary'),
            teacher.is_preparatory && t('details.preparatory'),
            teacher.is_secondary && t('details.secondary'),
        ].filter(Boolean)
        : [];

    const analyticsStats = [
        {
            icon: ShoppingBag,
            label: t('details.totalSpent'),
            value: `${Number(analytics.total_spent ?? 0).toLocaleString()} ${t('details.currency')}`,
            color: 'text-chart-3',
        },
        {
            icon: BookOpen,
            label: t('details.purchases'),
            value: analytics.number_of_purchases ?? 0,
            color: 'text-primary',
        }
    ];

    const createdEntries = Object.entries(userCreated).filter(([, v]) => v > 0);

    const displayEmail = selectedUser.email?.includes('_deleted_') ? selectedUser.email.split('_deleted_')[0] : selectedUser.email;
    const displayPhone = selectedUser.phone?.includes('_deleted_') ? selectedUser.phone.split('_deleted_')[0] : selectedUser.phone;

    return (
        <div className="space-y-6 max-w-6xl mx-auto" data-testid="user-detail-page">

            {/* ── Top Bar ── */}
            {/* ── Top Bar ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="shrink-0"
                        data-testid="user-detail-top-back-button"
                    >
                        <Link to="/admin/users">
                            <ArrowLeft className={`h-5 w-5`} />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{t('details.title')}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-0.5">
                            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {t('details.idLabel', 'ID')}: {selectedUser.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedUser.is_deleted && (
                            <Badge variant="destructive" className="gap-1" data-testid="user-detail-deleted-badge">
                                <Trash2 className="w-4 h-4" />
                                {t('status.deleted', 'Deleted')}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {!selectedUser.is_deleted && hasAdminAccess && (
                            <div className="flex items-center gap-2">
                                {!selectedUser.confirmed ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 px-2 sm:px-3"
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        data-testid="user-detail-approve-button"
                                    >
                                        <CheckCircle2 className={`h-4 w-4 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''} sm:me-1`} />
                                        <span className="hidden sm:inline">{t('actions.approve', 'Approve')}</span>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 h-8 px-2 sm:px-3"
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                        data-testid="user-detail-reject-button"
                                    >
                                        <XCircle className="h-4 w-4 sm:me-1" />
                                        <span className="hidden sm:inline">{t('actions.reject', 'Reject')}</span>
                                    </Button>
                                )}
                            </div>
                        )}

                        {!selectedUser.is_deleted && hasAdminAccess && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={actionLoading}
                                        data-testid="user-detail-delete-button"
                                        className="h-8 px-2 sm:px-3"
                                    >
                                        <Trash2 className="h-4 w-4 sm:me-1" />
                                        <span className="hidden sm:inline">{t('actions.delete', 'Delete')}</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir={i18n.dir()}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('details.confirmDeleteTitle', 'Are you sure?')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('details.confirmDeleteDesc', 'This action cannot be undone. This will permanently delete the user account.')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={actionLoading}>{t('actions.cancel', 'Cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteUser}
                                            disabled={actionLoading}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {actionLoading && <LoadingSpinner className="h-4 w-4 mr-2" />}
                                            {t('actions.delete', 'Delete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Profile Hero Card ── */}
            <Card className="shadow-sm overflow-hidden" data-testid="user-detail-profile-card">
                {/* decorative banner */}
                <div className="h-20 bg-linear-to-r from-primary/30 via-primary/10 to-transparent" />
                <CardContent className="px-6 pb-6 -mt-10">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        {/* Avatar */}
                        <Avatar className="h-20 w-20 border-4 border-background shadow-md shrink-0">
                            <AvatarImage src={selectedUser.profile_pic_url} alt={selectedUser.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase">
                                {selectedUser.name?.trim().charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold truncate">{selectedUser.name}</h2>
                                <TooltipProvider>
                                    {selectedUser.is_email_verified && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ShieldCheck className={`h-5 w-5 text-blue-500 shrink-0 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {t('status.verified')}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    {selectedUser.confirmed && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <CheckCircle2 className={`h-5 w-5 text-emerald-500 shrink-0 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {t('table.confirmed')}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </TooltipProvider>
                                {!selectedUser.is_email_verified && (
                                    <Badge variant="outline" className="text-muted-foreground text-xs shrink-0">
                                        {t('status.pending')}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                {displayEmail && (
                                    <span className="flex items-center gap-1.5" dir="ltr">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        {displayEmail}
                                    </span>
                                )}
                                {displayPhone && (
                                    <span className="flex items-center gap-1.5" dir="ltr">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        {displayPhone}
                                    </span>
                                )}
                                {selectedUser.gender && (
                                    <span className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 shrink-0" />
                                        {t(`createDialog.${selectedUser.gender}`)}
                                    </span>
                                )}
                                {selectedUser.created_at && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                        {format(new Date(selectedUser.created_at), 'PPP', { locale: isRtl ? arSA : undefined })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Analytics Stats Row ── */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t('details.analytics')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="user-detail-analytics">
                    {analyticsStats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>
            </div>

            {/* ── Bottom Section ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left column: Teacher + Users Created */}
                <div className="md:col-span-1 space-y-6">

                    {/* Teacher Details Card */}
                    {teacher && (
                        <Card className="shadow-sm" data-testid="user-detail-teacher-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    {t('details.teacherDetails')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-0">
                                <InfoRow
                                    icon={Hash}
                                    label={t('details.serial')}
                                    value={teacher.serial}
                                />
                                <Separator className="my-1 opacity-50" />
                                <InfoRow
                                    icon={BookOpen}
                                    label={t('details.subject')}
                                    value={teacher.subjects?.title}
                                />
                                <Separator className="my-1 opacity-50" />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.government')}
                                    value={teacher.government?.title || `ID: ${teacher.government_id}`}
                                />
                                <Separator className="my-1 opacity-50" />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.zone')}
                                    value={teacher.zones?.title || `ID: ${teacher.zone_id}`}
                                />

                                {activeLevels.length > 0 && (
                                    <>
                                        <Separator className="my-1 opacity-50" />
                                        <div className="flex items-start gap-3 py-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-muted-foreground leading-none mb-1.5">
                                                    {t('details.levels')}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {activeLevels.map((lvl) => (
                                                        <Badge key={lvl} variant="secondary" className="text-xs">
                                                            {lvl}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {teachesAt.length > 0 && (
                                    <>
                                        <Separator className="my-1 opacity-50" />
                                        <div className="flex items-start gap-3 py-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-muted-foreground leading-none mb-1.5">
                                                    {t('details.teachingLocations', 'Teaching Locations')}
                                                </p>
                                                <div className="space-y-1">
                                                    {teachesAt.map((location) => (
                                                        <div key={location.id} className="text-sm font-medium">
                                                            {location.location_name}
                                                            <Badge variant="outline" className="text-xs ms-2">
                                                                {location.location_type}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Users Created Card */}
                    {createdEntries.length > 0 && (
                        <Card className="shadow-sm" data-testid="user-detail-users-created-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    {t('details.usersCreated')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {createdEntries.map(([role, count]) => (
                                        <div key={role} className="flex items-center justify-between py-1">
                                            <span className="text-sm text-muted-foreground">
                                                {t(`roles.${role}`, role)}
                                            </span>
                                            <Badge variant="secondary" className="font-mono tabular-nums">
                                                {count}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Students Card */}
                    {students.length > 0 && (
                        <Card className="shadow-sm" data-testid="user-detail-students-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    {t('details.students', 'Students')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-0">
                                {students.map((student) => (
                                    <div key={student.id} className="py-2">
                                        <div className="flex items-start gap-3">
                                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{student.name}</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {student.levels && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {student.levels.title}
                                                        </Badge>
                                                    )}
                                                    {student.government && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {student.government.title}
                                                        </Badge>
                                                    )}
                                                    {student.zones && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {student.zones.title}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {student !== students[students.length - 1] && (
                                            <Separator className="my-2 opacity-50" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Lecturers Card */}
                    {lecturers.length > 0 && (
                        <Card className="shadow-sm" data-testid="user-detail-lecturers-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    {t('details.lecturers', 'Lecturers')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-0">
                                {lecturers.map((lecturer) => (
                                    <div key={lecturer.id} className="py-2">
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{lecturer.name}</p>
                                                {lecturer.bio && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {lecturer.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {lecturer !== lecturers[lecturers.length - 1] && (
                                            <Separator className="my-2 opacity-50" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Assistants Card */}
                    {assistants.length > 0 && (
                        <Card className="shadow-sm" data-testid="user-detail-assistants-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                    {t('details.assistants', 'Assistants')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-0">
                                {assistants.map((assistant) => (
                                    <div key={assistant.id} className="py-2">
                                        <div className="flex items-start gap-3">
                                            <UserPlus className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{assistant.name}</p>
                                                {assistant.lecturers && assistant.lecturers.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        <span className="text-xs text-muted-foreground">{t('details.assists', 'Assists')}:</span>
                                                        {assistant.lecturers.map((lecturer) => (
                                                            <Badge key={lecturer.id} variant="outline" className="text-xs">
                                                                {lecturer.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {assistant !== assistants[assistants.length - 1] && (
                                            <Separator className="my-2 opacity-50" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Parents Card */}
                    {parents.length > 0 && (
                        <Card className="shadow-sm" data-testid="user-detail-parents-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    {t('details.parents', 'Parents')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-0">
                                {parents.map((parent) => (
                                    <div key={parent.id} className="py-2">
                                        <div className="flex items-start gap-3">
                                            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{parent.name}</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {parent.government && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {parent.government.title}
                                                        </Badge>
                                                    )}
                                                    {parent.zones && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {parent.zones.title}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {parent !== parents[parents.length - 1] && (
                                            <Separator className="my-2 opacity-50" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right column: Roles */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardContent className="p-6">
                        <UserRolesSection
                            roles={roles}
                            onAddRole={handleAddRole}
                            onRevokeRole={handleRevokeRole}
                            actionLoading={actionLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
