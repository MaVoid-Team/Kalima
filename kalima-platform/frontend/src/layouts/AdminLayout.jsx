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
        <div className="flex h-screen overflow-hidden bg-background">
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
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="text-muted-foreground border-border px-2 focus:outline-none lg:hidden -ml-2"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1">
                            {/* Potential breadcrumb or something */}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20 p-4 sm:p-12 lg:p-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
