import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImpersonationSession, stopImpersonation } from '@/services/impersonationService';

export default function ImpersonationBanner() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [stopping, setStopping] = useState(false);

    useEffect(() => {
        setSession(getImpersonationSession());
    }, []);

    if (!session) return null;

    const actorName = session.actorUser?.name || 'Admin';
    const targetName = session.targetUser?.name || 'user';

    const handleStop = async () => {
        setStopping(true);
        const redirectTo = await stopImpersonation();
        window.dispatchEvent(new Event('auth-session-changed'));
        navigate(redirectTo, { replace: true });
        window.location.reload();
    };

    return (
        <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950 shadow-sm" data-testid="impersonation-banner">
            <div className="min-w-0">
                <strong>Impersonating:</strong> {targetName}
                <span className="mx-2 text-amber-700">•</span>
                <span className="text-amber-800">Original admin: {actorName}</span>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStop}
                disabled={stopping}
                data-testid="stop-impersonation-button"
                className="shrink-0 border-amber-500 bg-white/70 text-amber-950 hover:bg-white"
            >
                <LogOut className="me-2 h-4 w-4" />
                {stopping ? 'Stopping…' : 'Stop impersonation'}
            </Button>
        </div>
    );
}
