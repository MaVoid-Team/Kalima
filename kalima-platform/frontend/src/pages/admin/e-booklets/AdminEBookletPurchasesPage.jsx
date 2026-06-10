import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  "cancelled",
  "rejected",
];

const statusTone = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paid: "border-sky-200 bg-sky-50 text-sky-700",
  customization_in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const prettyStatus = (status) => status.replaceAll("_", " ");
const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAsset = (response) => response?.data || response || null;

const dimensionsDiffer = (expected = [], uploaded = []) => {
  if (!expected?.length || !uploaded?.length) return false;
  if (expected.length !== uploaded.length) return true;
  return expected.some((dimension, index) => {
    const uploadedDimension = uploaded[index];
    return (
      !uploadedDimension ||
      Number(dimension.width) !== Number(uploadedDimension.width) ||
      Number(dimension.height) !== Number(uploadedDimension.height)
    );
  });
};

export default function AdminEBookletPurchasesPage() {
  const { t } = useTranslation("eBooklets");
  const {
    purchases,
    pagination,
    status,
    loading,
    setPage,
    setStatus,
    fetchPurchases,
    updatePurchaseStatus,
    markPaid,
    deliverPurchase,
    uploadTeacherDocument,
  } = useAdminEBookletPurchases();
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    custom_document_file_id: "",
    display_title: "",
    invite_quota: "30",
    access_expires_at: "",
    student_marketing_price: "",
    internal_price: "",
    page_count: "",
    page_dimensions: [],
    document_filename: "",
    validation_message: "",
    admin_notes: "",
  });

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

  const activePurchase = useMemo(
    () => selectedPurchase || purchases[0] || null,
    [purchases, selectedPurchase],
  );

  useEffect(() => {
    if (!activePurchase) return;
    const templateVersion = activePurchase.template_version;
    setDeliveryForm((current) => ({
      ...current,
      display_title:
        activePurchase.branding_json?.bookletTitle ||
        activePurchase.template?.title ||
        current.display_title,
      access_expires_at: current.access_expires_at,
      student_marketing_price: String(activePurchase.marketing_price ?? activePurchase.price ?? current.student_marketing_price ?? ""),
      internal_price: String(activePurchase.internal_price ?? current.internal_price ?? ""),
      page_count: "",
      page_dimensions: [],
      document_filename: "",
      validation_message: "",
    }));
  }, [activePurchase]);

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activePurchase) return;
    const response = await uploadTeacherDocument(file, {
      owner_type: "booklet",
      owner_id: activePurchase.id,
    });
    const asset = normalizeAsset(response);
    const assetId = asset?.id;
    const metadata = asset?.metadata;
    if (assetId) {
      const expectedPageCount = Number(activePurchase.template_version?.page_count || 0);
      const expectedDimensions = Array.isArray(activePurchase.template_version?.page_dimensions_json)
        ? activePurchase.template_version.page_dimensions_json
        : [];
      let validationMessage = "";
      if (!metadata?.page_count || !metadata?.page_dimensions?.length) {
        validationMessage = t("admin.purchases.validation.detectRequired");
      } else if (expectedPageCount && metadata.page_count !== expectedPageCount) {
        validationMessage = t("admin.purchases.validation.pageCountMismatch", {
          expected: expectedPageCount,
          actual: metadata.page_count,
        });
      } else if (dimensionsDiffer(expectedDimensions, metadata.page_dimensions)) {
        validationMessage = t("admin.purchases.validation.pageSizeMismatch");
      }
      setDeliveryForm((current) => ({
        ...current,
        custom_document_file_id: String(assetId),
        page_count: metadata?.page_count ? String(metadata.page_count) : "",
        page_dimensions: metadata?.page_dimensions || [],
        document_filename: file.name,
        validation_message: validationMessage,
      }));
    }
  };

  const handleDeliver = async () => {
    if (!activePurchase) return;
    if (deliveryForm.validation_message || !deliveryForm.custom_document_file_id || !deliveryForm.access_expires_at) return;
    await deliverPurchase(activePurchase.id, {
      custom_document_file_id: Number(deliveryForm.custom_document_file_id),
      display_title: deliveryForm.display_title,
      invite_quota: asNumber(deliveryForm.invite_quota, 0),
      access_expires_at: deliveryForm.access_expires_at,
      student_marketing_price: asNumber(deliveryForm.student_marketing_price, 0),
      internal_price: asNumber(deliveryForm.internal_price, 0),
      page_count: asNumber(deliveryForm.page_count, 0),
      page_dimensions: deliveryForm.page_dimensions,
    });
    fetchPurchases();
  };

  const handleMarkPaid = async (purchase) => {
    await markPaid(purchase.id);
    fetchPurchases();
  };

  const handleStatus = async (purchase, nextStatus) => {
    await updatePurchaseStatus(purchase.id, nextStatus, deliveryForm.admin_notes);
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
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
                    className={activePurchase?.id === purchase.id ? "bg-muted/40" : ""}
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
                      <div className="flex justify-end gap-2">
                        {purchase.status !== "paid" && purchase.status !== "ready" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(purchase)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPurchase(purchase)}
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

        <aside className="space-y-4 rounded-lg border bg-background p-4">
          {activePurchase ? (
            <>
              <div>
                <h2 className="text-lg font-semibold">{t("admin.purchases.delivery")}</h2>
                <p className="text-sm text-muted-foreground">
                  {activePurchase.teacher?.name || t("common.teacher")} - {activePurchase.template?.title}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>{t("admin.purchases.teacherTitle")}</Label>
                  <Input
                    value={deliveryForm.display_title}
                    onChange={(event) =>
                      setDeliveryForm((current) => ({
                        ...current,
                        display_title: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.purchases.teacherPdf")}</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-h-9 flex-1 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {deliveryForm.custom_document_file_id
                        ? deliveryForm.document_filename ||
                          t("admin.purchases.teacherPdfUploaded", {
                            id: deliveryForm.custom_document_file_id,
                          })
                        : t("admin.purchases.teacherPdfEmpty")}
                    </div>
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      {deliveryForm.custom_document_file_id
                        ? t("common.replace")
                        : t("common.upload")}
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleDocumentUpload}
                        data-testid="ebooklet-teacher-document-upload-input"
                      />
                    </label>
                  </div>
                  {deliveryForm.validation_message && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {deliveryForm.validation_message}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("admin.purchases.detectedPages")}</Label>
                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                      {deliveryForm.page_count || t("admin.purchases.uploadPdf")}
                      <span className="text-muted-foreground">
                        {" / "}
                        {t("admin.purchases.templatePages", {
                          count: activePurchase.template_version?.page_count || 0,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.purchases.inviteQuota", { defaultValue: "Student seat quota" })}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={deliveryForm.invite_quota}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          invite_quota: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("admin.purchases.accessExpiresAt", { defaultValue: "Student access expires" })}</Label>
                    <Input
                      type="date"
                      value={deliveryForm.access_expires_at}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          access_expires_at: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.purchases.studentMarketingPrice", { defaultValue: "Student store price" })}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={deliveryForm.student_marketing_price}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          student_marketing_price: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.purchases.internalPrice", { defaultValue: "Internal teacher cost" })}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={deliveryForm.internal_price}
                    onChange={(event) =>
                      setDeliveryForm((current) => ({
                        ...current,
                        internal_price: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.purchases.adminNotes")}</Label>
                  <Textarea
                    value={deliveryForm.admin_notes}
                    onChange={(event) =>
                      setDeliveryForm((current) => ({
                        ...current,
                        admin_notes: event.target.value,
                      }))
                    }
                    placeholder={t("admin.purchases.adminNotesPlaceholder")}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatus(activePurchase, "customization_in_progress")}
                  disabled={loading}
                >
                  {t("common.inProgress")}
                </Button>
                <Button
                  onClick={handleDeliver}
                  disabled={loading || Boolean(deliveryForm.validation_message) || !deliveryForm.custom_document_file_id || !deliveryForm.access_expires_at}
                >
                  {t("admin.purchases.deliver")}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("admin.purchases.selectPurchase")}
            </div>
          )}
        </aside>
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
