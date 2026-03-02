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
import { useTranslation } from "react-i18next";

export default function FastBuyClearDialog({ open, onStay, onConfirm }) {
  const { t } = useTranslation("checkout");
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
          <AlertDialogCancel onClick={onStay}>{t("fastBuyClearDialog.cancel", "Stay on checkout")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("fastBuyClearDialog.confirm", "Leave and clear cart")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
