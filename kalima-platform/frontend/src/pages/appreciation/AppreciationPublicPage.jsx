import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { HeartHandshake, MessageCircleHeart } from 'lucide-react';

import usePublicAppreciationPage from '@/hooks/usePublicAppreciationPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/ui/loading-spinner';

function ensureRobotsMetaTag() {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', 'noindex, nofollow');
    return meta;
}

export default function AppreciationPublicPage() {
    const { token } = useParams();
    const { t, i18n } = useTranslation(['appreciation', 'userManagement']);
    const { pageData, loading, submitting, loadPage, submitComment } = usePublicAppreciationPage();
    const [authorName, setAuthorName] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!token) {
            return;
        }

        loadPage(token).catch(() => {});
    }, [loadPage, token]);

    useEffect(() => {
        const previousTitle = document.title;
        const robotsMeta = ensureRobotsMetaTag();
        document.title = pageData?.user?.name
            ? t('seo.title', { name: pageData.user.name })
            : t('seo.fallbackTitle');

        return () => {
            document.title = previousTitle;
            robotsMeta.setAttribute('content', 'index, follow');
        };
    }, [pageData?.user?.name, t]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token) {
            return;
        }

        const created = await submitComment(token, { authorName, comment });
        if (created) {
            setAuthorName('');
            setComment('');
        }
    };

    const comments = pageData?.comments || [];
    const roleLabel = pageData?.user?.roleLabel
        ? t(`userManagement:roles.${pageData.user.roleLabel.replace(/\s+/g, '')}`, pageData.user.roleLabel)
        : t('preview.communityMember');

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(208,235,255,0.8),_transparent_50%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_55%,_#f5f7fb_100%)]">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(208,235,255,0.8),_transparent_45%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_55%,_#f5f7fb_100%)] px-4 py-10 md:px-6 md:py-14">
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
                <section className="rounded-[32px] border border-primary/15 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:p-8">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
                        <HeartHandshake className="h-4 w-4" />
                        {t('public.badge')}
                    </div>

                    <div className="space-y-5">
                        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                            {t('public.headline', { name: pageData?.user?.name || t('preview.someone') })}
                        </h1>
                        <p className="max-w-3xl text-lg leading-8 text-slate-600">
                            {t('public.body', {
                                name: pageData?.user?.name || t('preview.someone'),
                                role: roleLabel,
                            })}
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('public.recipientLabel')}</p>
                            <p className="mt-3 text-xl font-semibold text-slate-900">{pageData?.user?.name}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('public.roleLabel')}</p>
                            <p className="mt-3 text-xl font-semibold text-slate-900">{roleLabel}</p>
                        </div>
                    </div>

                    <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <MessageCircleHeart className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">{t('public.commentsTitle')}</h2>
                                <p className="text-sm text-slate-500">{t('public.commentsSubtitle')}</p>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="authorName">{t('form.authorName')}</Label>
                                <Input
                                    id="authorName"
                                    value={authorName}
                                    onChange={(event) => setAuthorName(event.target.value)}
                                    placeholder={t('form.authorNamePlaceholder')}
                                    maxLength={80}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comment">{t('form.comment')}</Label>
                                <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder={t('form.commentPlaceholder')}
                                    maxLength={1000}
                                    required
                                    className="min-h-36 resize-y"
                                />
                            </div>
                            <Button type="submit" disabled={submitting} className="min-w-36">
                                {submitting ? <LoadingSpinner className="h-4 w-4" /> : t('form.submit')}
                            </Button>
                        </form>
                    </div>
                </section>

                <aside className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur md:p-8">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">{t('public.commentFeedTitle')}</h2>
                            <p className="text-sm text-slate-500">{t('public.commentFeedCount', { count: comments.length })}</p>
                        </div>
                    </div>

                    {comments.length === 0 ? (
                        <Card className="border-dashed bg-slate-50/80 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">{t('public.emptyTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm leading-6 text-slate-500">
                                {t('public.emptyBody')}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((entry) => (
                                <article key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-950">{entry.authorName}</p>
                                            <p className="text-xs text-slate-500">
                                                {entry.createdAt ? format(new Date(entry.createdAt), 'PPp', { locale: i18n.dir() === 'rtl' ? arSA : undefined }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{entry.comment}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
