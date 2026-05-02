import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Users, LogOut, Home, Globe, Moon, Sun, ChevronLeft, Menu, X, Package, FileText, Ticket, LayoutGrid, Settings, CreditCard, FormInput, BarChart3, Activity, Bell } from 'lucide-react';
import useAuth from '@/hooks/auth/useAuth';

const ADMIN_THEME_STORAGE_KEY = 'adminTheme';

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { t, i18n } = useTranslation(['admin', 'userManagement']);
  const { logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [theme, setTheme] = useState('light');

  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const savedTheme = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    return () => {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Using userManagement namespace explicitly for the users translation
  const navigation = [
    { name: t('nav.dashboard', 'Dashboard'), href: '/admin/dashboard', icon: Home, id: 'dashboard' },
    { name: t('nav.analytics', 'Analytics'), href: '/admin/analytics', icon: BarChart3, id: 'analytics' },
    { name: t('nav.employeePerformance', 'Employee Performance'), href: '/admin/employee-performance', icon: Activity, id: 'employee-performance' },
    { name: t('nav.orders'), href: '/admin/orders', icon: ShoppingCart, id: 'orders' },
    { name: t('nav.products'), href: '/admin/products', icon: Package, id: 'products' },
    { name: t('nav.samples'), href: '/admin/samples', icon: FileText, id: 'samples' },
    { name: t('nav.coupons'), href: '/admin/coupons', icon: Ticket, id: 'coupons' },
    { name: t('nav.categories'), href: '/admin/categories', icon: LayoutGrid, id: 'categories' },
    { name: t('nav.requiredFields'), href: '/admin/required-fields', icon: FormInput, id: 'required-fields' },
    { name: t('nav.paymentMethods', 'Payment Methods'), href: '/admin/payment-methods', icon: CreditCard, id: 'payment-methods' },
    { name: t('userManagement:usersList', 'Users'), href: '/admin/users', icon: Users, id: 'users' },
    { name: t('nav.settings'), href: '/admin/settings', icon: Settings, id: 'settings' },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Calculate width class
  const widthClass = isCollapsed ? "w-64 lg:w-20" : "w-64";

  return (
    <aside
      className={`fixed inset-y-0 start-0 z-50 ${widthClass} transform bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"}`}
    >
      {/* Header + Toggles */}
      <div
        className={`flex h-16 items-center px-4 border-b border-sidebar-border ${isCollapsed ? "lg:justify-center justify-between" : "justify-between"}`}
      >
        <span
          className={`text-lg font-bold truncate ${isCollapsed ? "lg:hidden" : ""}`}
        >
          {t("dashboardTitle")}
        </span>

        <div className="flex items-center gap-2">
          {/* Desktop/Tablet Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5 hidden lg:block"
            title={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            data-testid="admin-sidebar-mobile-toggle-button"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close Toggle */}
          <button
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5"
            onClick={() => setIsMobileOpen(false)}
            title={t('nav.closeSidebar')}
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
              key={item.href}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              data-testid={`admin-sidebar-nav-${item.id}`}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${isCollapsed ? "lg:justify-center" : ""}`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? "lg:me-0" : ""}`}
                aria-hidden="true"
              />
              <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                {item.name}
              </span>
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

        <button
          onClick={toggleTheme}
          title={isCollapsed ? t('nav.themeToggle') : undefined}
          className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? 'lg:justify-center' : ''}`}
          data-testid="admin-sidebar-theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} />
          ) : (
            <Moon className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? 'lg:me-0' : ''}`} />
          )}
          <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
            {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          </span>
        </button>

        <Link
          to="/market"
          title={isCollapsed ? t("nav.backToStore") : undefined}
          className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? "lg:justify-center" : ""}`}
          data-testid="admin-sidebar-back-store-link"
        >
          <Home
            className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? "lg:me-0" : ""}`}
          />
          <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
            {t("nav.backToStore")}
          </span>
        </Link>

        <button
          onClick={logout}
          title={isCollapsed ? t("nav.logout") : undefined}
          className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 ${isCollapsed ? "lg:justify-center" : ""}`}
          data-testid="admin-sidebar-logout-button"
        >
          <LogOut
            className={`h-5 w-5 shrink-0 me-3 ${isCollapsed ? "lg:me-0" : ""}`}
          />
          <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
            {t("nav.logout")}
          </span>
        </button>
      </div>
    </aside>
  );
}
