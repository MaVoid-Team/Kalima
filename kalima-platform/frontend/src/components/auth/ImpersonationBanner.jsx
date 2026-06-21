import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImpersonationSession, stopImpersonation } from '@/services/impersonationService';
import { useTranslation } from 'react-i18next';

export default function ImpersonationBanner() {
    const { t } = useTranslation('admin');
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [stopping, setStopping] = useState(false);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        setSession(getImpersonationSession());
    }, []);

    if (!session) return null;

    const actorName = session.actorUser?.name || t('impersonation.banner.adminFallback');
    const targetName = session.targetUser?.name || t('impersonation.banner.userFallback');

    const handleStop = async () => {
        setStopping(true);
        const redirectTo = await stopImpersonation();
        window.dispatchEvent(new Event('auth-session-changed'));
        navigate(redirectTo, { replace: true });
        window.location.reload();
    };

    if (minimized) {
        return (
            <div className="fixed left-3 top-3 z-[60] flex max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-amber-300 bg-amber-100/95 px-2 py-1 text-sm text-amber-950 shadow-md backdrop-blur" data-testid="impersonation-banner">
                <button
                    type="button"
                    onClick={() => setMinimized(false)}
                    className="inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                    aria-label={t('impersonation.actions.expandBanner')}
                    title={t('impersonation.actions.expandBanner')}
                >
                    <Maximize2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('impersonation.banner.impersonatingUser', { name: targetName })}</span>
                </button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={handleStop}
                    disabled={stopping}
                    data-testid="stop-impersonation-button"
                    className="border-amber-500 bg-white/80 text-amber-950 hover:bg-white"
                    aria-label={t('impersonation.actions.stop')}
                    title={t('impersonation.actions.stop')}
                >
                    <LogOut className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950 shadow-sm" data-testid="impersonation-banner">
            <div className="min-w-0">
                <strong>{t('impersonation.banner.impersonating')}:</strong> {targetName}
                <span className="mx-2 text-amber-700">•</span>
                <span className="text-amber-800">{t('impersonation.banner.originalAdmin', { name: actorName })}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setMinimized(true)}
                    className="border-amber-500 bg-white/70 text-amber-950 hover:bg-white"
                    aria-label={t('impersonation.actions.minimizeBanner')}
                    title={t('impersonation.actions.minimizeBanner')}
                >
                    <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStop}
                    disabled={stopping}
                    data-testid="stop-impersonation-button"
                    className="border-amber-500 bg-white/70 text-amber-950 hover:bg-white"
                >
                    <LogOut className="me-2 h-4 w-4" />
                    {stopping ? t('impersonation.actions.stopping') : t('impersonation.actions.stop')}
                </Button>
            </div>
        </div>
    );
}
