
/**
 * Helper function to format price
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
    return `${price || 0} ج`; // Assuming 'ج' is the currency symbol
};

/**
 * Helper function to calculate cart total
 * @param {object} order 
 * @returns {number}
 */
export const calculateCartTotal = (order) => {
    if (!order || !order.items) return 0;
    return order.items.reduce(
        (total, item) =>
            total + (item.priceAtPurchase * item.quantity || item.priceAtPurchase),
        0
    );
};

/**
 * Get comma-separated product names from order
 * @param {object} order 
 * @returns {string}
 */
export const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) {
        return "N/A";
    }
    return order.items
        .map((item) => item.productSnapshot?.title || "Unknown")
        .join(", ");
};

/**
 * Determine the type of order based on items
 * @param {object} order 
 * @returns {string} "Book", "Product", "Mixed"
 */
export const getOrderType = (order) => {
    if (!order.items || order.items.length === 0) {
        return "Product";
    }
    const hasBooks = order.items.some((item) => item.productType === "ECBook");
    const hasProducts = order.items.some(
        (item) => item.productType === "ECProduct"
    );
    if (hasBooks && hasProducts) {
        return "Mixed";
    }
    return hasBooks ? "Book" : "Product";
};

/**
 * Format date string to time
 * @param {string} dateString 
 * @param {string} locale 
 * @returns {string}
 */
export const formatTime = (dateString, locale = 'en') =>
    new Date(dateString).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
