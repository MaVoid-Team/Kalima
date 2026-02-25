import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FastBuyNotesCard({ state, updateField }) {
  const { t } = useTranslation("checkout");

  return (
    <Card className="border-muted shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Label
            htmlFor="checkout-notes"
            className="font-semibold text-foreground/80"
          >
            {t("payment.notes", "Notes (Optional)")}
          </Label>
          <Input
            id="checkout-notes"
            value={state.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder={t(
              "payment.notesLabel",
              "Delivery instructions or special requests",
            )}
            className="h-12"
          />
        </div>
      </CardContent>
    </Card>
  );
}
