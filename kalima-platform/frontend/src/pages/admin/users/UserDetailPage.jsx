import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import {
    ArrowLeft, User, Mail, Phone, Calendar,
    ShieldCheck, Eye, ShoppingBag, UserPlus, BookOpen,
    MapPin, Hash, GraduationCap, BarChart3, Users
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
        fetchUserRoles,
        assignRole,
        revokeRole
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
                <p className="text-xl text-muted-foreground">User not found.</p>
                <Button variant="outline" asChild data-testid="user-detail-back-button">
                    <Link to="/admin/users">{t('details.back')}</Link>
                </Button>
            </div>
        );
    }

    /* ── derived values ── */
    const analytics = selectedUser.user_analytics || {};
    const teacher = selectedUser.teachers;
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
            icon: Eye,
            label: t('details.views'),
            value: analytics.views ?? 0,
            color: 'text-chart-2',
        },
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
        },
        {
            icon: UserPlus,
            label: t('details.invites'),
            value: analytics.successful_invites ?? 0,
            color: 'text-chart-4',
        },
    ];

    const createdEntries = Object.entries(userCreated).filter(([, v]) => v > 0);

    return (
        <div className="space-y-6 max-w-6xl mx-auto" data-testid="user-detail-page">

            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="shrink-0"
                        data-testid="user-detail-top-back-button"
                    >
                        <Link to="/admin/users">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('details.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded me-2">
                                ID: {selectedUser.id}
                            </span>
                            {selectedUser.name}
                        </p>
                    </div>
                </div>

                {selectedUser.is_email_verified && (
                    <Badge variant="default" className="gap-1" data-testid="user-detail-verified-badge">
                        <ShieldCheck className="w-4 h-4" />
                        {t('status.verified')}
                    </Badge>
                )}
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
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold truncate">{selectedUser.name}</h2>
                                {!selectedUser.is_email_verified && (
                                    <Badge variant="outline" className="text-muted-foreground text-xs shrink-0">
                                        {t('status.pending')}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                {selectedUser.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        {selectedUser.email}
                                    </span>
                                )}
                                {selectedUser.phone && (
                                    <span className="flex items-center gap-1.5" dir="ltr">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        {selectedUser.phone}
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="user-detail-analytics">
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
                                    value={teacher.government?.title}
                                />
                                <Separator className="my-1 opacity-50" />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.zone')}
                                    value={teacher.zones?.title}
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
