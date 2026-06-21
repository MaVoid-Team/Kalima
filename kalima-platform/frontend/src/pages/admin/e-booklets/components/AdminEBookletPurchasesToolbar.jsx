import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { E_BOOKLET_ORDER_FILTER_STATUSES } from "@/pages/e-booklets/eBookletOrdersContract.mjs";

const prettyStatus = (status) => status.replaceAll("_", " ");

export default function AdminEBookletPurchasesToolbar({
  filters,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onTotalRangeChange,
  onClear,
}) {
  const { t } = useTranslation("eBooklets");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [minTotal, setMinTotal] = useState(filters.minTotal || "");
  const [maxTotal, setMaxTotal] = useState(filters.maxTotal || "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) onSearchChange(searchValue);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filters.search, onSearchChange, searchValue]);

  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setMinTotal(filters.minTotal || "");
    setMaxTotal(filters.maxTotal || "");
  }, [filters.maxTotal, filters.minTotal]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (minTotal !== filters.minTotal || maxTotal !== filters.maxTotal) {
        onTotalRangeChange(minTotal, maxTotal);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filters.maxTotal, filters.minTotal, maxTotal, minTotal, onTotalRangeChange]);

  const selectedRange = {
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined,
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex-1"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchChange(searchValue);
        }}
      >
        <div className="relative">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("admin.purchases.searchPlaceholder", { defaultValue: "Search teacher, template, payment reference..." })}
            className="ps-8"
            data-testid="admin-e-booklet-purchases-search"
          />
        </div>
      </form>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="grid grid-cols-2 gap-2 sm:w-[260px]">
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={minTotal}
            onChange={(event) => setMinTotal(event.target.value)}
            placeholder={t("admin.purchases.minTotal", { defaultValue: "Min total" })}
            data-testid="admin-e-booklet-purchases-min-total"
          />
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={maxTotal}
            onChange={(event) => setMaxTotal(event.target.value)}
            placeholder={t("admin.purchases.maxTotal", { defaultValue: "Max total" })}
            data-testid="admin-e-booklet-purchases-max-total"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("justify-start text-muted-foreground sm:w-[250px]", filters.startDate && "text-foreground")}
              data-testid="admin-e-booklet-purchases-date-filter"
            >
              <CalendarIcon className="h-4 w-4" />
              {filters.startDate ? (
                filters.endDate ? (
                  <>{format(new Date(filters.startDate), "LLL dd, y")} - {format(new Date(filters.endDate), "LLL dd, y")}</>
                ) : (
                  format(new Date(filters.startDate), "LLL dd, y")
                )
              ) : (
                <span>{t("admin.purchases.filterByDate", { defaultValue: "Filter by date" })}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              selected={selectedRange}
              defaultMonth={selectedRange.from}
              onSelect={(range) => onDateRangeChange(range?.from || null, range?.to || null)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={filters.status || "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="sm:w-[220px]" data-testid="admin-e-booklet-purchases-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.status.all", "All Orders")}</SelectItem>
            {E_BOOKLET_ORDER_FILTER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`orders.statuses.${status}`, { defaultValue: prettyStatus(status) })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onClear} data-testid="admin-e-booklet-purchases-clear-filters">
          <X className="h-4 w-4" />
          <span className="sm:sr-only">{t("common.clear", { defaultValue: "Clear" })}</span>
        </Button>
      </div>
    </div>
  );
}
