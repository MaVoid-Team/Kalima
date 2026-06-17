import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Loader2, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEBookletOrders } from "@/hooks/useEBooklets";
import { useTranslation } from "react-i18next";

const getReference = (order) => order?.purchase_serial || order?.serial || order?.reference || `#${order?.id}`;
const getLinks = (order) => {
  if (Array.isArray(order?.e_booklet_student_purchase_links) && order.e_booklet_student_purchase_links.length > 0) {
    return order.e_booklet_student_purchase_links;
  }
  return [{
    id: `purchase-${order?.id}`,
    status: order?.status,
    template: order?.template,
    booklet_instance: Array.isArray(order?.instances) && order.instances.length > 0 ? order.instances[0] : null,
  }];
};
const getTitle = (link) => link?.booklet_instance?.display_title || link?.booklet_instance?.template?.title || link?.template?.title || "E-booklet";
const getManagementPath = (link) => {
  const instanceId = link?.booklet_instance?.id || link?.booklet_instance_id || link?.instance_id;
  return instanceId ? `/teacher/e-booklets/${instanceId}/invites` : "/teacher/e-booklets";
};

export default function EBookletOrdersPage() {
  const { t } = useTranslation("eBooklets");
  const { orders, pagination, fetchOrders, loading, error } = useEBookletOrders();

  useEffect(() => {
    fetchOrders({ limit: 20 });
  }, [fetchOrders]);

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff_42%)] pt-24 text-foreground">
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-10 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
              {t("orders.badge", { defaultValue: "E-booklet orders" })}
            </Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {t("orders.title", { defaultValue: "My e-booklet orders" })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("orders.description", { defaultValue: "Track pending e-booklet purchases and open your approved e-booklets from one place." })}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/student/e-booklets">{t("orders.openLibrary", { defaultValue: "Open my e-booklets" })}</Link>
          </Button>
        </div>

        {loading && (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.loading", { defaultValue: "Loading..." })}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error?.response?.data?.message || t("orders.loadError", { defaultValue: "Could not load e-booklet orders." })}
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <BookOpenCheck className="mx-auto h-10 w-10 text-emerald-800" />
            <h2 className="mt-4 text-xl font-bold">{t("orders.emptyTitle", { defaultValue: "No e-booklet orders yet" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("orders.emptyDescription", { defaultValue: "Browse e-booklets and submit your first purchase." })}</p>
            <Button asChild className="mt-5">
              <Link to="/e-booklets">{t("common.browse")}</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {orders.map((order) => {
            const links = getLinks(order);
            return (
              <article key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <ReceiptText className="h-4 w-4 text-emerald-800" />
                      <span>{getReference(order)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : null}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit capitalize">{order.status || "pending"}</Badge>
                </div>

                <div className="mt-5 grid gap-3">
                  {links.map((link) => (
                    <div key={link.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{getTitle(link)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("orders.itemStatus", { defaultValue: "Item status" })}: {link.status || order.status || "pending"}
                          </p>
                        </div>
                        {(link.status === "approved" || order.status === "ready" || order.status === "confirmed") && (
                          <Button asChild size="sm">
                            <Link to={getManagementPath(link)}>{t("orders.manageAccess", { defaultValue: "Manage access" })}</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {pagination.total > 0 && (
          <p className="mt-6 text-xs text-muted-foreground">
            {t("orders.count", { defaultValue: "Showing {{count}} e-booklet orders", count: orders.length })}
          </p>
        )}
      </section>
    </main>
  );
}
