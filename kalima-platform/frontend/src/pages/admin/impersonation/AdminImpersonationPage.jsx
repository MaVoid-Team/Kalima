import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import useAuth from '@/hooks/auth/useAuth';
import { startImpersonation } from '@/services/impersonationService';

const ROLE_OPTIONS = ['Admin', 'SubAdmin', 'Teacher', 'Student', 'Parent', 'Lecturer', 'Moderator', 'Assistant'];
const PORTAL_OPTIONS = ['store', 'academy'];

function getUserRoles(user) {
    const roles = user?.roles || user?.user_roles || [];
    const seen = new Set();
    const uniqueRoles = [];

    if (Array.isArray(roles) && roles.length > 0) {
        roles.forEach((entry) => {
            const role = entry.role || entry;
            const normalizedRole = String(role || '').trim().toLowerCase();
            if (!normalizedRole || seen.has(normalizedRole)) return;
            seen.add(normalizedRole);
            uniqueRoles.push(role);
        });
        return uniqueRoles;
    }
    return user?.role ? [user.role] : [];
}

function getRoleTranslationKey(role) {
    const normalizedRole = String(role || '').toLowerCase();
    return ROLE_OPTIONS.find((option) => option.toLowerCase() === normalizedRole) || role;
}

export default function AdminImpersonationPage() {
    const navigate = useNavigate();
    const { t } = useTranslation('admin');
    const { user: currentUser } = useAuth();
    const { users, loading, pagination, fetchUsers } = useAdminUsers();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [portalFilter, setPortalFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startingUserId, setStartingUserId] = useState(null);

    useEffect(() => {
        fetchUsers({ page: 1, limit: 50 });
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => users, [users]);

    const buildUserFilters = (page = 1, limit = pagination.limit || 50) => ({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        portal: portalFilter === 'all' ? undefined : portalFilter,
        confirmed: statusFilter === 'all' ? undefined : statusFilter === 'active',
    });

    const handleSearch = (event) => {
        event.preventDefault();
        fetchUsers(buildUserFilters(1, pagination.limit || 50));
    };

    const handleClearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setPortalFilter('all');
        setStatusFilter('all');
        fetchUsers({ page: 1, limit: pagination.limit || 50 });
    };

    const handlePageChange = (page) => {
        fetchUsers(buildUserFilters(page, pagination.limit || 50));
    };

    const handleStart = async (targetUserId) => {
        setStartingUserId(targetUserId);
        try {
            const result = await startImpersonation(targetUserId);
            toast.success(t('impersonation.messages.started'));
            window.dispatchEvent(new Event('auth-session-changed'));
            navigate(result.redirectTo, { replace: true });
            window.location.reload();
        } finally {
            setStartingUserId(null);
        }
    };

    return (
        <div className="space-y-6" data-testid="admin-impersonation-page">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t('impersonation.title')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('impersonation.description')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('impersonation.cardTitle')}</CardTitle>
                    <CardDescription>{t('impersonation.cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSearch} className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,180px))_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('impersonation.filters.searchPlaceholder')}
                                className="ps-9"
                                data-testid="impersonation-search-input"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full" data-testid="impersonation-role-filter">
                                <SelectValue placeholder={t('impersonation.filters.allRoles')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('impersonation.filters.allRoles')}</SelectItem>
                                {ROLE_OPTIONS.map((role) => <SelectItem key={role} value={role}>{t(`roles.${role}`, { defaultValue: role })}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={portalFilter} onValueChange={setPortalFilter}>
                            <SelectTrigger className="w-full" data-testid="impersonation-portal-filter">
                                <SelectValue placeholder={t('impersonation.filters.allPortals')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('impersonation.filters.allPortals')}</SelectItem>
                                {PORTAL_OPTIONS.map((portal) => <SelectItem key={portal} value={portal}>{t(`impersonation.portals.${portal}`)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full" data-testid="impersonation-status-filter">
                                <SelectValue placeholder={t('impersonation.filters.allStatuses')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('impersonation.filters.allStatuses')}</SelectItem>
                                <SelectItem value="active">{t('impersonation.status.active')}</SelectItem>
                                <SelectItem value="unconfirmed">{t('impersonation.status.unconfirmed')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={loading} data-testid="impersonation-search-button">
                            {t('impersonation.filters.apply')}
                        </Button>
                        <Button type="button" variant="outline" disabled={loading} onClick={handleClearFilters} data-testid="impersonation-clear-filters-button">
                            {t('impersonation.filters.clear')}
                        </Button>
                    </form>

                    {loading && users.length === 0 ? (
                        <div className="flex justify-center py-10"><LoadingSpinner /></div>
                    ) : (
                        <div className="overflow-hidden rounded-md border">
                            <Table className="table-fixed">
                                <colgroup>
                                    <col className="w-[28%]" />
                                    <col className="w-[34%]" />
                                    <col className="w-[22%]" />
                                    <col className="w-[16%]" />
                                </colgroup>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('impersonation.table.user')}</TableHead>
                                        <TableHead>{t('impersonation.table.email')}</TableHead>
                                        <TableHead>{t('impersonation.table.roles')}</TableHead>
                                        <TableHead className="text-end">{t('impersonation.table.action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((target) => {
                                        const isSelf = Number(target.id) === Number(currentUser?.id);
                                        const roles = getUserRoles(target);
                                        return (
                                            <TableRow key={target.id} data-testid={`impersonation-user-row-${target.id}`}>
                                                <TableCell className="whitespace-normal break-words">
                                                    <div className="font-medium">{target.name || t('impersonation.table.unnamedUser')}</div>
                                                    <div className="text-xs text-muted-foreground">{t('impersonation.table.userId', { id: target.id })}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-all">{target.email || '—'}</TableCell>
                                                <TableCell className="whitespace-normal">
                                                    <div className="flex flex-wrap gap-1">
                                                        {roles.length > 0 ? roles.map((role) => <Badge key={role} variant="secondary">{t(`roles.${getRoleTranslationKey(role)}`, { defaultValue: role })}</Badge>) : <span className="text-muted-foreground">—</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleStart(target.id)}
                                                        disabled={isSelf || startingUserId === target.id}
                                                        data-testid={`start-impersonation-${target.id}`}
                                                    >
                                                        <UserCheck className="me-2 h-4 w-4" />
                                                        {startingUserId === target.id ? t('impersonation.actions.starting') : isSelf ? t('impersonation.actions.currentUser') : t('impersonation.actions.impersonate')}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!loading && filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">{t('impersonation.empty')}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => handlePageChange(pagination.page - 1)}>{t('common.pagination.previous')}</Button>
                            <span className="text-sm text-muted-foreground">{t('impersonation.paginationSummary', { page: pagination.page, totalPages: pagination.totalPages })}</span>
                            <Button type="button" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => handlePageChange(pagination.page + 1)}>{t('common.pagination.next')}</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
