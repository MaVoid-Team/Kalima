/**
 * Shared utility helpers for the store/market feature.
 */

/**
 * Formats a numeric price to 2 decimal places.
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
}

/**
 * Builds the images object expected by ImageGallery from API data.
 * @param {object} product  - raw product from GET /products/:id
 * @param {Array}  gallery  - raw gallery from GET /products/:id/gallery
 * @returns {{ main: string|null, thumbnails: string[] }}
 */
export function buildProductImages(product, gallery = []) {
    const main = product?.thumbnail_image?.url ?? null;
    const thumbnails = gallery
        .map((item) => item?.url ?? item?.image_url ?? item?.images?.url ?? item)
        .filter((url) => typeof url === "string" && url.length > 0);
    return { main, thumbnails };
}
