import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import ParentSidebar from '../components/parent/ParentSidebar';

export default function ParentLayout() {
    const { t } = useTranslation('parent');
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <ParentSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Main Column */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="text-muted-foreground border-border px-2 focus:outline-none lg:hidden -ms-2"
                        onClick={() => setIsMobileOpen(true)}
                        data-testid="parent-layout-mobile-sidebar-button"
                    >
                        <span className="sr-only">{t('layout.openSidebar', 'Open sidebar')}</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1">
                            {/* Potential breadcrumb or something */}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-12 lg:p-16" data-testid="parent-layout-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
