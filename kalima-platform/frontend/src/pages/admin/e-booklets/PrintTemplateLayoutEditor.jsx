import { useEffect, useRef, useState } from "react";
import { Move, Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PRINT_CARD_WIDTH_PX = 827;
export const PRINT_CARD_HEIGHT_PX = 438;
export const PRINT_CARD_PPI = 300;

export const DEFAULT_PRINT_TEMPLATE_LAYOUT = {
  fields: {
    qr: { x: 604, y: 88, width: 96, height: 96 },
    codeNumber: { x: 601, y: 309, width: 125, height: 34, direction: "ltr", align: "center", fontSize: 18, color: "#111827" },
    teacherImage: { x: 345, y: 70, width: 118, height: 178 },
    registrationMethod: { x: 590, y: 74, width: 120, height: 28, direction: "rtl", align: "center", fontSize: 15, color: "#111827" },
    gradeClass: { x: 43, y: 296, width: 124, height: 48, direction: "rtl", align: "center", fontSize: 17, color: "#111827" },
    price: { x: 0, y: 36, width: 205, height: 48, direction: "rtl", align: "center", fontSize: 16, color: "#111827" },
    redCustomText: { x: 57, y: 95, width: 102, height: 75, direction: "rtl", align: "center", fontSize: 16, color: "#dc2626" },
  },
};

const FIELD_LABELS = {
  qr: "رمز QR",
  codeNumber: "رقم الكود",
  teacherImage: "صورة المدرس",
  registrationMethod: "طريقة التسجيل",
  gradeClass: "الصف",
  price: "السعر",
  redCustomText: "النص الأحمر",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const numberValue = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function PrintTemplateLayoutEditor({ value, onChange }) {
  const layout = value || DEFAULT_PRINT_TEMPLATE_LAYOUT;
  const fields = layout.fields || {};
  const fieldKeys = Object.keys(fields);
  const [selectedKey, setSelectedKey] = useState(fieldKeys[0] || "qr");
  const [dragState, setDragState] = useState(null);
  const previewRef = useRef(null);
  const selected = fields[selectedKey] || {};

  const updateField = (fieldKey, patch) => {
    const current = fields[fieldKey] || {};
    onChange({
      ...layout,
      fields: {
        ...fields,
        [fieldKey]: {
          ...current,
          ...patch,
        },
      },
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;
    const handleMove = (event) => {
      const box = previewRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = ((event.clientX - dragState.startX) / box.width) * PRINT_CARD_WIDTH_PX;
      const dy = ((event.clientY - dragState.startY) / box.height) * PRINT_CARD_HEIGHT_PX;
      const next = dragState.mode === "resize"
        ? {
          width: Math.round(clamp(dragState.field.width + dx, 12, PRINT_CARD_WIDTH_PX - dragState.field.x)),
          height: Math.round(clamp(dragState.field.height + dy, 12, PRINT_CARD_HEIGHT_PX - dragState.field.y)),
        }
        : {
          x: Math.round(clamp(dragState.field.x + dx, 0, PRINT_CARD_WIDTH_PX - dragState.field.width)),
          y: Math.round(clamp(dragState.field.y + dy, 0, PRINT_CARD_HEIGHT_PX - dragState.field.height)),
        };
      updateField(dragState.fieldKey, next);
    };
    const handleUp = () => setDragState(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState]);

  const beginDrag = (event, fieldKey, mode) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedKey(fieldKey);
    setDragState({
      fieldKey,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      field: { ...fields[fieldKey] },
    });
  };

  const setNumber = (key, rawValue) => {
    const fallback = key === "width" || key === "height" ? 12 : 0;
    updateField(selectedKey, { [key]: Math.round(numberValue(rawValue, fallback)) });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]" data-testid="print-template-layout-editor">
      <div className="space-y-2">
        <div
          ref={previewRef}
          className="relative w-full overflow-hidden rounded-xl border bg-white shadow-inner"
          style={{ aspectRatio: `${PRINT_CARD_WIDTH_PX} / ${PRINT_CARD_HEIGHT_PX}` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.14)_1px,transparent_0)] [background-size:16px_16px]" />
          {fieldKeys.map((fieldKey) => {
            const field = fields[fieldKey];
            const active = selectedKey === fieldKey;
            return (
              <button
                key={fieldKey}
                type="button"
                className={`absolute flex items-center justify-center border text-[11px] font-semibold transition ${active ? "border-primary bg-primary/15 text-primary" : "border-slate-400 bg-white/75 text-slate-700"}`}
                style={{
                  left: `${(field.x / PRINT_CARD_WIDTH_PX) * 100}%`,
                  top: `${(field.y / PRINT_CARD_HEIGHT_PX) * 100}%`,
                  width: `${(field.width / PRINT_CARD_WIDTH_PX) * 100}%`,
                  height: `${(field.height / PRINT_CARD_HEIGHT_PX) * 100}%`,
                }}
                onPointerDown={(event) => beginDrag(event, fieldKey, "move")}
                onClick={() => setSelectedKey(fieldKey)}
              >
                <span className="truncate px-1">{FIELD_LABELS[fieldKey] || fieldKey}</span>
                <span className="absolute bottom-0 right-0 flex h-4 w-4 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border bg-background" onPointerDown={(event) => beginDrag(event, fieldKey, "resize")}>
                  <Maximize2 className="h-2.5 w-2.5" />
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Move className="h-3.5 w-3.5" />اسحب المربعات للتحريك واسحب الزاوية لتغيير الحجم.</div>
      </div>
      <div className="space-y-3 rounded-xl border bg-background p-3">
        <div className="grid grid-cols-2 gap-2">
          {fieldKeys.map((fieldKey) => (
            <Button key={fieldKey} type="button" size="sm" variant={selectedKey === fieldKey ? "default" : "outline"} className="justify-start rounded-xl text-xs" onClick={() => setSelectedKey(fieldKey)}>
              {FIELD_LABELS[fieldKey] || fieldKey}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["x", "y", "width", "height", "fontSize"].map((key) => (
            <label key={key} className="grid gap-1 text-xs font-medium text-muted-foreground">
              <span>{key}</span>
              <Input className="h-9 rounded-xl text-foreground" type="number" value={selected[key] ?? ""} onChange={(event) => setNumber(key, event.target.value)} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
