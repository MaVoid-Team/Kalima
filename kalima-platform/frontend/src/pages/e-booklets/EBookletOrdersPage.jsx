import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import OrdersPageHeader from "@/components/orders/OrdersPageHeader";
import OrdersStatusFilter from "@/components/orders/OrdersStatusFilter";
import EBookletOrderCard from "@/components/e-booklets/EBookletOrderCard";
import { useEBookletOrders } from "@/hooks/useEBooklets";
import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  generatePaginationLinks,
} from "@/components/ui/pagination";
import {
  E_BOOKLET_ORDER_TEACHER_FILTER_STATUSES,
  E_BOOKLET_STORE_ROUTE,
  E_BOOKLET_TEACHER_LIBRARY_ROUTE,
} from "./eBookletOrdersContract.mjs";

export default function EBookletOrdersPage() {
  const { t } = useTranslation("eBooklets");
  const { orders, pagination, filters, fetchOrders, setStatus, setPage, loading, error } = useEBookletOrders();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchOrders().catch(() => {});
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPage(newPage);
  };

  const statusOptions = [
    { value: "all", label: t("orders.status.all", "All Orders") },
    ...E_BOOKLET_ORDER_TEACHER_FILTER_STATUSES.map((status) => ({
      value: status,
      label: t(`orders.statuses.${status}`, status.replaceAll("_", " ")),
    })),
  ];

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 animate-fade-in md:px-6" data-testid="e-booklet-orders-page">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <OrdersPageHeader
          title={t("orders.title", "My teacher e-booklet orders")}
          subtitle={t("orders.description", "Track teacher e-booklet purchases from checkout through admin customization and delivery.")}
        />

        <OrdersStatusFilter
          statusOptions={statusOptions}
          filters={filters}
          onStatusChange={setStatus}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link to={E_BOOKLET_STORE_ROUTE}>{t("orders.openStore", "Browse e-booklets")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={E_BOOKLET_TEACHER_LIBRARY_ROUTE}>{t("orders.openLibrary", "Open teacher e-booklets")}</Link>
        </Button>
      </div>

      <div className="min-h-100">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error?.response?.data?.message || t("orders.loadError", "Could not load e-booklet orders.")}
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {orders.map((order) => (
              <EBookletOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 py-20 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              {filters.status && filters.status !== "all" ? (
                <PackageOpen className="h-12 w-12 text-primary opacity-80" />
              ) : (
                <BookOpenCheck className="h-12 w-12 text-primary opacity-80" />
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              {t("orders.emptyTitle", "No e-booklet orders yet")}
            </h3>
            <p className="max-w-sm text-muted-foreground">
              {filters.status && filters.status !== "all"
                ? t("orders.noOrdersForStatus", "You have no e-booklet orders with this status.")
                : t("orders.emptyDescription", "Browse e-booklets and submit your first teacher-customized purchase request.")}
            </p>
            {(!filters.status || filters.status === "all") && (
              <Button asChild className="mt-4">
                <Link to={E_BOOKLET_STORE_ROUTE}>{t("common.browse", "Browse E-Booklets")}</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  text={t("common.previous", "Previous")}
                  data-testid="e-booklet-orders-pagination-previous-button"
                />
              </PaginationItem>

              {generatePaginationLinks(pagination.page, pagination.pages).map((link, idx) => (
                link === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={link}>
                    <PaginationLink
                      onClick={() => handlePageChange(link)}
                      isActive={pagination.page === link}
                      className="cursor-pointer"
                      data-testid={`e-booklet-orders-pagination-page-${link}-button`}
                    >
                      {link}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  text={t("common.next", "Next")}
                  data-testid="e-booklet-orders-pagination-next-button"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
