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
 * Builds the absolute URL for an uploaded file using the API base URL.
 * @param {string|null} path
 * @returns {string|null}
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // Fallback if env variable is missing
  const baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v2";
  // Remove the trailing /api/vX to get the root domain
  const rootURL = baseURL.replace(/\/api\/v\d+$/, "");

  return `${rootURL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Builds the images object expected by ImageGallery from API data.
 * @param {object} product  - raw product from GET /products/:id
 * @param {Array}  gallery  - raw gallery from GET /products/:id/gallery
 * @returns {{ main: string|null, thumbnails: string[] }}
 */
export function buildProductImages(product, gallery = []) {
  const main = getImageUrl(product?.thumbnail_image?.url) ?? null;
  const thumbnails = gallery
    .map((item) =>
      getImageUrl(item?.url ?? item?.image_url ?? item?.images?.url ?? item),
    )
    .filter((url) => typeof url === "string" && url.length > 0);
  return { main, thumbnails };
}

/**
 * Calculates the checkout subtotal. Prioritizes backend preview subtotal,
 * otherwise falls back to calculating it manually from the mapped items array.
 * @param {object|null} preview
 * @param {Array} items
 * @returns {number}
 */
export function calculateCheckoutSubtotal(preview, items) {
  if (preview?.subtotal) return parseFloat(preview.subtotal);
  if (preview?.purchase?.subtotal) return parseFloat(preview.purchase.subtotal);

  return items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
}

/**
 * Formats and groups cart items for checkout display, merging identical products.
 * @param {Array} cartItems
 * @returns {Array}
 */
export function formatCheckoutItems(cartItems = []) {
  const grouped = cartItems.reduce((acc, item) => {
    const product = item.products ?? {};
    const id = product.id ?? item.id ?? Math.random();

    if (acc[id]) {
      acc[id].quantity += 1;
      return acc;
    }

    const imageSource =
      product.images?.[0]?.url ?? product.thumbnail_image?.url ?? item.image;

    acc[id] = {
      id,
      name: product.title ?? item.name ?? "",
      price: parseFloat(
        item.price_at_purchase ?? product.price ?? item.price ?? 0,
      ),
      image: getImageUrl(imageSource),
      type: product.type ?? item.type ?? "",
      quantity: item.quantity ?? 1,
    };

    return acc;
  }, {});

  return Object.values(grouped);
}
