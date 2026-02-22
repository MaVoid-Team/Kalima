/**
 * Shared cart/checkout utility functions.
 * Centralizes formatting and calculation logic to avoid duplication.
 */

/**
 * Format a number as a currency string.
 * @param {number} amount
 * @param {string} currency - e.g. 'SAR', 'USD'
 * @returns {string}
 */
export const formatCurrency = (amount, currency = "SAR") => {
  return `${Number(amount).toFixed(2)} ${currency}`;
};

/**
 * Calculate the total price for a list of cart items.
 * @param {Array} items - Array of cart item objects with `price` and `quantity`.
 * @returns {number}
 */
export const calculateSubtotal = (items = []) => {
  return items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
};

/**
 * Check if any cart items have unfulfilled required fields.
 * @param {Array} cartItems
 * @returns {Array} - Items that still need required fields filled.
 */
export const getItemsWithMissingFields = (cartItems = []) => {
  return cartItems.filter((item) => item.required_fields_filled === false);
};

/**
 * Get a localized field from a cart item (e.g. nameAr / nameEn).
 * @param {object} item
 * @param {string} base - Base field name (e.g. 'name')
 * @param {string} lang - Current language code (e.g. 'ar', 'en')
 * @returns {string}
 */
export const localizeField = (item, base, lang = "ar") => {
  const suffix = lang === "ar" ? "Ar" : "En";
  return (
    item?.[`${base}${suffix}`] ??
    item?.[base] ??
    item?.[`${base}En`] ??
    item?.[`${base}Ar`] ??
    ""
  );
};
