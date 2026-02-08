import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Printer, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookletFormatSelector({
  formats,
  selectedFormat,
  onSelect,
}) {
  const { t } = useTranslation("product");

  if (!formats || formats.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {t("booklet.selectFormat", "SELECT FORMAT")}
      </h3>

      <div className="flex flex-col gap-3">
        {formats.map((format) => {
          const isSelected = selectedFormat === format.id;
          return (
            <div
              key={format.id}
              onClick={() => onSelect(format.id)}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                isSelected
                  ? "border-red-500 bg-red-50/10"
                  : "border-border hover:border-gray-300 bg-card",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {format.type === "digital" ? (
                    <Download className="w-5 h-5" />
                  ) : (
                    <Printer className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base">{format.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {format.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-bold text-lg",
                    isSelected ? "text-red-600" : "text-foreground",
                  )}
                >
                  ${format.price}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
