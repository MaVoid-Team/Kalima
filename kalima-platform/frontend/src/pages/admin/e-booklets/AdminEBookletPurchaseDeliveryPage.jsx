import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAdminEBookletPurchases } from "@/hooks/admin/useAdminEBooklets";
import AdminEBookletPurchaseDeliveryForm from "./AdminEBookletPurchaseDeliveryForm";

export default function AdminEBookletPurchaseDeliveryPage() {
  const { t } = useTranslation("eBooklets");
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const [purchase, setPurchase] = useState(null);
  const {
    loading,
    fetchPurchase,
    updatePurchaseStatus,
    deliverPurchase,
    prepareCustomTemplate,
    uploadTeacherDocument,
  } = useAdminEBookletPurchases();

  const loadPurchase = useCallback(async () => {
    if (!purchaseId) return;
    const response = await fetchPurchase(purchaseId);
    setPurchase(response?.data || response || null);
  }, [fetchPurchase, purchaseId]);

  useEffect(() => {
    loadPurchase();
  }, [loadPurchase]);

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-purchase-delivery-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button type="button" variant="ghost" className="mb-2 -ml-3" onClick={() => navigate("/admin/e-booklets/orders")}>
            <ChevronLeft className="h-4 w-4" />
            {t("common.back", { defaultValue: "Back" })}
          </Button>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <PackageCheck className="h-8 w-8 text-primary" />
            {t("admin.purchases.delivery")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {purchase
              ? `${purchase.teacher?.name || t("common.teacher")} - ${purchase.template?.title || ""}`
              : t("admin.purchases.loading")}
          </p>
        </div>
      </div>

      <AdminEBookletPurchaseDeliveryForm
        purchase={purchase}
        loading={loading}
        t={t}
        updatePurchaseStatus={updatePurchaseStatus}
        deliverPurchase={deliverPurchase}
        prepareCustomTemplate={prepareCustomTemplate}
        uploadTeacherDocument={uploadTeacherDocument}
        onChanged={loadPurchase}
      />
    </div>
  );
}
