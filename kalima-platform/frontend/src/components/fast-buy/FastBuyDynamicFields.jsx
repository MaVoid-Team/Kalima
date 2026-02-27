import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function FastBuyDynamicFields({
  itemsMissingFields,
  itemFields,
  updateItemField,
}) {
  if (!itemsMissingFields?.length) return null;

  return (
    <div className="space-y-4">
      {itemsMissingFields.map((missingItem) => (
        <div
          key={missingItem.cart_item_id}
          className="p-6 border rounded-xl shadow-sm space-y-5"
        >
          <h4 className="font-bold text-lg text-primary">
            {missingItem.product_name}
          </h4>
          <div className="space-y-4">
            {missingItem.missing_fields.map((field) => (
              <DynamicFieldInput
                key={field.id}
                field={field}
                cartItemId={missingItem.cart_item_id}
                value={itemFields[missingItem.cart_item_id]?.[field.id]}
                onChange={updateItemField}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const DynamicFieldInput = ({ field, cartItemId, value, onChange }) => {
  const { t } = useTranslation("checkout");
  const isImage = field.field_type === "image";
  const inputId = `file-${cartItemId}-${field.id}`;

  const handleChange = (e) => {
    if (isImage) {
      if (e.target.files?.[0]) {
        onChange(cartItemId, field.id, e.target.files[0]);
      }
    } else {
      onChange(cartItemId, field.id, e.target.value);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="font-semibold text-foreground/80">
        {field?.label}
        <span className="text-destructive">*</span>
      </Label>
      {isImage ? (
        <>
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer "
            onClick={() => document.getElementById(inputId).click()}
            data-testid="fastbuy-dynamic-fields-upload-button"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {value?.name
                  ? value.name
                  : t("payment.upload", "Click to upload")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("payment.uploadHint", "PNG, JPG up to 5MB")}
              </p>
            </div>
          </div>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            data-testid="fastbuy-dynamic-fields-file-input"
          />
        </>
      ) : (
        <Input
          type="text"
          placeholder={t("payment.enterField", {
            field: field?.label || "Field",
          })}
          value={value || ""}
          onChange={handleChange}
          className="h-12 bg-background focus-visible:ring-primary/20"
          data-testid="fastbuy-dynamic-fields-text-input"
        />
      )}
    </div>
  );
};
