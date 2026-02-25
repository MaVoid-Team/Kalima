import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function UsersTable({ users, loading }) {
    const { t, i18n } = useTranslation('userManagement');
    const isRtl = i18n.dir() === 'rtl';

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center border rounded-md">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!users?.length) {
        return (
            <div className="flex h-48 flex-col items-center justify-center border rounded-md text-muted-foreground">
                <p>No users found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead >{t('table.name')}</TableHead>
                        <TableHead >{t('table.email')}</TableHead>
                        <TableHead >{t('table.phone')}</TableHead>
                        <TableHead >{t('table.role')}</TableHead>
                        <TableHead >{t('table.status')}</TableHead>
                        <TableHead >{t('table.joined')}</TableHead>
                        <TableHead >{t('table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={user.profile_pic_url} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email || '—'}</TableCell>
                            <TableCell>{user.phone || '—'}</TableCell>
                            <TableCell>
                                {user.role ? (
                                    <Badge variant="secondary">
                                        {t(`roles.${user.role}`, user.role)}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {user.is_email_verified ? (
                                    <Badge variant="default">
                                        {t('status.verified', 'Verified')}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">
                                        {t('status.pending', 'Pending')}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                >
                                    <Link to={`/admin/users/${user.id}`} data-testid={`admin-users-table-view-link-${user.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('actions.view')}
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
