import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserMinus, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useChildren } from '@/hooks/parent/useChildren';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function ChildrenManager() {
    const { t } = useTranslation(['parent', 'common']);
    const { children, loading, linkChild, unlinkChild } = useChildren();

    const [studentId, setStudentId] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [unlinkingId, setUnlinkingId] = useState(null);
    const [pendingUnlinkId, setPendingUnlinkId] = useState(null);

    const handleLinkChild = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) return;

        setIsLinking(true);
        const success = await linkChild(Number(studentId));
        setIsLinking(false);

        if (success) {
            setStudentId('');
        }
    };

    const handleUnlinkConfirm = async () => {
        if (!pendingUnlinkId) return;
        setUnlinkingId(pendingUnlinkId);
        await unlinkChild(pendingUnlinkId);
        setUnlinkingId(null);
        setPendingUnlinkId(null);
    };

    return (
        <>
            {/* Unlink Confirmation Dialog */}
            <AlertDialog open={!!pendingUnlinkId} onOpenChange={(open) => !open && setPendingUnlinkId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('parent:children.unlinkTitle', 'Unlink Student?')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('parent:children.unlinkDesc', 'This will remove the link between you and this student. You can re-link them at any time.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common:actions.cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnlinkConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="parent-children-button-confirm-unlink"
                        >
                            {t('parent:children.unlink', 'Unlink')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t('parent:children.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('parent:children.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLinkChild} className="flex gap-4 items-end mb-6">
                        <div className="flex-1 max-w-sm">
                            <Label htmlFor="student_user_id">{t('parent:children.studentId')}</Label>
                            <Input
                                id="student_user_id"
                                data-testid="parent-children-input-student-id"
                                type="number"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder={t('parent:children.enterStudentId')}
                                className="mt-1"
                                disabled={isLinking}
                            />
                        </div>
                        <Button type="submit" disabled={!studentId.trim() || isLinking} data-testid="parent-children-button-link">
                            {isLinking ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Plus className="h-4 w-4 me-2" />}
                            {t('parent:children.link')}
                        </Button>
                    </form>

                    {loading ? (
                        <div className="flex justify-center py-6">
                            <LoadingSpinner className="h-6 w-6 text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {children && children.length > 0 ? (
                                children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg text-card-foreground"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {child.student?.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {child.student?.name || `${t('parent:children.childId')}: ${child.student_user_id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {child.student?.email || ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setPendingUnlinkId(child.id)}
                                            disabled={unlinkingId === child.id}
                                            data-testid={`parent-children-button-unlink-${child.id}`}
                                        >
                                            {unlinkingId === child.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserMinus className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">{t('parent:children.unlink')}</span>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg border border-border border-dashed">
                                    {t('parent:children.noChildren')}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
