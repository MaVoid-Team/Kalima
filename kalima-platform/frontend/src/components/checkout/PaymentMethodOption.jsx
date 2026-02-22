import { CreditCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import PaymentProofFields from "./PaymentProofFields";

/**
 * Single payment method radio option with expandable proof fields.
 */
export default function PaymentMethodOption({
  method,
  isSelected,
  proofFieldsProps,
}) {
  const methodId = String(method.id);
  const methodLabel = method.name || method.label;

  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden transition-colors",
        isSelected ? "border-primary border-2" : "border-border",
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center p-4",
          isSelected ? "bg-primary/5" : "bg-muted/30",
        )}
      >
        <div className="flex items-center gap-3">
          <RadioGroupItem value={methodId} id={`method-${methodId}`} />
          <Label
            htmlFor={`method-${methodId}`}
            className="font-medium cursor-pointer"
          >
            {methodLabel}
          </Label>
        </div>
        <CreditCard className="w-5 h-5 text-muted-foreground" />
      </div>

      {isSelected && <PaymentProofFields {...proofFieldsProps} />}
    </div>
  );
}
