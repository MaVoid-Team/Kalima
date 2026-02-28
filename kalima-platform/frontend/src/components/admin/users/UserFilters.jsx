import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useEffect, useState } from 'react';
import { ROLES, PORTALS } from '@/lib/adminConstants';
import debounce from 'lodash/debounce';

export default function UserFilters({ filters, onSearchChange, onRoleChange, onPortalChange, onIsDeletedChange }) {
    const { t, i18n } = useTranslation('userManagement');
    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Debounce search to avoid spamming the API
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value) => {
            onSearchChange(value);
        }, 500),
        [onSearchChange]
    );

    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        debouncedSearch(val);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="ps-10"
                    data-testid="admin-users-filters-search-input"
                />
            </div>

            <div className="flex gap-4">
                <Select dir={i18n.dir()} value={filters.role || 'all'} onValueChange={onRoleChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('filters.allRoles')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
                        {ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                                {t(`roles.${role}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select dir={i18n.dir()} value={filters.portal || 'all'} onValueChange={onPortalChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('filters.allPortals')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('filters.allPortals')}</SelectItem>
                        {PORTALS.map(portal => (
                            <SelectItem key={portal} value={portal}>
                                {t(`portals.${portal}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select dir={i18n.dir()} value={String(filters.is_deleted || 'all')} onValueChange={onIsDeletedChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('filters.allStatuses', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('filters.allAccounts', 'All Accounts')}</SelectItem>
                        <SelectItem value="false">{t('filters.activeAccounts', 'Active')}</SelectItem>
                        <SelectItem value="true">{t('filters.deletedAccounts', 'Deleted')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
