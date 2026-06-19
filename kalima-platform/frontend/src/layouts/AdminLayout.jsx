import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';

export default function AdminLayout() {
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
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Main Column */}
            <div className="flex flex-1 flex-col min-w-0">
                <button
                    type="button"
                    className="fixed bottom-4 start-4 z-30 rounded-full border border-border bg-background p-3 text-muted-foreground shadow-lg focus:outline-none lg:hidden"
                    onClick={() => setIsMobileOpen(true)}
                    data-testid="admin-layout-mobile-sidebar-button"
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-12 lg:p-16" data-testid="admin-layout-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
