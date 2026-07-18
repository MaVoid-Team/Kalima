export const REQUIRED_FIELDS_PAGE_SIZE = 10;
export const REQUIRED_FIELDS_LOOKUP_LIMIT = 1000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toNonNegativeInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export function normalizeRequiredFieldsPagination(response = {}, fallback = {}) {
  const limit = toPositiveInteger(
    response.limit,
    toPositiveInteger(fallback.limit, REQUIRED_FIELDS_PAGE_SIZE),
  );
  const total = toNonNegativeInteger(response.results, 0);
  const pages = Math.max(1, Math.ceil(total / limit));
  const requestedPage = toPositiveInteger(
    response.page,
    toPositiveInteger(fallback.page, 1),
  );

  return {
    total,
    page: Math.min(requestedPage, pages),
    limit,
    pages,
  };
}

export function getPageAfterRequiredFieldDelete(page, pageItemCount) {
  if (page > 1 && pageItemCount <= 1) return page - 1;
  return Math.max(1, page);
}
