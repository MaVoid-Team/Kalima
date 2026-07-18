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

export default function RequiredFieldsPagination({
  page,
  pages,
  loading,
  onPageChange,
}) {
  const { t } = useTranslation('admin');

  if (pages <= 1) return null;

  const disabledClassName = 'pointer-events-none opacity-50';

  return (
    <div className="mt-4 flex justify-end">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={page <= 1 || loading ? disabledClassName : 'cursor-pointer'}
              text={t('common.pagination.previous')}
              data-testid="required-fields-pagination-prev"
            />
          </PaginationItem>

          {generatePaginationLinks(page, pages).map((pageNumber, index) => {
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
                  onClick={() => onPageChange(pageNumber)}
                  isActive={page === pageNumber}
                  className={loading ? disabledClassName : 'cursor-pointer'}
                  data-testid={`required-fields-pagination-${pageNumber}`}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(pages, page + 1))}
              className={page >= pages || loading ? disabledClassName : 'cursor-pointer'}
              text={t('common.pagination.next')}
              data-testid="required-fields-pagination-next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
