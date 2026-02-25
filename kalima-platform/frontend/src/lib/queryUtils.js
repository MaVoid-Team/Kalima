/**
 * Utility functions for formatting and building API query parameters.
 */

/**
 * Ensures an ISO date string does not contain milliseconds, matching the exact YYYY-MM-DDT00:00:00Z format.
 * @param {Date | string} date The date to format
 * @returns {string} The formatted ISO string without milliseconds
 */
export const formatISODateWithoutMs = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/**
 * Builds a URL search query string from pagination and filter objects.
 * Automatically formats dates to match the expected API strict timezone formatting without ms.
 *
 * @param {Object} options Parameters to build the query from
 * @param {Object} [options.pagination] Pagination parameters (e.g. { page: 1, limit: 20 })
 * @param {Object} [options.filters] Filter parameters (e.g. { search: 'foo', status: 'pending', startDate: Date, endDate: Date })
 * @returns {string} The constructed query string (e.g. "page=1&limit=20&search=foo")
 */
export const buildQueryString = ({ pagination = {}, filters = {} }) => {
    const query = new URLSearchParams();

    // Pagination
    if (pagination.page !== undefined) query.append('page', pagination.page);
    if (pagination.limit !== undefined) query.append('limit', pagination.limit);

    // Filters
    if (filters.search) query.append('search', filters.search);
    if (filters.status && filters.status !== 'all') query.append('status', filters.status);

    if (filters.startDate) {
        query.append('startDate', formatISODateWithoutMs(filters.startDate));
    }

    if (filters.endDate) {
        query.append('endDate', formatISODateWithoutMs(filters.endDate));
    }

    return query.toString();
};
