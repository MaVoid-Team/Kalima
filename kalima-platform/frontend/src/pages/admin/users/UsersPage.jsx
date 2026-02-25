import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon, Download } from 'lucide-react';

import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import useExport from '@/hooks/useExport';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis,
    generatePaginationLinks
} from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserFilters from '@/components/admin/users/UserFilters';
import UsersTable from '@/components/admin/users/UsersTable';
import CreateUserDialog from '@/components/admin/users/CreateUserDialog';
import UserStatsCards from '@/components/admin/users/UserStatsCards';

export default function UsersPage() {
    const { t } = useTranslation('userManagement');

    const {
        users,
        pagination,
        filters,
        loading,
        fetchUsers,
        setSearch,
        setRole,
        setPortal,
        setPage
    } = useAdminUsers();

    const { exportData, loading: exportLoading, exportProgress } = useExport();
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSelect = (id, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(users.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleExport = (format) => {
        exportData({
            resource: 'admin/users',
            format,
            ids: selectedIds,
            filters,
        });
    };

    return (
        <div className="space-y-6 no-scrollbar">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UsersIcon className="h-8 w-8 text-primary" />
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        {t('totalUsers', { count: pagination.total })}
                    </p>

                    {/* Export dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="users-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleExport('csv')}
                                disabled={exportLoading}
                                data-testid="users-export-csv"
                            >
                                {t('exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport('xlsx')}
                                disabled={exportLoading}
                                data-testid="users-export-excel"
                            >
                                {t('exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <CreateUserDialog onSuccess={fetchUsers} />
                </div>
            </div>

            {exportLoading && exportProgress > 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>{exportProgress < 100 ? t('export.exporting', 'Exporting...') : t('export.processing', 'Processing...')}</span>
                        <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                </div>
            )}

            <UserStatsCards />

            <UserFilters
                filters={filters}
                onSearchChange={setSearch}
                onRoleChange={setRole}
                onPortalChange={setPortal}
            />

            <UsersTable
                users={users}
                loading={loading}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
            />

            {pagination.pages > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    text={t('pagination.previous')}
                                    data-testid="users-pagination-prev"
                                />
                            </PaginationItem>

                            {generatePaginationLinks(pagination.page, pagination.pages).map((pageNumber, index) => {
                                if (pageNumber === 'ellipsis') {
                                    return (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            onClick={() => setPage(pageNumber)}
                                            isActive={pagination.page === pageNumber}
                                            className="cursor-pointer"
                                            data-testid={`users-pagination-${pageNumber}`}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
                                    className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    text={t('pagination.next')}
                                    data-testid="users-pagination-next"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
