import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import RequiredFieldsTableRow from './RequiredFieldsTableRow';

export default function RequiredFieldsTable({
  fields,
  loading,
  onEdit,
  onDelete,
  onToggleActivation,
}) {
  const { t } = useTranslation('admin');

  if (loading && fields.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (fields.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('requiredFields.noFields')}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table data-testid="requiredFields-page-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t('requiredFields.fields.label')}</TableHead>
            <TableHead>{t('requiredFields.fields.fieldType')}</TableHead>
            <TableHead>{t('requiredFields.fields.active')}</TableHead>
            <TableHead>{t('requiredFields.fields.createdAt')}</TableHead>
            <TableHead actions>{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <RequiredFieldsTableRow
              key={field.id}
              field={field}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActivation={onToggleActivation}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
