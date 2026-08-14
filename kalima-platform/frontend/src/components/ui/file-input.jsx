import * as React from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const FileInput = React.forwardRef(function FileInput(
  {
    className,
    buttonText,
    fileName,
    placeholder,
    uploading = false,
    disabled = false,
    multiple = false,
    accept,
    onChange,
    onClear,
    showClear = false,
    size = "default",
    ...props
  },
  forwardedRef
) {
  const { t } = useTranslation("common");
  const innerRef = React.useRef(null);
  const inputRef = forwardedRef || innerRef;
  const [selectedFileName, setSelectedFileName] = React.useState("");

  const handleChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files.length === 1) {
        setSelectedFileName(files[0].name);
      } else {
        setSelectedFileName(
          t("fileUpload.filesSelected", {
            count: files.length,
            defaultValue: `${files.length} files selected`,
          })
        );
      }
    } else {
      setSelectedFileName("");
    }

    if (typeof onChange === "function") {
      onChange(event);
    }
  };

  const handleClear = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedFileName("");
    if (inputRef && "current" in inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
    if (typeof onClear === "function") {
      onClear();
    }
  };

  const displayText =
    fileName ||
    selectedFileName ||
    placeholder ||
    t("fileUpload.noFileSelected", { defaultValue: "No file selected" });

  const isFilled = Boolean(fileName || selectedFileName);

  const defaultButtonLabel = uploading
    ? t("fileUpload.uploading", { defaultValue: "Uploading..." })
    : buttonText || t("fileUpload.chooseFile", { defaultValue: "Choose file" });

  return (
    <div
      onClick={() => {
        if (!disabled && !uploading && inputRef && "current" in inputRef && inputRef.current) {
          inputRef.current.click();
        }
      }}
      className={cn(
        "group relative flex min-w-0 w-full items-center gap-2 rounded-xl border border-input bg-background/90 px-2.5 py-1 text-sm shadow-xs transition-colors cursor-pointer select-none",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40",
        size === "sm" && "h-8 text-xs px-2 py-0.5",
        size === "default" && "h-10 text-sm",
        size === "lg" && "h-12 text-base px-3 py-1.5",
        disabled && "pointer-events-none cursor-not-allowed opacity-50 bg-muted/30",
        className
      )}
      data-slot="file-input-wrapper"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading}
        onChange={handleChange}
        className="sr-only absolute inset-0 h-full w-full opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        {...props}
      />

      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-2.5 font-medium text-primary transition-colors group-hover:bg-primary/20",
          size === "sm" ? "h-6 text-[11px] px-2" : "h-7 text-xs px-2.5"
        )}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        <span>{defaultButtonLabel}</span>
      </span>

      <span
        className={cn(
          "truncate flex-1 text-xs",
          isFilled ? "text-foreground font-medium" : "text-muted-foreground"
        )}
        title={typeof displayText === "string" ? displayText : undefined}
      >
        {displayText}
      </span>

      {showClear && isFilled && !disabled && !uploading && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("cancel", { defaultValue: "Clear" })}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
});

FileInput.displayName = "FileInput";

export { FileInput };
