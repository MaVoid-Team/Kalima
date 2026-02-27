import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryTreeNode from "./CategoryTreeNode";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CategoryPagination from "./CategoryPagination";
import useCategoryTree from "@/hooks/admin/useCategoryTree";

export default function CategoryTreeView({
  categories,
  loading,
  pagination,
  actions,
  treeState,
}) {
  const { t } = useTranslation("admin");
  const { onPageChange, onEdit, onDelete } = actions;
  const { childrenMap, fetchChildren, statusFilter } = treeState;

  const { expandedIds, loadingChildren, handleToggleExpand } = useCategoryTree({
    childrenMap,
    fetchChildren,
    statusFilter,
  });

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8  rounded-lg border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingSpinner className="h-4 w-4" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="categories-tree-view">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">
                {t("categories.table.title")}
              </TableHead>
              <TableHead>{t("categories.table.status")}</TableHead>
              <TableHead>{t("orders.createdAt")}</TableHead>
              <TableHead className="text-end pe-6">
                {t("categories.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t("categories.noCategories")}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <CategoryTreeNode
                  key={`cat-${category.id}`}
                  category={category}
                  depth={0}
                  treeState={{ expandedIds, loadingChildren, childrenMap }}
                  actions={{
                    onToggleExpand: handleToggleExpand,
                    onEdit,
                    onDelete,
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <CategoryPagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
