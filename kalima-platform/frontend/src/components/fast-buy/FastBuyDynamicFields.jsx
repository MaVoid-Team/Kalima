import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Package } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { motion } from "framer-motion";

export default function FastBuyDynamicFields({
  itemsMissingFields,
  itemFields,
  updateItemField,
}) {
  if (!itemsMissingFields?.length) return null;

  return (
    <div className="space-y-6">
      {itemsMissingFields.map((missingItem, index) => (
        <motion.div
          key={missingItem.cart_item_id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 border border-border/40 bg-card/60 backdrop-blur-md rounded-2xl shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Package className="w-5 h-5" />
             </div>
             <h4 className="font-bold text-lg text-foreground tracking-tight">
               {missingItem.product_name}
             </h4>
          </div>

          <div className="space-y-6 pt-2">
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
        </motion.div>
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
      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {field?.label}
        <span className="text-destructive ms-1">*</span>
      </Label>
      {isImage ? (
        <>
          <motion.div
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            className="border-2 border-dashed border-primary/20 hover:border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all group"
            onClick={() => document.getElementById(inputId).click()}
            data-testid="fastbuy-dynamic-fields-upload-button"
          >
            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">
                {value?.name
                  ? value.name
                  : t("payment.upload", "Click to upload")}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1 opacity-80">
                {t("payment.uploadHint", "PNG, JPG up to 5MB")}
              </p>
            </div>
          </motion.div>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            data-testid="fastbuy-dynamic-fields-file-input"
          />
        </>
      ) : field.field_type === "number" ? (
        <PhoneInput
          dir="ltr"
          value={value || ""}
          onChange={handleChange}
          className="h-12 bg-background/50 backdrop-blur-xs rounded-xl focus-visible:ring-primary/20"
          data-testid="fastbuy-dynamic-fields-phone-input"
        />
      ) : (
        <Input
          type="text"
          placeholder={t("payment.enterField", {
            field: field?.label || "Field",
          })}
          value={value || ""}
          onChange={handleChange}
          className="h-12 bg-background/50 backdrop-blur-xs rounded-xl border-border/30 focus-visible:ring-primary/20 mt-1"
          data-testid="fastbuy-dynamic-fields-text-input"
        />
      )}
    </div>
  );
};
