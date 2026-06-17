import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "../ui/loading-spinner";

export default function FastBuyClearDialog({ open, onStay, onConfirm }) {
  const { t } = useTranslation("checkout");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("fastBuyClearDialog.title", "Leave fast buy checkout?")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("fastBuyClearDialog.description", "Leaving this page will clear your fast buy cart. You can stay to complete checkout, or leave and start again later.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay} disabled={isConfirming}>
            {t("fastBuyClearDialog.cancel", "Stay on checkout")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isConfirming}
            className="min-w-[140px]"
          >
            {isConfirming ? (
              <LoadingSpinner className="w-4 h-4 border-white" />
            ) : (
              t("fastBuyClearDialog.confirm", "Leave and clear cart")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
