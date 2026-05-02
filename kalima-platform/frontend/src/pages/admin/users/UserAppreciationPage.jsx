import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Copy, ExternalLink, HeartHandshake, MessageSquareQuote } from 'lucide-react';

import useAdminAppreciationPage from '@/hooks/admin/useAdminAppreciationPage';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function resolvePublicUrl(publicUrl) {
    if (!publicUrl) {
        return '';
    }

    if (/^https?:\/\//i.test(publicUrl)) {
        return publicUrl;
    }

    return `${window.location.origin}${publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`}`;
}

export default function UserAppreciationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation(['appreciation', 'userManagement']);
    const { page, loading, loadPage } = useAdminAppreciationPage();
    const { selectedUser, fetchUserById, loading: userLoading } = useAdminUsers();

    useEffect(() => {
        if (!id) return;
        fetchUserById(id).catch(() => {});
        loadPage(id).catch(() => {});
    }, [fetchUserById, id, loadPage]);

    const publicUrl = useMemo(() => resolvePublicUrl(page?.publicUrl), [page?.publicUrl]);
    const roleKey = selectedUser?.role || selectedUser?.user_roles?.[0]?.role || null;
    const roleLabel = roleKey ? t(`userManagement:roles.${roleKey}`, roleKey) : null;
    const previewHeadline = t('preview.headline', { name: selectedUser?.name || t('preview.someone') });
    const previewBody = t('preview.body', {
        name: selectedUser?.name || t('preview.someone'),
        role: roleLabel || t('preview.communityMember'),
    });

    const handleCopy = async () => {
        if (!publicUrl) {
            return;
        }

        await navigator.clipboard.writeText(publicUrl);
        toast.success(t('admin.copySuccess'));
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Button variant="ghost" className="w-fit px-0" onClick={() => navigate('/admin/users')}>
                        <ArrowLeft className="me-2 h-4 w-4" />
                        {t('userManagement:details.back')}
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">{t('admin.title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
                    </div>
                </div>
                {publicUrl && (
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleCopy}>
                            <Copy className="me-2 h-4 w-4" />
                            {t('admin.copyLink')}
                        </Button>
                        <Button asChild>
                            <a href={publicUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="me-2 h-4 w-4" />
                                {t('admin.openPublicPage')}
                            </a>
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-background to-background shadow-sm">
                    <CardHeader className="space-y-4 border-b border-primary/10 pb-6">
                        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
                            <HeartHandshake className="me-2 h-3.5 w-3.5" />
                            {t('admin.previewBadge')}
                        </Badge>
                        <div className="space-y-3">
                            <CardTitle className="text-3xl leading-tight">
                                {userLoading ? <Skeleton className="h-10 w-64" /> : previewHeadline}
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-base leading-7 text-foreground/75">
                                {userLoading ? <Skeleton className="h-20 w-full" /> : previewBody}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                        <div className="rounded-2xl border bg-background/80 p-5">
                            <p className="text-sm font-medium text-muted-foreground">{t('admin.previewName')}</p>
                            <p className="mt-2 text-lg font-semibold">{selectedUser?.name || '—'}</p>
                        </div>
                        <div className="rounded-2xl border bg-background/80 p-5">
                            <p className="text-sm font-medium text-muted-foreground">{t('admin.previewRole')}</p>
                            <p className="mt-2 text-lg font-semibold">{roleLabel || t('admin.roleFallback')}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.shareTitle')}</CardTitle>
                            <CardDescription>{t('admin.shareDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('admin.publicLink')}
                                </p>
                                {loading ? (
                                    <Skeleton className="h-5 w-full" />
                                ) : (
                                    <p className="break-all text-sm font-medium">{publicUrl || '—'}</p>
                                )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border p-4">
                                    <p className="text-sm text-muted-foreground">{t('admin.commentCount')}</p>
                                    <p className="mt-2 text-2xl font-semibold">{page?.commentCount ?? 0}</p>
                                </div>
                                <div className="rounded-xl border p-4">
                                    <p className="text-sm text-muted-foreground">{t('admin.pageStatus')}</p>
                                    <p className="mt-2 text-2xl font-semibold">{t('admin.activeStatus')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquareQuote className="h-5 w-5 text-primary" />
                                {t('admin.notesTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                            <p>{t('admin.notesBody')}</p>
                            <p>{t('admin.notesFooter')}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
