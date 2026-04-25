import React, { useState } from 'react';
import { Shield, Plus, ShieldAlert, GraduationCap, ShoppingBag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export default function UserRolesCard({
    roles = [],
    onRevoke,
    onAssign,
    hasAdminAccess,
    t
}) {
    const { i18n } = useTranslation();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newRole, setNewRole] = useState({ portal: '', role: '' });

    const handleAssign = () => {
        if (!newRole.portal || !newRole.role) return;
        onAssign(newRole.portal, newRole.role);
        setIsAddOpen(false);
    };

    const getPortalConfig = (portal) => {
        const p = portal.toLowerCase();
        if (p === 'academy') return { icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        if (p === 'store') return { icon: ShoppingBag, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
        return { icon: Shield, color: 'bg-primary/5 text-primary border-primary/20' };
    };

    return (
        <Card className="shadow-sm border-primary/10 overflow-hidden" data-testid="user-detail-roles-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t('details.roles')}
                </CardTitle>

                {hasAdminAccess && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                                <Plus className="h-4 w-4" />
                                {t('details.assignRole')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>{t('actions.addRole')}</DialogTitle>
                                <DialogDescription>
                                    {t('actions.addRoleDescription')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('details.selectPortal')}</label>
                                    <Select
                                        dir={i18n.dir()}
                                        value={newRole.portal}
                                        onValueChange={(val) => {
                                            const defaultRole = val === 'store' ? 'Lecturer' : 'Student';
                                            setNewRole({ portal: val, role: defaultRole });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('details.selectPortal')} />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="academy">{t('portals.academy')}</SelectItem>
                                            <SelectItem value="store">{t('portals.store')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">{t('details.roles')}</label>
                                    <Select
                                        dir={i18n.dir()}
                                        value={newRole.role}
                                        onValueChange={(val) => setNewRole({ ...newRole, role: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('details.selectRole')} />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {newRole.portal === 'academy' ? (
                                                <>
                                                    <SelectItem value="Teacher">{t('roles.Teacher')}</SelectItem>
                                                    <SelectItem value="Student">{t('roles.Student')}</SelectItem>
                                                    <SelectItem value="Assistant">{t('roles.Assistant')}</SelectItem>
                                                    <SelectItem value="Parent">{t('roles.Parent')}</SelectItem>
                                                </>
                                            ) : (
                                                <SelectItem value="Lecturer">{t('roles.Lecturer')}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t('actions.cancel')}</Button>
                                <Button onClick={handleAssign}>{t('actions.confirm')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3">
                    {roles.length > 0 ? (
                        roles.map((r, i) => {
                            const config = getPortalConfig(r.portal);
                            const Icon = config.icon;
                            return (
                                <div key={i} className="group relative">
                                    <Badge variant="outline" className={`pl-2 pr-3 py-1.5 text-sm font-medium gap-2 transition-all group-hover:shadow-md ${config.color}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="opacity-70 text-[10px] uppercase font-bold">{r.portal}:</span>
                                        {t(`roles.${r.role}`, r.role)}
                                    </Badge>
                                    {hasAdminAccess && (
                                        <button
                                            onClick={() => onRevoke(r.portal, r.role)}
                                            className="absolute -top-1.5 -right-1 hidden group-hover:flex h-5 w-5 rounded-full bg-destructive text-white items-center justify-center border-2 border-background shadow-lg hover:scale-110 transition-transform z-10"
                                            title={t('actions.revoke')}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 w-full text-center border-2 border-dashed rounded-xl border-muted/30 bg-muted/5">
                            <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                                <ShieldAlert className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t('details.noRoles')}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{t('details.assignRolePrompt', 'Assign a role to get started')}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
