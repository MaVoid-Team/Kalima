import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function UsersTable({ users, loading, selectedIds = [], onSelect, onSelectAll, onDeleteReq }) {
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
                <p>{t('table.noUsersFound')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border custom-scrollbar">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                                checked={users.length > 0 && selectedIds.length === users.length}
                                onCheckedChange={onSelectAll}
                                aria-label="Select all users"
                                data-testid="users-table-select-all"
                            />
                        </TableHead>
                        <TableHead>{t('table.name')}</TableHead>
                        <TableHead>{t('table.email')}</TableHead>
                        <TableHead>{t('table.phone')}</TableHead>
                        <TableHead>{t('table.role')}</TableHead>
                        <TableHead>{t('table.status')}</TableHead>
                        <TableHead>{t('table.joined')}</TableHead>
                        <TableHead>{t('table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const displayEmail = user.email?.includes('_deleted_') ? user.email.split('_deleted_')[0] : user.email;
                        const displayPhone = user.phone?.includes('_deleted_') ? user.phone.split('_deleted_')[0] : user.phone;

                        return (
                            <TableRow
                                key={user.id}
                                data-state={selectedIds.includes(user.id) && 'selected'}
                                data-testid={`users-table-row-${user.id}`}
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                                        checked={selectedIds.includes(user.id)}
                                        onCheckedChange={(checked) => onSelect?.(user.id, checked)}
                                        aria-label={`Select user ${user.name}`}
                                        data-testid={`users-table-select-${user.id}`}
                                    />
                                </TableCell>
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
                                <TableCell dir="ltr">{displayEmail || '—'}</TableCell>
                                <TableCell dir="ltr">{displayPhone || '—'}</TableCell>
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
                                    {user.is_deleted ? (
                                        <Badge variant="destructive">
                                            {t('status.deleted', 'Deleted')}
                                        </Badge>
                                    ) : user.is_email_verified ? (
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
                                    {user.created_at
                                        ? format(new Date(user.created_at), 'MMM d, yyyy', { locale: isRtl ? arSA : undefined })
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link to={`/admin/users/${user.id}`} data-testid={`admin-users-table-view-link-${user.id}`}>
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                <span className="sr-only">{t('actions.view')}</span>
                                            </Link>
                                        </Button>
                                        {!user.is_deleted && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteReq?.(user);
                                                }}
                                                data-testid={`admin-users-table-delete-btn-${user.id}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">{t('actions.delete', 'Delete')}</span>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
