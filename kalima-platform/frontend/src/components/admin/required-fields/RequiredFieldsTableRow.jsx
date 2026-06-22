import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const getFieldTypeLabel = (fieldType, t) => {
  const typeMap = {
    text: t('requiredFields.types.text'),
    number: t('requiredFields.types.number'),
    date: t('requiredFields.types.date'),
    image: t('requiredFields.types.image'),
  };
  return typeMap[fieldType] || fieldType;
};

const getFieldTypeVariant = (fieldType) => {
  const variantMap = {
    text: 'default',
    number: 'secondary',
    date: 'outline',
    image: 'destructive',
  };
  return variantMap[fieldType] || 'default';
};

export default function RequiredFieldsTableRow({
  field,
  onEdit,
  onDelete,
  onToggleActivation,
}) {
  const { t, i18n } = useTranslation('admin');

  const handleToggleActivation = () => {
    onToggleActivation(field);
  };

  const handleEdit = () => {
    onEdit(field);
  };

  const handleDelete = () => {
    onDelete(field);
  };

  return (
    <TableRow data-testid={`requiredFields-row-${field.id}`}>
      <TableCell truncate className="font-medium" title={field.label}>{field.label}</TableCell>
      <TableCell status>
        <Badge variant={getFieldTypeVariant(field.field_type)}>
          {getFieldTypeLabel(field.field_type, t)}
        </Badge>
      </TableCell>
      <TableCell status>
        <div className="flex items-center gap-3">
          <Switch
            checked={field.active}
            onCheckedChange={handleToggleActivation}
            data-testid={`requiredFields-toggle-${field.id}`}
          />
          <span className={`text-sm ${field.active ? 'text-green-600' : 'text-gray-400'}`}>
            {field.active ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </TableCell>
      <TableCell date>
        {field.created_at ? format(new Date(field.created_at), 'MMM dd, yyyy') : '-'}
      </TableCell>
      <TableCell actions>
        <DropdownMenu dir={i18n.dir()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              title={t('common.actions')}
              data-testid={`requiredFields-actions-${field.id}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
