import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import TeacherSidebar from '../components/teacher/TeacherSidebar';

export default function TeacherLayout() {
    const { t } = useTranslation('teacher');
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
            <TeacherSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Main Column */}
            <div className="flex flex-1 flex-col min-w-0">
                <button
                    type="button"
                    className="fixed start-4 top-4 z-30 rounded-md border border-border bg-background p-2 text-muted-foreground shadow-sm focus:outline-none lg:hidden"
                    onClick={() => setIsMobileOpen(true)}
                    data-testid="teacher-layout-mobile-sidebar-button"
                >
                    <span className="sr-only">{t('layout.openSidebar', 'Open sidebar')}</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Main Content Area */}
                <main className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-8 lg:p-10 xl:p-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
