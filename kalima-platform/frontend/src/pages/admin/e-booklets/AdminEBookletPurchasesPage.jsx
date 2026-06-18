import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminEBookletPurchases } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const purchaseStatuses = [
  "all",
  "pending",
  "awaiting_payment",
  "paid",
  "needs_branding_info",
  "customization_in_progress",
  "ready",
  "delivered",
  "cancelled",
  "rejected",
];

const statusTone = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  delivered: "border-green-200 bg-green-50 text-green-700",
  paid: "border-sky-200 bg-sky-50 text-sky-700",
  customization_in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const prettyStatus = (status) => status.replaceAll("_", " ");
export default function AdminEBookletPurchasesPage() {
  const { t } = useTranslation("eBooklets");
  const navigate = useNavigate();
  const {
    purchases,
    pagination,
    status,
    loading,
    setPage,
    setStatus,
    fetchPurchases,
    markPaid,
    approveStudentPurchase,
  } = useAdminEBookletPurchases();
  const [studentPurchaseId, setStudentPurchaseId] = useState("");

  const load = useCallback(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    load();
  }, [load, status, pagination.page]);

  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const statusLabel = useCallback(
    (value) => t(`statuses.${value}`, { defaultValue: prettyStatus(value) }),
    [t],
  );

  const handleMarkPaid = async (purchase) => {
    await markPaid(purchase.id);
    fetchPurchases();
  };

  const handleApproveStudentPurchase = async (event) => {
    event.preventDefault();
    if (!studentPurchaseId) return;
    await approveStudentPurchase(Number(studentPurchaseId));
    setStudentPurchaseId("");
    fetchPurchases();
  };

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-purchases-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <PackageCheck className="h-8 w-8 text-primary" />
            {t("admin.purchases.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.purchases.description")}
          </p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {purchaseStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? t("common.allStatuses") : statusLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form className="flex flex-col gap-2 rounded-lg border bg-background p-4 sm:flex-row sm:items-end" onSubmit={handleApproveStudentPurchase} data-testid="admin-e-booklet-approve-student-purchase">
        <div className="min-w-0 flex-1 space-y-1">
          <label className="text-sm font-medium">{t("admin.purchases.studentPurchaseApproval", { defaultValue: "Approve student purchase by purchase ID" })}</label>
          <Input type="number" min="1" value={studentPurchaseId} onChange={(event) => setStudentPurchaseId(event.target.value)} placeholder={t("admin.purchases.studentPurchaseIdPlaceholder", { defaultValue: "Student purchase ID" })} />
        </div>
        <Button type="submit" disabled={!studentPurchaseId}>
          <CheckCircle2 className="h-4 w-4" />
          {t("admin.purchases.approveStudentPurchase", { defaultValue: "Approve student purchase" })}
        </Button>
      </form>

      <div className="space-y-5">
        <div className="w-full overflow-x-auto rounded-lg border bg-background" data-testid="admin-e-booklet-purchases-table-card">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.purchases.table.teacher")}</TableHead>
                <TableHead>{t("admin.purchases.table.template")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.price")}</TableHead>
                <TableHead>{t("common.version")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("admin.purchases.loading")}
                  </TableCell>
                </TableRow>
              )}
              {!loading && purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("admin.purchases.empty")}
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                purchases.map((purchase) => (
                  <TableRow
                    key={purchase.id}
                    className=""
                  >
                    <TableCell>
                      <div className="font-medium">
                        {purchase.teacher?.name || t("common.teacher")}
                      </div>
                      <div className="text-xs text-muted-foreground">{purchase.teacher?.email}</div>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="truncate font-medium">{purchase.template?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.pageCount", {
                          count: purchase.template_version?.page_count || 0,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusTone[purchase.status] || "border-slate-200 bg-slate-50 text-slate-700"}
                      >
                        {statusLabel(purchase.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {Number(purchase.price || 0).toLocaleString()} {purchase.currency || "EGP"}
                    </TableCell>
                    <TableCell>v{purchase.template_version?.version_number || 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        {["pending", "awaiting_payment", "needs_branding_info", "customization_in_progress"].includes(purchase.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(purchase)}
                            aria-label={t("admin.purchases.approveUnlock", { defaultValue: "Approve and unlock teacher management" })}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden xl:inline">
                              {t("admin.purchases.approveUnlockShort", { defaultValue: "Approve / unlock" })}
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/e-booklets/orders/${purchase.id}/delivery`)}
                          aria-label={t("admin.purchases.openDelivery", { defaultValue: "Open delivery details" })}
                        >
                          <BookOpenCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.pageOf", { page: pagination.page, total: pageCount })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}
          disabled={pagination.page >= pageCount}
        >
          {t("common.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
