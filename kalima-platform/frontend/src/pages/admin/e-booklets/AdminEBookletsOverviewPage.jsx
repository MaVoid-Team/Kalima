import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, PackageCheck, RefreshCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axios";

const statusCards = [
  {
    key: "pending",
    labelKey: "admin.overview.cards.pending.label",
    helperKey: "admin.overview.cards.pending.helper",
    tone: "text-amber-600",
    icon: Clock,
    href: "/admin/e-booklets/orders?status=pending",
  },
  {
    key: "paid",
    labelKey: "admin.overview.cards.paid.label",
    helperKey: "admin.overview.cards.paid.helper",
    tone: "text-blue-600",
    icon: PackageCheck,
    href: "/admin/e-booklets/orders?status=paid",
  },
  {
    key: "customization_in_progress",
    labelKey: "admin.overview.cards.customization_in_progress.label",
    helperKey: "admin.overview.cards.customization_in_progress.helper",
    tone: "text-primary",
    icon: AlertCircle,
    href: "/admin/e-booklets/orders?status=customization_in_progress",
  },
  {
    key: "ready",
    labelKey: "admin.overview.cards.ready.label",
    helperKey: "admin.overview.cards.ready.helper",
    tone: "text-emerald-600",
    icon: CheckCircle2,
    href: "/admin/e-booklets/orders?status=ready",
  },
  {
    key: "delivered",
    labelKey: "admin.overview.cards.delivered.label",
    helperKey: "admin.overview.cards.delivered.helper",
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
  const { t } = useTranslation("eBooklets");
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
      setError(err?.response?.data?.message || err?.message || t("admin.overview.loadError"));
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
                    <p className="text-sm text-muted-foreground">{t(card.labelKey)}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{loading ? "…" : Number(counts[card.key] || 0).toLocaleString()}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${card.tone}`} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t(card.helperKey)}</p>
              </article>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.overview.liveQueue")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error
                ? error
                : loading
                  ? t("admin.overview.loading")
                  : t("admin.overview.activeSummary", {
                      active: activeWorkCount.toLocaleString(),
                      total: Number(counts.total || 0).toLocaleString(),
                    })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadCounts} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              {t("common.refresh")}
            </Button>
            <Button asChild>
              <Link to="/admin/e-booklets/orders">
                {t("admin.overview.openOrders")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
