import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import useAuth from '@/hooks/auth/useAuth';
import { startImpersonation } from '@/services/impersonationService';

function getUserRoles(user) {
    const roles = user?.roles || user?.user_roles || [];
    if (Array.isArray(roles) && roles.length > 0) {
        return roles.map((entry) => entry.role || entry).filter(Boolean);
    }
    return user?.role ? [user.role] : [];
}

export default function AdminImpersonationPage() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { users, loading, pagination, fetchUsers } = useAdminUsers();
    const [search, setSearch] = useState('');
    const [startingUserId, setStartingUserId] = useState(null);

    useEffect(() => {
        fetchUsers({ page: 1, limit: 50 });
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => users, [users]);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchUsers({ page: 1, limit: 50, search: search.trim() || undefined });
    };

    const handlePageChange = (page) => {
        fetchUsers({ page, limit: pagination.limit || 50, search: search.trim() || undefined });
    };

    const handleStart = async (targetUserId) => {
        setStartingUserId(targetUserId);
        try {
            const result = await startImpersonation(targetUserId);
            toast.success('Impersonation started');
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
                <h1 className="text-2xl font-semibold tracking-tight">Impersonation</h1>
                <p className="text-sm text-muted-foreground">
                    Admin-only tool to switch into any user account for support and verification.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select a user</CardTitle>
                    <CardDescription>Search all users. The backend blocks nested and self impersonation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, email, or phone"
                                className="ps-9"
                                data-testid="impersonation-search-input"
                            />
                        </div>
                        <Button type="submit" disabled={loading} data-testid="impersonation-search-button">
                            Search
                        </Button>
                    </form>

                    {loading && users.length === 0 ? (
                        <div className="flex justify-center py-10"><LoadingSpinner /></div>
                    ) : (
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-end">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((target) => {
                                        const isSelf = Number(target.id) === Number(currentUser?.id);
                                        const roles = getUserRoles(target);
                                        return (
                                            <TableRow key={target.id} data-testid={`impersonation-user-row-${target.id}`}>
                                                <TableCell>
                                                    <div className="font-medium">{target.name || 'Unnamed user'}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {target.id}</div>
                                                </TableCell>
                                                <TableCell>{target.email || '—'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {roles.length > 0 ? roles.map((role) => <Badge key={role} variant="secondary">{role}</Badge>) : <span className="text-muted-foreground">—</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {target.confirmed === false ? <Badge variant="outline">Unconfirmed</Badge> : <Badge variant="secondary">Active</Badge>}
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
                                                        {startingUserId === target.id ? 'Starting…' : isSelf ? 'Current user' : 'Impersonate'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!loading && filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No users found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => handlePageChange(pagination.page - 1)}>Previous</Button>
                            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
                            <Button type="button" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => handlePageChange(pagination.page + 1)}>Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
