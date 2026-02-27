import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import CategoryForm from "./CategoryForm";
import useEditCategoryModal from "@/hooks/admin/useEditCategoryModal";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
  actions,
}) {
  const { t, i18n } = useTranslation("admin");
  const isRtl = i18n.language === "ar";

  const { loading, formData, parentOptions, handleChange, handleSubmit } =
    useEditCategoryModal({
      isOpen,
      category,
      onSuccess,
      actions,
    });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !loading && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("categories.edit.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("categories.edit.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CategoryForm
            formData={formData}
            onChange={handleChange}
            parentOptions={parentOptions}
            isEdit={true}
          />

          <div
            className={`flex justify-end gap-2 pt-4 ${
              isRtl ? "space-x-reverse" : ""
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              data-testid="category-edit-modal-cancel"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="category-edit-modal-submit"
            >
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("categories.edit.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
