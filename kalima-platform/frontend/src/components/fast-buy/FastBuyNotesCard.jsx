import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote } from "lucide-react";

export default function FastBuyNotesCard({ state, updateField }) {
  const { t } = useTranslation("checkout");

  return (
    <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="pt-6 pb-6 px-6">
        <div className="space-y-4">
          <Label
            htmlFor="checkout-notes"
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
          >
            <div className="p-1 rounded bg-muted">
              <StickyNote className="w-3.5 h-3.5" />
            </div>
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
            className="h-12 bg-background/50 backdrop-blur-xs rounded-xl border-border/30 focus-visible:ring-primary/20"
            data-testid="fastbuy-notes-input"
          />
        </div>
      </CardContent>
    </Card>
  );
}
