import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useCategoriesPage from "@/hooks/admin/useCategoriesPage";
import CategoryTreeView from "@/components/admin/categories/CategoryTreeView";
import CreateCategoryModal from "@/components/admin/categories/CreateCategoryModal";
import EditCategoryModal from "@/components/admin/categories/EditCategoryModal";
import DeleteCategoryDialog from "@/components/admin/categories/DeleteCategoryDialog";

export default function CategoriesPage() {
  const { t, i18n } = useTranslation("admin");
  const {
    categories,
    pagination,
    loading,
    statusFilter,
    handleStatusFilterChange,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editCategory,
    setEditCategory,
    deleteCategoryItem,
    setDeleteCategoryItem,
    handlePageChange,
    handleSuccess,
    childrenMap,
    fetchChildren,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesPage();

  return (
    <div className="space-y-6" data-testid="categories-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("categories.title")}
          </h1>
          <p className="text-muted-foreground">{t("categories.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between sm:justify-end">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="categories-page-create-button"
          >
            <Plus className="me-2 h-4 w-4" />
            {t("categories.createCategory")}
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Future implementation: we can add text search if supported backend */}
        <div className="w-full sm:max-w-xs">
          <Select dir={i18n.dir()} value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger data-testid="categories-status-filter">
              <SelectValue placeholder={t("products.filters.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("products.filters.allStatuses")}
              </SelectItem>
              <SelectItem value="true">
                {t("products.status.active")}
              </SelectItem>
              <SelectItem value="false">
                {t("products.status.archived")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CategoryTreeView
        categories={categories}
        loading={loading}
        pagination={pagination}
        treeState={{ childrenMap, fetchChildren, statusFilter }}
        actions={{
          onPageChange: handlePageChange,
          onEdit: (cat) => setEditCategory(cat),
          onDelete: (cat) => setDeleteCategoryItem(cat),
        }}
      />

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
        actions={{ createCategory }}
      />

      <EditCategoryModal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        category={editCategory}
        onSuccess={handleSuccess}
        actions={{ updateCategory }}
      />

      <DeleteCategoryDialog
        isOpen={!!deleteCategoryItem}
        onClose={() => setDeleteCategoryItem(null)}
        category={deleteCategoryItem}
        onSuccess={handleSuccess}
        actions={{ deleteCategory }}
      />
    </div>
  );
}
