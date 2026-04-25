import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ShoppingBag, BookOpen } from 'lucide-react';

import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRole } from '@/hooks/useRole';
import useLookups from '@/hooks/useLookups';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

// Details Components
import DetailHeader from '@/components/admin/users/details/DetailHeader';
import MainInfoCard from '@/components/admin/users/details/MainInfoCard';
import UserAnalyticsCard from '@/components/admin/users/details/UserAnalyticsCard';
import UserRolesCard from '@/components/admin/users/details/UserRolesCard';
import TeacherCard from '@/components/admin/users/details/TeacherCard';
import StudentCard from '@/components/admin/users/details/StudentCard';
import LecturerCard from '@/components/admin/users/details/LecturerCard';
import AssistantCard from '@/components/admin/users/details/AssistantCard';
import ParentCard from '@/components/admin/users/details/ParentCard';
import UsersCreatedCard from '@/components/admin/users/details/UsersCreatedCard';

export default function UserDetailPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation('userManagement');
    const isRtl = i18n.dir() === 'rtl';
    const { hasAdminAccess } = useRole();
    const { governments, zones, getZonesByGovernment, subjects, levels, zonesLoading } = useLookups();

    const {
        selectedUser,
        loading,
        actionLoading,
        fetchUserById,
        updateUser,
        assignRole,
        revokeRole,
        deleteUser,
        approveUser,
        rejectUser
    } = useAdminUsers();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        secondary_phone: '',
        gender: '',
        flag: '',
        teacher: {},
        student: {},
        lecturer: {},
        assistant: {},
        parent: {},
    });

    useEffect(() => {
        fetchUserById(id);
    }, [id, fetchUserById]);

    useEffect(() => {
        if (selectedUser) {
            const displayEmail = selectedUser.email?.includes('_deleted_') ? selectedUser.email.split('_deleted_')[0] : selectedUser.email;
            const displayPhone = selectedUser.phone?.includes('_deleted_') ? selectedUser.phone.split('_deleted_')[0] : selectedUser.phone;

            setFormData({
                name: selectedUser.name || '',
                email: displayEmail || '',
                phone: displayPhone || '',
                secondary_phone: selectedUser.secondary_phone || '',
                gender: selectedUser.gender?.toUpperCase() || '',
                flag: selectedUser.flag || 'NORMAL',
                // Roles data
                teacher: (Array.isArray(selectedUser.teachers) ? selectedUser.teachers[0] : selectedUser.teachers) || { is_primary: false, is_preparatory: false, is_secondary: false },
                student: (Array.isArray(selectedUser.students) ? selectedUser.students[0] : selectedUser.students) || {},
                lecturer: (Array.isArray(selectedUser.lecturers) ? selectedUser.lecturers[0] : selectedUser.lecturers) || {},
                assistant: (Array.isArray(selectedUser.assistants) ? selectedUser.assistants[0] : selectedUser.assistants) || {},
                parent: (Array.isArray(selectedUser.parents) ? selectedUser.parents[0] : selectedUser.parents) || {},
            });
        }
    }, [selectedUser]);

    useEffect(() => {
        const rolesWithGov = ['teacher', 'student', 'lecturer', 'assistant', 'parent'];
        rolesWithGov.forEach(roleKey => {
            const govId = formData[roleKey]?.government_id;
            if (govId) {
                getZonesByGovernment(govId);
            }
        });
    }, [
        formData.teacher?.government_id,
        formData.student?.government_id,
        formData.lecturer?.government_id,
        formData.assistant?.government_id,
        formData.parent?.government_id,
        getZonesByGovernment
    ]);

    /* ── handlers ── */
    const handleSave = async () => {
        const success = await updateUser(id, formData);
        if (success) {
            setIsEditing(false);
            fetchUserById(id);
        }
    };

    const handleRevokeRole = async (portal, role) => {
        await revokeRole(id, portal, role);
        fetchUserById(id);
    };

    const handleAssignRole = async (portal, role) => {
        await assignRole(id, portal, role);
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
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
                <p className="text-xl text-muted-foreground">{t('details.userNotFound', 'User not found.')}</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    {t('details.back')}
                </Button>
            </div>
        );
    }

    /* ── derived values ── */
    const analytics = selectedUser.user_analytics || {};
    const teacher = selectedUser.teachers ? (Array.isArray(selectedUser.teachers) ? selectedUser.teachers[0] : selectedUser.teachers) : null;
    const teachesAt = selectedUser.teaches_at || [];
    const students = selectedUser.students ? (Array.isArray(selectedUser.students) ? selectedUser.students : [selectedUser.students]) : [];
    const lecturers = selectedUser.lecturers ? (Array.isArray(selectedUser.lecturers) ? selectedUser.lecturers : [selectedUser.lecturers]) : [];
    const assistants = selectedUser.assistants ? (Array.isArray(selectedUser.assistants) ? selectedUser.assistants : [selectedUser.assistants]) : [];
    const parents = selectedUser.parents ? (Array.isArray(selectedUser.parents) ? selectedUser.parents : [selectedUser.parents]) : [];
    const roles = selectedUser.user_roles || [];
    const userCreated = selectedUser.userCreated || {};

    const hasRole = (portal, roleName) => roles.some(r => r.portal.toLowerCase() === portal.toLowerCase() && r.role.toLowerCase() === roleName.toLowerCase());
    const isTeacher = hasRole('academy', 'Teacher') || hasRole('store', 'Teacher');
    const isStudent = hasRole('academy', 'Student') || hasRole('store', 'Student');
    const isLecturer = hasRole('academy', 'Lecturer') || hasRole('store', 'Lecturer');
    const isAssistant = hasRole('academy', 'Assistant') || hasRole('store', 'Assistant');
    const isParent = hasRole('academy', 'Parent') || hasRole('store', 'Parent');

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
    const displaySecondaryPhone = selectedUser.secondary_phone?.includes('_deleted_') ? selectedUser.secondary_phone.split('_deleted_')[0] : selectedUser.secondary_phone;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Header */}
            <DetailHeader
                user={selectedUser}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onCancel={() => setIsEditing(false)}
                onSave={handleSave}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDeleteUser}
                actionLoading={actionLoading}
                isRtl={isRtl}
                t={t}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Analytics & Roles */}
                <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                    <UserAnalyticsCard stats={analyticsStats} t={t} />

                    <UserRolesCard
                        roles={roles}
                        onRevoke={handleRevokeRole}
                        onAssign={handleAssignRole}
                        hasAdminAccess={hasAdminAccess}
                        t={t}
                    />

                    <UsersCreatedCard createdEntries={createdEntries} t={t} />

                    {/* Metadata Card */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                            <span>{t('details.joined')}</span>
                            <span className="font-mono tabular-nums">
                                {selectedUser.created_at && format(new Date(selectedUser.created_at), 'PP p', { locale: isRtl ? arSA : undefined })}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Main Column: User Details */}
                <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">

                    {/* Basic Info */}
                    <MainInfoCard
                        user={selectedUser}
                        isEditing={isEditing}
                        formData={formData}
                        setFormData={setFormData}
                        t={t}
                        displayEmail={displayEmail}
                        displayPhone={displayPhone}
                        displaySecondaryPhone={displaySecondaryPhone}
                    />

                    {/* Teacher Details */}
                    {isTeacher && (
                        <TeacherCard
                            teacher={teacher}
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            t={t}
                            subjects={subjects}
                            governments={governments}
                            zones={zones}
                            zonesLoading={zonesLoading}
                            teachesAt={teachesAt}
                        />
                    )}

                    {/* Student Details */}
                    {isStudent && (
                        <StudentCard
                            students={students}
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            t={t}
                            levels={levels}
                            governments={governments}
                            zones={zones}
                            zonesLoading={zonesLoading}
                        />
                    )}

                    {/* Lecturer Details */}
                    {isLecturer && (
                        <LecturerCard
                            lecturers={lecturers}
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            t={t}
                            levels={levels}
                            governments={governments}
                            zones={zones}
                            zonesLoading={zonesLoading}
                        />
                    )}

                    {/* Assistant Details */}
                    {isAssistant && (
                        <AssistantCard
                            assistants={assistants}
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            t={t}
                            levels={levels}
                            governments={governments}
                            zones={zones}
                            zonesLoading={zonesLoading}
                        />
                    )}

                    {/* Parent Details */}
                    {isParent && (
                        <ParentCard
                            parents={parents}
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            t={t}
                            levels={levels}
                            governments={governments}
                            zones={zones}
                            zonesLoading={zonesLoading}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}
