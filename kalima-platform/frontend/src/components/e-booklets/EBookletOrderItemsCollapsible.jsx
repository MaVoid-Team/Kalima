/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpenCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canManageEBookletOrder,
  getEBookletOrderLinks,
  getEBookletOrderManagementPath,
  getEBookletOrderStatus,
  getEBookletOrderTitle,
} from "./eBookletOrderUtils";

export default function EBookletOrderItemsCollapsible({ order }) {
  const { t } = useTranslation("eBooklets");
  const [isExpanded, setIsExpanded] = useState(false);
  const orderStatus = getEBookletOrderStatus(order?.status);
  const links = getEBookletOrderLinks(order);

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{t("orders.items.title", "E-booklet items")}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          data-testid={`e-booklet-order-${order?.id}-items-expand-button`}
        >
          {isExpanded ? t("orders.actions.collapseItems", "Collapse") : t("orders.actions.expandItems", "Expand")}
          {isExpanded ? <ChevronUp className="ms-1 h-4 w-4" /> : <ChevronDown className="ms-1 h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-4">
          {links.map((link) => {
            const linkStatus = getEBookletOrderStatus(link?.status || orderStatus);
            const instance = link?.booklet_instance;
            const version = link?.template_version || instance?.template_version || order?.template_version;
            return (
              <div key={link.id} className="flex items-center gap-4" data-testid={`e-booklet-order-item-${link.id}`}>
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-muted/50">
                  <BookOpenCheck className="h-6 w-6 text-primary/70" />
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {getEBookletOrderTitle(link, t("orders.fallbackTitle", "E-booklet"))}
                  </h5>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t("orders.itemStatus", "Item status")}: {t(`orders.statuses.${linkStatus}`, linkStatus)}
                    </span>
                    {version?.page_count && (
                      <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {t("common.pageCount", { count: version.page_count, defaultValue: "{{count}} pages" })}
                      </span>
                    )}
                  </div>
                </div>

                {canManageEBookletOrder(orderStatus, link) && (
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link to={getEBookletOrderManagementPath(link)}>{t("orders.manageAccess", "Manage access")}</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
