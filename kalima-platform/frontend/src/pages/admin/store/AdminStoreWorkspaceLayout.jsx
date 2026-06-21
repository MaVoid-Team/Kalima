import { Link, Outlet, useLocation } from "react-router-dom";
import { FolderOpen, LayoutGrid, Package, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

const tabs = [
  { labelKey: "storeWorkspace.tabs.products", href: "/admin/products", icon: Package, testId: "products" },
  { labelKey: "storeWorkspace.tabs.orders", href: "/admin/orders", icon: ShoppingCart, testId: "orders" },
  { labelKey: "storeWorkspace.tabs.samples", href: "/admin/samples", icon: FolderOpen, testId: "samples" },
  { labelKey: "storeWorkspace.tabs.categories", href: "/admin/categories", icon: LayoutGrid, testId: "categories" },
];

export default function AdminStoreWorkspaceLayout() {
  const { t } = useTranslation("admin");
  const { pathname } = useLocation();

  return (
    <div className="space-y-6" data-testid="admin-store-workspace">
      <section className="rounded-3xl border border-primary/15 bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{t("storeWorkspace.kicker")}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("storeWorkspace.title")}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {t("storeWorkspace.description")}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-2">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("storeWorkspace.tabsLabel")}
          </p>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={t("storeWorkspace.navLabel")}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-testid={`admin-store-tab-${tab.testId}`}
                >
                  <Icon className="h-4 w-4" />
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <Outlet />
    </div>
  );
}
