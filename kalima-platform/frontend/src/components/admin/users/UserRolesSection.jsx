import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Trash2, Plus } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROLES, PORTALS } from '@/lib/adminConstants';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function UserRolesSection({ roles, onAddRole, onRevokeRole, actionLoading }) {
    const { t, i18n } = useTranslation('userManagement');
    const isRtl = i18n.dir() === 'rtl';

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [revokeData, setRevokeData] = useState(null);
    const [newPortal, setNewPortal] = useState('');
    const [newRole, setNewRole] = useState('');

    const handleAddSubmit = async () => {
        if (!newPortal || !newRole) return;
        await onAddRole(newPortal, newRole);
        setIsAddOpen(false);
        setNewPortal('');
        setNewRole('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t('details.rolesTitle')}
                </h3>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2" data-testid="admin-users-roles-add-button">
                            <Plus className="h-4 w-4" />
                            {t('actions.addRole')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('actions.addRole')}</DialogTitle>
                            <DialogDescription>
                                Assign a new role to this user for a specific portal.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">{t('details.portal')}</label>
                                <Select value={newPortal} onValueChange={setNewPortal}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select portal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PORTALS.map(portal => (
                                            <SelectItem key={portal} value={portal}>
                                                {t(`portals.${portal}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">{t('details.role')}</label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map(role => (
                                            <SelectItem key={role} value={role}>
                                                {t(`roles.${role}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={actionLoading} data-testid="admin-users-roles-add-cancel">
                                {t('common:cancel')}
                            </Button>
                            <Button
                                onClick={handleAddSubmit}
                                disabled={!newPortal || !newRole || actionLoading}
                                className="min-w-[100px]"
                                data-testid="admin-users-roles-add-submit"
                            >
                                {actionLoading ? <LoadingSpinner className="h-4 w-4" /> : t('common:confirm')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('details.portal')}</TableHead>
                            <TableHead>{t('details.role')}</TableHead>
                            <TableHead className="text-end">{t('table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!roles?.length ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    {t('messages.noRoles')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((roleObj, idx) => (
                                <TableRow key={`${roleObj.portal}-${roleObj.role}-${idx}`}>
                                    <TableCell className="font-medium">
                                        {t(`portals.${roleObj.portal}`, roleObj.portal)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {t(`roles.${roleObj.role}`, roleObj.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='flex justify-end items-center'>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setRevokeData({ portal: roleObj.portal, role: roleObj.role })}
                                            disabled={actionLoading}
                                            className="h-8 gap-1 px-2"
                                            data-testid={`admin-users-roles-revoke-${roleObj.portal}-${roleObj.role}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t('actions.revoke')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!revokeData} onOpenChange={(open) => !open && setRevokeData(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('actions.revokeRole') || 'Revoke Role'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('messages.revokeConfirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading} data-testid="admin-users-roles-revoke-cancel">{t('common:cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                onRevokeRole(revokeData?.portal, revokeData?.role).then(() => setRevokeData(null));
                            }}
                            disabled={actionLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="admin-users-roles-revoke-submit"
                        >
                            {actionLoading ? <LoadingSpinner className="h-4 w-4" /> : t('actions.revoke')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
