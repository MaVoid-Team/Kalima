/* eslint-disable react/prop-types */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function OrdersPagination({ pagination, onPageChange, t }) {
  if (pagination.pages <= 1) return null;

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              text={t('common.pagination.previous', 'Previous')}
            />
          </PaginationItem>

          {Array.from({ length: pagination.pages }).map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => onPageChange(i + 1)}
                isActive={pagination.page === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              text={t('common.pagination.next', 'Next')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
