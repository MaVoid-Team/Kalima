import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import useDeleteCategoryDialog from "@/hooks/admin/useDeleteCategoryDialog";

export default function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
  actions,
}) {
  const { t } = useTranslation("admin");
  const { loading, handleClose, handleDelete } = useDeleteCategoryDialog({
    category,
    onClose,
    onSuccess,
    actions,
  });

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && !loading && handleClose()}
    >
      <AlertDialogContent
        className="sm:max-w-md"
        data-testid="delete-category-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("categories.delete.confirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("categories.delete.confirm")}
            {category && (
              <strong className="block mt-2 font-medium text-foreground">
                "{category.title}"
              </strong>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            data-testid="category-delete-cancel"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            data-testid="category-delete-confirm"
          >
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("categories.actions.delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
