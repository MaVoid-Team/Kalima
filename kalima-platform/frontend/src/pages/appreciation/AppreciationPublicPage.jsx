import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { HeartHandshake, Languages, MessageCircleHeart } from 'lucide-react';

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

    useEffect(() => {
        const nextLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
        document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = nextLang;
    }, [i18n.language]);

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

    const toggleLanguage = () => {
        const nextLang = i18n.language?.startsWith('ar') ? 'en' : 'ar';
        i18n.changeLanguage(nextLang);
    };

    const comments = pageData?.comments || [];
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(208,235,255,0.8),_transparent_50%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_55%,_#f5f7fb_100%)]">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(208,235,255,0.8),_transparent_45%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_55%,_#f5f7fb_100%)] px-4 py-10 md:px-6 md:py-14">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <section className="overflow-hidden rounded-[36px] border border-primary/15 bg-white/92 shadow-[0_30px_90px_-46px_rgba(15,23,42,0.35)] backdrop-blur">
                    <div className="relative p-6 md:p-8 lg:p-10">
                        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(59,130,246,0),rgba(59,130,246,0.22),rgba(59,130,246,0))]" />
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-start gap-6 lg:items-center lg:text-center">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
                                    <HeartHandshake className="h-4 w-4" />
                                    {t('public.badge')}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/70">
                                        {t('public.eyebrow')}
                                    </p>
                                    <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                                        {t('public.headline', { name: pageData?.user?.name || t('preview.someone') })}
                                    </h1>
                                    <p className="mx-auto max-w-[68ch] text-lg leading-8 text-slate-600">
                                        {t('public.body', { name: pageData?.user?.name || t('preview.someone') })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                                <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.9),transparent_40%),linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))] p-6 md:p-8">
                                    <div className="flex h-full flex-col justify-between gap-8">
                                        <div className="space-y-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                                                {t('public.appreciationLabel')}
                                            </p>
                                            <p className="max-w-[20ch] text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                                                {t('public.appreciationStatement', { name: pageData?.user?.name || t('preview.someone') })}
                                            </p>
                                            <p className="max-w-[44ch] text-base leading-8 text-slate-600">
                                                {t('public.appreciationNote', { name: pageData?.user?.name || t('preview.someone') })}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-white/80 bg-white/80 px-5 py-5 shadow-[0_16px_40px_-34px_rgba(37,99,235,0.45)]">
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('public.recipientLabel')}</p>
                                                <p className="text-2xl font-semibold leading-tight text-slate-950">{pageData?.user?.name}</p>
                                            </div>
                                            {comments.length > 0 ? (
                                                <p className="max-w-[24ch] text-sm leading-6 text-slate-500 lg:text-right">
                                                    {t('public.commentPresence', { count: comments.length })}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[32px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-6 md:p-7">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
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
                                                className="border-slate-300 bg-white"
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
                                                className="min-h-44 resize-y border-slate-300 bg-white"
                                            />
                                        </div>
                                        <Button type="submit" disabled={submitting} className="min-w-40">
                                            {submitting ? <LoadingSpinner className="h-4 w-4" /> : t('form.submit')}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur md:p-8">
                    <div className="mb-8 flex items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">{t('public.commentFeedTitle')}</h2>
                            <p className="text-sm text-slate-500">{t('public.commentFeedCount', { count: comments.length })}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {t('public.commentFeedSubtitle', { name: pageData?.user?.name || t('preview.someone') })}
                            </p>
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
                                <article key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
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
                </section>

                <div className="flex justify-end px-1">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-slate-400 opacity-55 transition hover:bg-white/70 hover:text-slate-600 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label={t('public.languageToggle')}
                        title={t('public.languageToggle')}
                    >
                        <Languages className="h-3.5 w-3.5" />
                        <span>{i18n.language?.startsWith('ar') ? 'English' : 'العربية'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
