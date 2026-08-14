import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalBackButton({ className, variant = "default" }) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") {
    return null;
  }

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const label = t("back", "Back");

  if (variant === "navbar") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "group h-9 gap-1.5 px-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0",
          className
        )}
        onClick={handleBack}
        aria-label={label}
        title={label}
        data-testid="global-back-button"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "group inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-lg transition-colors w-fit",
        className
      )}
      onClick={handleBack}
      aria-label={label}
      title={label}
      data-testid="global-back-button"
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
