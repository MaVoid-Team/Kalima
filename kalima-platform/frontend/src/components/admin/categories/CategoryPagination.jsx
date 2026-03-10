import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
  generatePaginationLinks,
} from "@/components/ui/pagination";

export default function CategoryPagination({
  page,
  limit,
  total,
  onPageChange,
}) {
  const { t } = useTranslation("admin");

  if (!total || total <= limit) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-4 flex justify-end">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
              text={t("common.pagination.previous")}
              data-testid="categories-pagination-prev"
            />
          </PaginationItem>
          {generatePaginationLinks(page, totalPages).map(
            (pageNumber, index) => {
              if (pageNumber === "ellipsis") {
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
                    className="cursor-pointer"
                    data-testid={`categories-pagination-${pageNumber}`}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            },
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              text={t("common.pagination.next")}
              data-testid="categories-pagination-next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
