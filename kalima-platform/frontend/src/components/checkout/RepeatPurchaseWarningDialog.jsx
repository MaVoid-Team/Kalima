import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RepeatPurchaseWarningDialog({
  open,
  items,
  loading,
  title,
  description,
  backLabel,
  continueLabel,
  onBack,
  onContinue,
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onBack()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl p-0">
        <div className="flex min-w-0 flex-col">
          <DialogHeader className="px-6 pb-0 pt-6 text-start">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-start leading-6">
              {description}
            </DialogDescription>
          </DialogHeader>

          <ul className="mx-6 my-5 max-h-48 min-w-0 space-y-2 overflow-y-auto rounded-xl border border-amber-200 bg-amber-50 p-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="min-w-0 break-words text-sm font-semibold text-foreground"
              >
                {item.title}
              </li>
            ))}
          </ul>

          <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              autoFocus
            >
              {backLabel}
            </Button>
            <Button type="button" onClick={onContinue} disabled={loading}>
              {continueLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
