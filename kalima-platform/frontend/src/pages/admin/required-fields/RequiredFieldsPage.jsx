import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FormInput } from 'lucide-react';

import useAdminRequiredFields from '@/hooks/admin/useAdminRequiredFields';
import { Button } from '@/components/ui/button';
import RequiredFieldsFilters from '@/components/admin/required-fields/RequiredFieldsFilters';
import RequiredFieldsTable from '@/components/admin/required-fields/RequiredFieldsTable';
import CreateRequiredFieldDialog from '@/components/admin/required-fields/CreateRequiredFieldDialog';
import EditRequiredFieldDialog from '@/components/admin/required-fields/EditRequiredFieldDialog';
import DeleteRequiredFieldDialog from '@/components/admin/required-fields/DeleteRequiredFieldDialog';

export default function RequiredFieldsPage() {
  const { t, i18n } = useTranslation('admin');
  const {
    fields,
    loading,
    fetchAllFields,
    createField,
    updateField,
    deleteField,
  } = useAdminRequiredFields();

  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [deleteFieldItem, setDeleteFieldItem] = useState(null);

  const loadFields = useCallback(async () => {
    await fetchAllFields({
      active: statusFilter === 'all' ? undefined : statusFilter === 'true' ? true : false,
    });
  }, [fetchAllFields, statusFilter]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  const handleCreate = async (payload) => {
    const result = await createField(payload);
    if (result?.success) {
      setIsCreateDialogOpen(false);
      await loadFields();
    }
    return result;
  };

  const handleEdit = (field) => {
    setEditField(field);
  };

  const handleUpdate = async (fieldId, payload) => {
    const result = await updateField(fieldId, payload);
    if (result?.success) {
      setEditField(null);
      await loadFields();
    }
    return result;
  };

  const handleDelete = (field) => {
    setDeleteFieldItem(field);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFieldItem) return;
    
    const result = await deleteField(deleteFieldItem.id);
    if (result?.success) {
      setDeleteFieldItem(null);
      await loadFields();
    }
    return result;
  };

  const handleToggleActivation = async (field) => {
    await updateField(field.id, {
      active: !field.active,
    });
    await loadFields();
  };

  return (
    <div className="space-y-6 no-scrollbar" data-testid="requiredFields-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FormInput className="h-8 w-8 text-primary" />
            {t('requiredFields.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('requiredFields.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground hidden sm:block">
            {t('requiredFields.totalFields', { count: fields.length })}
          </p>
          
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="requiredFields-page-create-button"
          >
            <Plus className="me-2 h-4 w-4" />
            {t('requiredFields.createField')}
          </Button>
        </div>
      </div>

      <RequiredFieldsFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <RequiredFieldsTable
        fields={fields}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActivation={handleToggleActivation}
      />

      <CreateRequiredFieldDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmitField={handleCreate}
        loading={loading}
      />

      <EditRequiredFieldDialog
        open={!!editField}
        onOpenChange={(open) => {
          if (!open) setEditField(null);
        }}
        field={editField}
        loading={loading}
        onSubmitField={handleUpdate}
      />

      <DeleteRequiredFieldDialog
        open={!!deleteFieldItem}
        onOpenChange={(open) => {
          if (!open) setDeleteFieldItem(null);
        }}
        field={deleteFieldItem}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </div>
  );
}
