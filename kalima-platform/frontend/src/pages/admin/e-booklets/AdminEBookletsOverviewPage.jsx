import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, PackageCheck, RefreshCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axios";

const statusCards = [
  {
    key: "pending",
    label: "Awaiting payment approval",
    helper: "Pending teacher purchases waiting for admin review",
    tone: "text-amber-600",
    icon: Clock,
    href: "/admin/e-booklets/orders?status=pending",
  },
  {
    key: "paid",
    label: "Ready for delivery setup",
    helper: "Paid purchases that need teacher-specific delivery details",
    tone: "text-blue-600",
    icon: PackageCheck,
    href: "/admin/e-booklets/orders?status=paid",
  },
  {
    key: "customization_in_progress",
    label: "Customization in progress",
    helper: "Open teacher-specific template/document work",
    tone: "text-primary",
    icon: AlertCircle,
    href: "/admin/e-booklets/orders?status=customization_in_progress",
  },
  {
    key: "ready",
    label: "Ready to deliver",
    helper: "Final delivery action is available",
    tone: "text-emerald-600",
    icon: CheckCircle2,
    href: "/admin/e-booklets/orders?status=ready",
  },
  {
    key: "delivered",
    label: "Delivered",
    helper: "Teacher instances already delivered and locked from repeat delivery",
    tone: "text-green-700",
    icon: Truck,
    href: "/admin/e-booklets/orders?status=delivered",
  },
];

async function fetchPurchaseCount(status) {
  const params = new URLSearchParams({ page: "1", limit: "1" });
  if (status) params.set("status", status);
  const response = await axiosInstance.get(`/admin/e-booklet-purchases?${params.toString()}`);
  return Number(response.data?.total ?? response.data?.data?.total ?? 0);
}

export default function AdminEBookletsOverviewPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCounts = async () => {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        statusCards.map(async (card) => [card.key, await fetchPurchaseCount(card.key)]),
      );
      const total = await fetchPurchaseCount("");
      setCounts({ ...Object.fromEntries(entries), total });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Could not load eBooklet overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const activeWorkCount = useMemo(
    () => Number(counts.pending || 0) + Number(counts.paid || 0) + Number(counts.customization_in_progress || 0) + Number(counts.ready || 0),
    [counts],
  );

  return (
    <div className="space-y-6" data-testid="admin-e-booklets-overview-page">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} to={card.href} className="rounded-2xl border bg-background p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <article>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{loading ? "…" : Number(counts[card.key] || 0).toLocaleString()}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${card.tone}`} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
              </article>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Live work queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error
                ? error
                : loading
                  ? "Loading active eBooklet purchase and delivery counts…"
                  : `${activeWorkCount.toLocaleString()} active item${activeWorkCount === 1 ? "" : "s"} need admin attention out of ${Number(counts.total || 0).toLocaleString()} total eBooklet purchases.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadCounts} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/admin/e-booklets/orders">
                Open Orders & Delivery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
