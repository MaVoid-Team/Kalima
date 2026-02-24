import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon } from 'lucide-react';

import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis
} from '@/components/ui/pagination';
import UserFilters from '@/components/admin/users/UserFilters';
import UsersTable from '@/components/admin/users/UsersTable';
import CreateUserDialog from '@/components/admin/users/CreateUserDialog';

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

    // Fetch users when component mounts or dependencies change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const getPageNumbers = () => {
        const { page: currentPage, pages: totalPages } = pagination;
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 'ellipsis', totalPages];
        }
        if (currentPage >= totalPages - 2) {
            return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
    };

    return (
        <div className="space-y-6">
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
                    <CreateUserDialog onSuccess={fetchUsers} />
                </div>
            </div>

            <UserFilters
                filters={filters}
                onSearchChange={setSearch}
                onRoleChange={setRole}
                onPortalChange={setPortal}
            />

            <UsersTable
                users={users}
                loading={loading}
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
                                />
                            </PaginationItem>

                            {getPageNumbers().map((pageNumber, index) => {
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
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
