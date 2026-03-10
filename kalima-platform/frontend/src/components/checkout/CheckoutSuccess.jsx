import { useTranslation } from "react-i18next";
import { CheckCircle2, Copy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CheckoutSuccess({ purchaseSerial }) {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();

  const handleCopySerial = () => {
    if (!purchaseSerial) return;
    navigator.clipboard.writeText(purchaseSerial);
    toast.success(t("success.copied"));
  };

  const handleContinueShopping = () => navigate("/market");

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>

          <h2 className="text-2xl font-bold text-card-foreground">
            {t("success.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("success.description")}
          </p>

          {purchaseSerial && (
            <>
              <Separator />
              <div className="w-full">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {t("success.serial_label")}
                </p>
                <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-lg py-3 px-4">
                  <span className="text-lg font-mono font-semibold text-card-foreground">
                    {purchaseSerial}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopySerial}
                    aria-label={t("success.copy")}
                    data-testid="checkout-success-copy-button"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleContinueShopping}
            className="w-full mt-4"
            size="lg"
            data-testid="checkout-success-continue-shopping-button"
          >
            {t("success.continue_shopping")}
            <ArrowRight className="w-4 h-4 ms-2" />
          </Button>

          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="checkout-success-view-orders-button"
          >
            {t("success.view_orders", "View My Orders")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
