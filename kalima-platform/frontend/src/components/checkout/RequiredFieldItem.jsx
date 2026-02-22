import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { localizeField } from "@/lib/cartUtils";

/**
 * Renders a single cart item and its required field inputs.
 */
export default function RequiredFieldItem({
  item,
  lang,
  fieldValues,
  onFieldChange,
  showSeparator,
}) {
  const itemName = localizeField(item, "name", lang) || item.name;
  const itemType = localizeField(item, "type", lang) || item.type;
  const fields = item.required_fields || [];

  return (
    <div>
      {showSeparator && <Separator className="mb-6" />}

      <div className="flex items-center gap-3 mb-4">
        {item.image && (
          <img
            src={item.image}
            alt={itemName}
            className="w-12 h-12 rounded-md object-cover border border-border"
          />
        )}
        <div>
          <p className="text-sm font-medium text-card-foreground">{itemName}</p>
          <p className="text-xs text-muted-foreground">{itemType}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {fields.map((field) => {
          const fieldKey = field.key || field.name;
          const fieldLabel = field.label || fieldKey;
          const isFile = field.type === "file" || field.type === "image";
          const inputId = `${item.id}-${fieldKey}`;

          return (
            <div key={fieldKey} className="grid gap-2">
              <Label
                htmlFor={inputId}
                className="text-xs uppercase font-semibold text-muted-foreground tracking-wider"
              >
                {fieldLabel}
              </Label>
              {isFile ? (
                <div className="relative">
                  <Input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) =>
                      onFieldChange(item.id, fieldKey, e.target.files[0])
                    }
                  />
                  <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              ) : (
                <Input
                  id={inputId}
                  type="text"
                  placeholder={field.placeholder || fieldLabel}
                  value={fieldValues[item.id]?.[fieldKey] || ""}
                  onChange={(e) =>
                    onFieldChange(item.id, fieldKey, e.target.value)
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
