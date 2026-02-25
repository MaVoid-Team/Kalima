import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';

import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import UserRolesSection from '@/components/admin/users/UserRolesSection';

export default function UserDetailPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation('userManagement');
    const isRtl = i18n.dir() === 'rtl';
    const { hasAdminAccess } = useRole();

    const {
        selectedUser,
        userRoles,
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
            fetchUserRoles(id);
        }
    }, [id, fetchUserById, fetchUserRoles]);

    const handleAddRole = async (portal, role) => {
        await assignRole(id, portal, role);
    };

    const handleRevokeRole = async (portal, role) => {
        await revokeRole(id, portal, role);
    };

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

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="shrink-0" data-testid="user-detail-top-back-button">
                        <Link to="/admin/users">
                            {isRtl ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('details.title')}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">ID: {selectedUser.id}</span>
                            {selectedUser.name}
                        </p>
                    </div>
                </div>

                {selectedUser.is_email_verified && (
                    <Badge variant="default">
                        <ShieldCheck className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {t('status.verified')}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Info Card */}
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {t('details.personalInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-center mb-6">
                            <Avatar className="h-24 w-24 overflow-hidden border-4 border-background shadow-sm">
                                <AvatarImage src={selectedUser.profile_pic_url} alt={selectedUser.name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold uppercase">
                                    {selectedUser.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">{selectedUser.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{t(`createDialog.${selectedUser.gender || 'unknown'}`)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm">{selectedUser.email || '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-left" dir="ltr">{selectedUser.phone || '—'}</p>
                                    {selectedUser.secondary_phone && (
                                        <p className="text-xs text-muted-foreground text-left" dir="ltr">{selectedUser.secondary_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm">
                                        {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t('table.joined')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles & Specific Info */}
                <div className="md:col-span-2 space-y-6">

                    {/* Role-Specific Data Blocks (Optional but helpful context) */}
                    {(selectedUser.teachers || selectedUser.students) && (
                        <Card className="shadow-sm">
                            <CardContent className="p-4 flex gap-4 flex-wrap">
                                {selectedUser.teachers && (
                                    <div className="bg-primary/5 rounded border p-3 flex-1 min-w-[200px]">
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{t('details.teacherInfo')}</p>
                                        <p className="text-sm">{selectedUser.teachers.serial || 'N/A'}</p>
                                    </div>
                                )}
                                {selectedUser.students && (
                                    <div className="bg-primary/5 rounded border p-3 flex-1 min-w-[200px]">
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{t('details.studentInfo')}</p>
                                        <p className="text-sm">{t('details.levelId')}: {selectedUser.students.level_id || 'N/A'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Roles Table Section */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <UserRolesSection
                                roles={userRoles}
                                onAddRole={handleAddRole}
                                onRevokeRole={handleRevokeRole}
                                actionLoading={actionLoading}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
