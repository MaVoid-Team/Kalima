import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Users, LogOut, Home, Globe, ChevronLeft, ChevronRight, Menu, X, Package } from 'lucide-react';
import useAuth from '@/hooks/auth/useAuth';

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
    const { t, i18n } = useTranslation('admin');
    const { logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const isRtl = i18n.dir() === 'rtl';

    // Using userManagement namespace explicitly for the users translation
    const navigation = [
        { name: t('nav.orders'), href: '/admin/orders', icon: ShoppingCart },
        { name: t('nav.products'), href: '/admin/products', icon: Package },
        { name: i18n.t('userManagement:usersList', 'Users'), href: '/admin/users', icon: Users },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
    };

    // Calculate width class
    const widthClass = isCollapsed ? 'w-64 lg:w-20' : 'w-64';

    return (
        <aside
            className={`fixed inset-y-0 start-0 z-50 ${widthClass} transform bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}
        >
            {/* Header + Toggles */}
            <div className={`flex h-16 items-center px-4 border-b border-sidebar-border ${isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'}`}>
                <span className={`text-lg font-bold truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('dashboardTitle')}</span>

                <div className="flex items-center gap-2">
                    {/* Desktop/Tablet Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5 hidden lg:block"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        data-testid="admin-sidebar-mobile-toggle-button"
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    {/* Mobile Close Toggle */}
                    <button
                        className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5"
                        onClick={() => setIsMobileOpen(false)}
                        title="Close Sidebar"
                        data-testid="admin-sidebar-mobile-close-button"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2 px-2 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            title={isCollapsed ? item.name : undefined}
                            data-testid={`admin-sidebar-nav-${item.name.toLowerCase()}`}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                } ${isCollapsed ? 'lg:justify-center' : ''}`}
                        >
                            <item.icon className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} aria-hidden="true" />
                            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-sidebar-border p-4 space-y-2 mt-auto">
                <button
                    onClick={toggleLanguage}
                    title={isCollapsed ? (i18n.language === 'ar' ? 'English' : 'العربية') : undefined}
                    className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? 'lg:justify-center' : ''}`}
                    data-testid="admin-sidebar-language-toggle"
                >
                    <Globe className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
                </button>

                <Link
                    to="/market"
                    title={isCollapsed ? t('nav.backToStore') : undefined}
                    className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? 'lg:justify-center' : ''}`}
                    data-testid="admin-sidebar-back-store-link"
                >
                    <Home className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('nav.backToStore')}</span>
                </Link>

                <button
                    onClick={logout}
                    title={isCollapsed ? t('nav.logout') : undefined}
                    className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 ${isCollapsed ? 'lg:justify-center' : ''}`}
                    data-testid="admin-sidebar-logout-button"
                >
                    <LogOut className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t('nav.logout')}</span>
                </button>
            </div>
        </aside>
    );
}
