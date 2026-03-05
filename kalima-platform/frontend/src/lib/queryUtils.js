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
 * @param {Object} [options.pagination] Pagination parameters (e.g. { page: 1, limit: 8 })
 * @param {Object} [options.filters] Filter parameters (e.g. { search: 'foo', status: 'pending', startDate: Date, endDate: Date })
 * @returns {string} The constructed query string (e.g. "page=1&limit=8&search=foo")
 */
export const buildQueryString = ({ pagination = {}, filters = {} }) => {
    const query = new URLSearchParams();

    // Pagination
    if (pagination.page !== undefined) query.append('page', pagination.page);
    if (pagination.limit !== undefined) query.append('limit', pagination.limit);

    // Filters
    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'status' && value === 'all') return;

        const appendValue = (singleValue) => {
            if (singleValue === undefined || singleValue === null || singleValue === '') return;

            const isDateKey = /date/i.test(key);
            const isDateValue = singleValue instanceof Date;

            if (isDateValue || isDateKey) {
                query.append(key, formatISODateWithoutMs(singleValue));
                return;
            }

            query.append(key, String(singleValue));
        };

        if (Array.isArray(value)) {
            value.forEach(appendValue);
            return;
        }

        appendValue(value);
    });

    return query.toString();
};
