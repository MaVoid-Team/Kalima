import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, Eye, FileText, MessageCircle, MoreHorizontal, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminEBookletPurchaseActions({
  purchase,
  onMarkPaid,
  onUpdateStatus,
  onActionSuccess,
}) {
  const { t, i18n } = useTranslation("eBooklets");
  const [notesOpen, setNotesOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [editableWhatsAppMessage, setEditableWhatsAppMessage] = useState("");
  const status = String(purchase?.status || "");
  const canApprovePayment = ["pending", "awaiting_payment", "customization_in_progress"].includes(status);
  const canWork = !["delivered", "rejected", "cancelled"].includes(status);
  const teacherPhone = purchase?.teacher?.phone?.replaceAll(/\D/g, "");
  const purchaseSerial = `#${purchase?.id ?? "-"}`;
  const eBookletTitle = purchase?.template?.title || "-";
  const version = purchase?.template_version?.version_number ? `v${purchase.template_version.version_number}` : "-";
  const pages = purchase?.template_version?.page_count ?? "-";
  const total = purchase?.final_payable_price ?? purchase?.price ?? 0;
  const currency = purchase?.currency === "EGP" || !purchase?.currency
    ? t("common.currencyEGP", { defaultValue: "EGP" })
    : purchase.currency;

  const whatsAppMessage = [
    t("admin.purchases.whatsappGreeting", { name: purchase?.teacher?.name || "-", defaultValue: "Greetings {{name}}!" }),
    t("admin.purchases.whatsappSuccess", { defaultValue: "Your e-booklet order has been received and is being processed." }),
    t("admin.purchases.whatsappOrderDetails", { serial: purchaseSerial, defaultValue: "E-booklet Order: {{serial}}" }),
    t("admin.purchases.whatsappItems", { defaultValue: "E-booklet details:" }),
    `- ${t("common.name", { defaultValue: "Name" })}: ${eBookletTitle}`,
    `- ${t("common.version", { defaultValue: "Version" })}: ${version}`,
    `- ${t("common.pages", { defaultValue: "Pages" })}: ${pages}`,
    `- ${t("common.status", { defaultValue: "Status" })}: ${t(`statuses.${status}`, { defaultValue: status.replaceAll("_", " ") })}`,
    t("admin.purchases.whatsappTotal", { total, currency, defaultValue: "Total: {{total}} {{currency}}" }),
    t("admin.purchases.whatsappSupport", { defaultValue: "If you have any questions, feel free to contact us." }),
    t("admin.purchases.whatsappClosing", { defaultValue: "Thank you for choosing Kalima Platform!" }),
  ].filter(Boolean).join("\n");
  const whatsAppHref = teacherPhone
    ? `https://wa.me/${teacherPhone}?text=${encodeURIComponent(editableWhatsAppMessage || whatsAppMessage)}`
    : "#";

  const run = async (action) => {
    const response = await action();
    onActionSuccess?.(response);
  };

  const openWhatsAppDialog = (event) => {
    event.preventDefault();
    setEditableWhatsAppMessage(whatsAppMessage);
    setWhatsAppOpen(true);
  };

  const sendWhatsAppMessage = () => {
    if (!teacherPhone || whatsAppHref === "#") return;
    window.open(whatsAppHref, "_blank", "noopener,noreferrer");
    setWhatsAppOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.purchases.adminNotes", { defaultValue: "Admin notes" })}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
            {purchase?.admin_notes || "-"}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={whatsAppOpen} onOpenChange={setWhatsAppOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("admin.purchases.editWhatsAppMessage", { defaultValue: "Edit WhatsApp Message" })}</DialogTitle>
            <DialogDescription>
              {t("admin.purchases.editWhatsAppMessageDesc", { defaultValue: "Review and edit the e-booklet message before sending it to the teacher." })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editableWhatsAppMessage}
              onChange={(event) => setEditableWhatsAppMessage(event.target.value)}
              rows={10}
              className="resize-none font-sans text-sm"
              placeholder={t("admin.purchases.whatsappPlaceholder", { defaultValue: "Type your message here..." })}
              data-testid="admin-e-booklet-purchase-whatsapp-message"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsAppOpen(false)}>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={sendWhatsAppMessage} className="bg-success text-success-foreground hover:bg-success/90" data-testid="admin-e-booklet-purchase-whatsapp-send">
              <MessageCircle className="h-4 w-4 me-2" />
              {t("admin.purchases.sendOnWhatsApp", { defaultValue: "Send on WhatsApp" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {purchase?.admin_notes && (
        <Button variant="ghost" size="icon" onClick={() => setNotesOpen(true)} data-testid="admin-e-booklet-purchase-view-note">
          <FileText className="h-4 w-4" />
          <span className="sr-only">{t("admin.purchases.viewNote", { defaultValue: "View note" })}</span>
        </Button>
      )}

      <DropdownMenu dir={i18n.dir()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" data-testid={`admin-e-booklet-purchase-actions-${purchase?.id}`}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t("common.actions", { defaultValue: "Actions" })}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/admin/e-booklets/orders/${purchase.id}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("orders.actions.viewDetails", { defaultValue: "View details" })}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/admin/e-booklets/orders/${purchase.id}/delivery`} className="cursor-pointer">
              <BookOpenCheck className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("admin.purchases.openDelivery", { defaultValue: "Open delivery" })}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {teacherPhone && (
            <DropdownMenuItem onClick={openWhatsAppDialog} className="cursor-pointer text-success focus:bg-success/10 focus:text-success" data-testid="admin-e-booklet-purchase-whatsapp-item">
              <MessageCircle className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("admin.purchases.whatsapp", { defaultValue: "Contact WhatsApp" })}
            </DropdownMenuItem>
          )}
          {canApprovePayment && (
            <DropdownMenuItem onClick={() => run(() => onMarkPaid(purchase))} className="cursor-pointer text-success focus:text-success">
              <CheckCircle2 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("admin.purchases.approvePaymentShort", { defaultValue: "Approve payment" })}
            </DropdownMenuItem>
          )}
          {canWork && status !== "customization_in_progress" && (
            <DropdownMenuItem onClick={() => run(() => onUpdateStatus(purchase, "customization_in_progress"))} className="cursor-pointer">
              {t("common.inProgress", { defaultValue: "In progress" })}
            </DropdownMenuItem>
          )}
          {!["rejected", "delivered"].includes(status) && (
            <DropdownMenuItem onClick={() => run(() => onUpdateStatus(purchase, "rejected"))} className="cursor-pointer text-destructive focus:text-destructive">
              <XCircle className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("orders.statuses.rejected", { defaultValue: "Rejected" })}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
