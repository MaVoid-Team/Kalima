/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    generatePaginationLinks,
} from '@/components/ui/pagination';

export default function CouponsTablePagination({ pagination, onPageChange }) {
    const { t } = useTranslation('admin');
    let ellipsisCount = 0;

    if (pagination?.pages <= 1) return null;

    return (
        <div className="flex justify-end overflow-x-auto">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
                            className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            text={t('common.pagination.previous')}
                            data-testid="coupons-pagination-prev"
                        />
                    </PaginationItem>

                    {generatePaginationLinks(pagination.page, pagination.pages).map((pageNumber) => {
                        if (pageNumber === 'ellipsis') {
                            ellipsisCount += 1;
                            return (
                                <PaginationItem key={`ellipsis-${ellipsisCount}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    onClick={() => onPageChange?.(pageNumber)}
                                    isActive={pagination.page === pageNumber}
                                    className="cursor-pointer"
                                    data-testid={`coupons-pagination-${pageNumber}`}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange?.(Math.min(pagination.pages, pagination.page + 1))}
                            className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            text={t('common.pagination.next')}
                            data-testid="coupons-pagination-next"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
