import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getConfirmedPurchasesCount } from "../routes/cart";
import { CheckCircle2, TrendingUp } from "lucide-react";

const MonthlyCounter = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [count, setCount] = useState(0);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      const result = await getConfirmedPurchasesCount();
      if (result.success && result.data?.status === "success") {
        setCount(result.data.data.confirmedPurchasesCount || 0);
        setMonth(result.data.data.month || "");
      }
    } catch (error) {
      console.error("Failed to fetch confirmed count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Refresh every 2 minutes
    const interval = setInterval(fetchCount, 120000);

    // Listen for purchase events
    const handlePurchaseUpdate = () => {
      fetchCount();
    };

    window.addEventListener("cart-updated", handlePurchaseUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("cart-updated", handlePurchaseUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-base-200 rounded-full animate-pulse">
        <div className="w-4 h-4 bg-base-300 rounded-full"></div>
        <div className="w-8 h-4 bg-base-300 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className="tooltip tooltip-bottom"
      data-tip={isRTL ? `الطلبات المؤكدة - ${month}` : `Confirmed Orders - ${month}`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 cursor-default
          ${count > 0
            ? "bg-gradient-to-r from-success/20 to-primary/20 border border-success/30"
            : "bg-base-200 border border-base-300"
          }`}
      >
        {count > 0 ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-base-content/50" />
        )}

        <span
          className={`font-bold text-sm tabular-nums ${
            count > 0 ? "text-success" : "text-base-content/70"
          }`}
        >
          {count}
        </span>

        <span className="text-xs text-base-content/60 hidden sm:inline">
          {isRTL ? "هذا الشهر" : "this month"}
        </span>
      </div>
    </div>
  );
};

export default MonthlyCounter;
