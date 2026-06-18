import { Link, Outlet, useLocation } from "react-router-dom";
import { BarChart3, BookOpenCheck, ClipboardList, LayoutGrid, Settings, ShieldCheck } from "lucide-react";

const tabs = [
  { label: "Overview", href: "/admin/e-booklets", icon: BookOpenCheck, exact: true },
  { label: "Catalog", href: "/admin/e-booklets/catalog", icon: LayoutGrid },
  { label: "Orders & Delivery", href: "/admin/e-booklets/orders", icon: ClipboardList },
  { label: "Teacher Access", href: "/admin/e-booklets/access", icon: ShieldCheck },
  { label: "Analytics", href: "/admin/e-booklets/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/e-booklets/settings", icon: Settings },
];

export default function AdminEBookletsWorkspaceLayout() {
  const { pathname } = useLocation();

  return (
    <div className="space-y-6" data-testid="admin-e-booklets-workspace">
      <section className="rounded-3xl border border-primary/15 bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">E-Booklets</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Manage the eBooklet lifecycle from catalog setup to orders, delivery, teacher access, analytics, and settings.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-2">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            E-Booklet workspace tabs
          </p>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="E-Booklet workspace navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`admin-e-booklets-tab-${tab.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
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
