/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, formatOrderDate, getImageUrl } from "@/lib/storeUtils";
import {
  canManageEBookletOrder,
  getEBookletOrderAmount,
  getEBookletOrderCurrency,
  getEBookletOrderLinks,
  getEBookletOrderManagementPath,
  getEBookletOrderPaymentScreenshot,
  getEBookletOrderReference,
  getEBookletOrderStatus,
  getEBookletOrderTitle,
} from "./eBookletOrderUtils";

function DetailRow({ label, value }) {
  const displayValue = value === null || value === undefined || value === "" ? "-" : value;
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <span className="col-span-1 text-muted-foreground">{label}</span>
      <span className="col-span-2 wrap-break-word font-medium">{displayValue}</span>
    </div>
  );
}

export default function EBookletOrderDetailsDialog({ order }) {
  const { t, i18n } = useTranslation("eBooklets");
  const reference = getEBookletOrderReference(order);
  const orderStatus = getEBookletOrderStatus(order?.status);
  const links = getEBookletOrderLinks(order);
  const screenshotUrl = getImageUrl(getEBookletOrderPaymentScreenshot(order));
  const amount = getEBookletOrderAmount(order);
  const currency = getEBookletOrderCurrency(order);
  const adminMessage = order?.teacher_message || order?.teacher_facing_notes || order?.rejection_reason || order?.cancellation_reason;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`e-booklet-order-details-${order?.id}-button`}>
          {t("orders.actions.viewDetails", "View details")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl" dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle>
            {t("orders.details.title", "E-booklet order details")} - {reference}
          </DialogTitle>
          <DialogDescription>
            {t("orders.submittedAt", { value: formatOrderDate(order?.created_at, i18n.language), defaultValue: "Submitted {{value}}" })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-2 rounded-md border p-4">
            <h4 className="text-sm font-semibold">{t("orders.sections.summary", "Summary")}</h4>
            <DetailRow label={t("common.status", "Status")} value={t(`orders.statuses.${orderStatus}`, orderStatus)} />
            <DetailRow label={t("common.total", "Total")} value={`${formatCurrency(amount, t)}${currency && currency !== "EGP" ? ` ${currency}` : ""}`} />
            <DetailRow label={t("checkout.receiptReference", "Reference")} value={reference} />
          </section>

          <section className="space-y-3 rounded-md border p-4">
            <h4 className="text-sm font-semibold">{t("orders.sections.eBooklet", "E-booklet")}</h4>
            {links.map((link) => {
              const linkStatus = getEBookletOrderStatus(link?.status || order?.status);
              const instance = link?.booklet_instance;
              const version = link?.template_version || instance?.template_version || order?.template_version;
              return (
                <div key={link.id} className="space-y-2 rounded-md border p-3">
                  <DetailRow label={t("common.eBooklet", "E-Booklet")} value={getEBookletOrderTitle(link, t("orders.fallbackTitle", "E-booklet"))} />
                  <DetailRow label={t("common.status", "Status")} value={t(`orders.statuses.${linkStatus}`, linkStatus)} />
                  <DetailRow label={t("common.version", "Version")} value={version?.version_number ? `v${version.version_number}` : null} />
                  <DetailRow label={t("common.pages", "Pages")} value={version?.page_count || instance?.template_version?.page_count} />
                  <DetailRow label={t("teacher.expiry", "Expiry")} value={instance?.access_expires_at ? formatOrderDate(instance.access_expires_at, i18n.language) : t("teacher.invites.noExpiry", "No expiry")} />
                  {canManageEBookletOrder(orderStatus, link) && (
                    <Button asChild size="sm" className="mt-1">
                      <Link to={getEBookletOrderManagementPath(link)}>{t("orders.manageAccess", "Manage access")}</Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </section>

          <section className="space-y-2 rounded-md border p-4">
            <h4 className="text-sm font-semibold">{t("orders.sections.payment", "Payment")}</h4>
            <DetailRow label={t("common.payment", "Payment")} value={t(`orders.statuses.${orderStatus}`, orderStatus)} />
            <DetailRow label={t("checkout.fields.notes", "Notes")} value={order?.notes} />
            {screenshotUrl && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="col-span-1 text-muted-foreground">{t("inviteAccept.paymentScreenshot", "Payment proof screenshot")}</span>
                <div className="col-span-2">
                  <img
                    src={screenshotUrl}
                    alt={t("inviteAccept.paymentScreenshot", "Payment proof screenshot")}
                    className="h-32 w-32 rounded-md border object-cover"
                  />
                </div>
              </div>
            )}
          </section>

          {adminMessage && (
            <section className="space-y-2 rounded-md border p-4">
              <h4 className="text-sm font-semibold">{t("orders.sections.adminMessage", "Admin message")}</h4>
              <p className="text-sm text-muted-foreground">{adminMessage}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
