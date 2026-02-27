import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Edit,
  Trash,
  ChevronRight,
  ChevronDown,
  FolderTree,
  FileText,
} from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CategoryTreeNode({
  category,
  depth = 0,
  treeState,
  actions,
}) {
  const { expandedIds, loadingChildren, childrenMap } = treeState;
  const { onToggleExpand, onEdit, onDelete } = actions;

  const { t } = useTranslation("admin");

  const isExpanded = expandedIds.has(category.id);
  const isLoadingChildren = loadingChildren.has(category.id);
  const children = childrenMap[category.id] || [];
  const hasLoadedChildren = !!childrenMap[category.id];

  const indentClass =
    depth === 0 ? "" : depth === 1 ? "ms-8" : depth === 2 ? "ms-16" : "ms-24";

  let hasChildren = depth < 2;
  const knownChildCount = category.sub_categories
    ? category.sub_categories.length
    : null;

  if (hasLoadedChildren) {
    hasChildren = children.length > 0;
  } else if (knownChildCount !== null) {
    hasChildren = knownChildCount > 0;
  }

  const getExpandIcon = () => {
    if (isLoadingChildren) {
      return (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      );
    }
    if (isExpanded) return <ChevronDown className="h-4 w-4" />;
    return <ChevronRight className="h-4 w-4 rtl:rotate-180" />;
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell className="w-full">
          <div className={`flex items-start gap-2 py-1 ${indentClass}`}>
            <div className="pt-0.5 shrink-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand(category.id)}
                  className="p-1 hover:bg-muted rounded-md text-muted-foreground focus:outline-none "
                  data-testid={`category-expand-button-${category.id}`}
                >
                  {getExpandIcon()}
                </button>
              ) : (
                <span className="w-6 inline-block shrink-0" /> // spacer for leaf nodes
              )}
            </div>

            <div className="pt-1.5 shrink-0">
              {hasChildren ? (
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col pt-1">
              <span className="font-medium leading-tight">
                {category.title}
              </span>
              {category.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge
            variant={category.active ? "default" : "secondary"}
            className={category.active ? "" : "bg-muted text-muted-foreground"}
          >
            {category.active
              ? t("products.status.active")
              : t("products.status.archived")}
          </Badge>
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {category.created_at
            ? format(new Date(category.created_at), "dd MMM, yyyy")
            : t("common.na")}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              data-testid={`category-edit-button-${category.id}`}
              title={t("categories.actions.edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid={`category-delete-button-${category.id}`}
              title={t("categories.actions.delete")}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded &&
        hasLoadedChildren &&
        children.map((child) => (
          <CategoryTreeNode
            key={`cat-${child.id}`}
            category={child}
            depth={depth + 1}
            treeState={treeState}
            actions={actions}
          />
        ))}
    </React.Fragment>
  );
}
