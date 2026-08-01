import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function GlobalBackButton() {
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

  const label = t("back");

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="fixed start-5 top-20 z-[110] h-11 gap-1.5 px-2 text-sm font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground lg:start-64"
      onClick={handleBack}
      aria-label={label}
      title={label}
      data-testid="global-back-button"
    >
      <ArrowLeft aria-hidden="true" />
      {label}
    </Button>
  );
}
