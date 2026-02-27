import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CategoryForm({
  formData,
  onChange,
  isEdit,
  parentOptions,
}) {
  const { t } = useTranslation("admin");
  const { title, description, parentId, active } = formData;
  const { validParents, allCategoriesDisabled } = parentOptions;

  return (
    <div className="space-y-4 py-4" data-testid="category-form-fields">
      {/* Title */}
      <div className="space-y-2">
        <Label
          htmlFor="category-title"
          className="after:content-['*'] after:ms-0.5 after:text-destructive"
        >
          {t("categories.form.title")}
        </Label>
        <Input
          id="category-title"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder={t("categories.form.titlePlaceholder")}
          required
          data-testid="category-title-input"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="category-description">
          {t("categories.form.description")}
        </Label>
        <Textarea
          id="category-description"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={t("categories.form.descriptionPlaceholder")}
          rows={2}
          data-testid="category-description-input"
        />
      </div>

      {/* Parent Category */}
      <div className="space-y-2">
        <Label htmlFor="category-parent">
          {t("categories.form.parentCategory")}
        </Label>
        <Select
          value={parentId}
          onValueChange={(val) => onChange("parentId", val)}
          disabled={allCategoriesDisabled}
        >
          <SelectTrigger
            id="category-parent"
            data-testid="category-parent-select"
          >
            <SelectValue
              placeholder={t("categories.form.selectParentCategory")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-muted-foreground italic">
              {t("categories.form.rootLevel")}
            </SelectItem>
            {validParents.map((parent) => (
              <SelectItem key={parent.id} value={parent.id}>
                {parent.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
       
      </div>

      {/* Active Toggle (Edit only) */}
      {isEdit && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                {t("categories.form.isArchived")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {active
                  ? t("products.status.active")
                  : t("products.status.archived")}
              </p>
            </div>
            <Switch
              checked={!active}
              onCheckedChange={(checked) => onChange("active", !checked)}
              data-testid="category-archived-switch"
            />
          </div>

          {!active && (
            <Alert
              variant="warning"
              className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ms-2">
                {t("categories.messages.archiveWarning")}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
