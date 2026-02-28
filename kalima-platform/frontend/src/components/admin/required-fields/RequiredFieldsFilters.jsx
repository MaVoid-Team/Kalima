import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RequiredFieldsFilters({
  statusFilter,
  onStatusFilterChange,
}) {
  const { t, i18n } = useTranslation('admin');

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:max-w-xs">
        <Select
          dir={i18n.dir()}
          value={statusFilter}
          onValueChange={onStatusFilterChange}
          data-testid="requiredFields-status-filter"
        >
          <SelectTrigger>
            <SelectValue placeholder={t('requiredFields.filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('requiredFields.filters.allStatuses')}
            </SelectItem>
            <SelectItem value="true">
              {t('requiredFields.filters.active')}
            </SelectItem>
            <SelectItem value="false">
              {t('requiredFields.filters.inactive')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
