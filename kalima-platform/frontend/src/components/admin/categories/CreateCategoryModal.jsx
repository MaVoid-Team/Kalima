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
import useCreateCategoryModal from "@/hooks/admin/useCreateCategoryModal";

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  actions,
}) {
  const { t, i18n } = useTranslation("admin");
  const isRtl = i18n.language === "ar";

  const { loading, formData, parentOptions, handleChange, handleSubmit } =
    useCreateCategoryModal({
      isOpen,
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
          <DialogTitle>{t("categories.create.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("categories.create.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CategoryForm
            formData={formData}
            onChange={handleChange}
            parentOptions={parentOptions}
            isEdit={false}
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
              data-testid="category-modal-cancel"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="category-modal-submit"
            >
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("categories.create.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
