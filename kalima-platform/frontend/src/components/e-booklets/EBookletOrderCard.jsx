/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, BookOpenCheck, CalendarDays, CheckCircle2, Clock, MessageCircle, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsappUtils";
import { formatCurrency, formatOrderDate } from "@/lib/storeUtils";
import { cn } from "@/lib/utils";
import EBookletOrderDetailsDialog from "./EBookletOrderDetailsDialog";
import EBookletOrderItemsCollapsible from "./EBookletOrderItemsCollapsible";
import {
  canManageEBookletOrder,
  E_BOOKLET_ORDER_STATUS_TONES,
  E_BOOKLET_ORDER_TRACKING_WHATSAPP_NUMBER,
  getEBookletOrderAmount,
  getEBookletOrderLinks,
  getEBookletOrderManagementPath,
  getEBookletOrderReference,
  getEBookletOrderStatus,
} from "./eBookletOrderUtils";

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
    case "awaiting_payment":
      return <Clock className="h-4 w-4" />;
    case "paid":
      return <Package className="h-4 w-4" />;
    case "needs_branding_info":
    case "customization_in_progress":
      return <RefreshCw className="h-4 w-4" />;
    case "ready":
    case "delivered":
      return <CheckCircle2 className="h-4 w-4" />;
    case "rejected":
    case "cancelled":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function EBookletOrderCard({ order, canManageLink = canManageEBookletOrder, getManagementPath = getEBookletOrderManagementPath }) {
  const { t, i18n } = useTranslation("eBooklets");
  const status = getEBookletOrderStatus(order?.status);
  const reference = getEBookletOrderReference(order);
  const amount = getEBookletOrderAmount(order);
  const links = getEBookletOrderLinks(order);
  const manageableLink = links.find((link) => canManageLink(order, link, status));
  const terminal = ["cancelled", "rejected"].includes(status);
  const trackingMessage = t("orders.trackingMessage", {
    reference,
    defaultValue: "مرحباً، رقم طلب المذكرة الخاص بي هو {{reference}} وأرغب في معرفة حالة الطلب.",
  });
  const trackingLink = buildWhatsAppLink(E_BOOKLET_ORDER_TRACKING_WHATSAPP_NUMBER, trackingMessage);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border transition-all duration-300 hover:border-border/80 hover:shadow-md",
        terminal && "border-muted bg-muted/10 opacity-90",
      )}
      data-testid={`e-booklet-order-card-${order.id}`}
    >
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <BookOpenCheck className="h-4 w-4 text-primary" />
              {reference}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", E_BOOKLET_ORDER_STATUS_TONES[status])}>
              {getStatusIcon(status)}
              {t(`orders.statuses.${status}`, status)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={order.created_at}>{formatOrderDate(order.created_at, i18n.language)}</time>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t(`orders.statusCopy.${status}`, t("orders.statusCopy.unknown", "Waiting for the latest admin status."))}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          <span className="text-sm text-muted-foreground">{t("common.total", "Total")}</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(amount, t)}</span>
          <div className="flex flex-col gap-2 pt-1 sm:items-end">
            <EBookletOrderDetailsDialog order={order} />
            {!terminal && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-success/30 text-success hover:bg-success/10 hover:text-success"
                data-testid={`e-booklet-order-track-${order.id}-button`}
              >
                <a href={trackingLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  {t("orders.trackOrder", "Track Your Order")}
                </a>
              </Button>
            )}
            {manageableLink && (
              <Button asChild size="sm" data-testid={`e-booklet-order-manage-${order.id}-button`}>
                <Link to={getManagementPath(manageableLink)}>{t("orders.manageAccess", "Manage access")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <EBookletOrderItemsCollapsible order={order} />
    </div>
  );
}
