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

export default function AdminEBookletPurchasesPage() {
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
    page_count: "",
    admin_notes: "",
  });

  const load = useCallback(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    load();
  }, [load, status, pagination.page]);

  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.limit));

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
      page_count: String(templateVersion?.page_count || current.page_count || ""),
    }));
  }, [activePurchase]);

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activePurchase) return;
    const response = await uploadTeacherDocument(file, {
      owner_type: "booklet",
      owner_id: activePurchase.id,
    });
    const assetId = response?.data?.id || response?.id;
    if (assetId) {
      setDeliveryForm((current) => ({
        ...current,
        custom_document_file_id: String(assetId),
      }));
    }
  };

  const handleDeliver = async () => {
    if (!activePurchase) return;
    await deliverPurchase(activePurchase.id, {
      custom_document_file_id: Number(deliveryForm.custom_document_file_id),
      display_title: deliveryForm.display_title,
      invite_quota: asNumber(deliveryForm.invite_quota, 0),
      page_count: asNumber(deliveryForm.page_count, 0),
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
            E-Booklet Purchases
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm payment, upload teacher-specific files, validate page counts, and deliver access.
          </p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {purchaseStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All statuses" : prettyStatus(item)}
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
                <TableHead>Teacher</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading e-booklet purchases...
                  </TableCell>
                </TableRow>
              )}
              {!loading && purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No e-booklet purchases match this status.
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
                      <div className="font-medium">{purchase.teacher?.name || "Teacher"}</div>
                      <div className="text-xs text-muted-foreground">{purchase.teacher?.email}</div>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="truncate font-medium">{purchase.template?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.template_version?.page_count || 0} pages
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusTone[purchase.status] || "border-slate-200 bg-slate-50 text-slate-700"}
                      >
                        {prettyStatus(purchase.status)}
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
                <h2 className="text-lg font-semibold">Delivery</h2>
                <p className="text-sm text-muted-foreground">
                  {activePurchase.teacher?.name || "Teacher"} - {activePurchase.template?.title}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>Teacher-specific title</Label>
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
                  <Label>Teacher PDF/DOC/DOCX</Label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input
                      value={deliveryForm.custom_document_file_id}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          custom_document_file_id: event.target.value,
                        }))
                      }
                      placeholder="Private asset ID"
                    />
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      Upload
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleDocumentUpload}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Uploaded page count</Label>
                    <Input
                      type="number"
                      min="1"
                      value={deliveryForm.page_count}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          page_count: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Invite quota</Label>
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
                <div className="space-y-2">
                  <Label>Admin notes</Label>
                  <Textarea
                    value={deliveryForm.admin_notes}
                    onChange={(event) =>
                      setDeliveryForm((current) => ({
                        ...current,
                        admin_notes: event.target.value,
                      }))
                    }
                    placeholder="Payment reference or customization notes"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatus(activePurchase, "customization_in_progress")}
                  disabled={loading}
                >
                  In Progress
                </Button>
                <Button onClick={handleDeliver} disabled={loading}>
                  Deliver Booklet
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Select a purchase to deliver.
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
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}
          disabled={pagination.page >= pageCount}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
