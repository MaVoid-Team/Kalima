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

/**
 * Valid order statuses for filters and general usage
 */
export const ORDER_STATUSES = ['pending', 'received', 'confirmed', 'returned'];

/**
 * Formats amount into EGP currency string
 * @param {number|string} amount 
 * @param {string} t translation function (optional)
 * @returns {string}
 */
export function formatCurrency(amount, t) {
  const num = parseFloat(amount);
  const currencySymbol = t ? t('common.currencyEGP', 'EGP') : 'EGP';
  if (isNaN(num)) return `${currencySymbol} 0.00`;
  return `${currencySymbol} ${num.toFixed(2)}`;
}

/**
 * Localized date formatting for orders
 * @param {string} dateString 
 * @param {string} lang e.g. 'ar' or 'en'
 * @returns {string}
 */
export function formatOrderDate(dateString, lang = 'en') {
  if (!dateString) return "";
  const date = new Date(dateString);
  let locale = lang;
  if (lang === 'ar') locale = 'ar-EG';
  return date.toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Returns Tailwind color classes based on order status
 * @param {string} status 
 * @returns {string}
 */
export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-highlight/20 text-highlight hover:bg-highlight/30 border-highlight/50';
    case 'received': return 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/50';
    case 'confirmed': return 'bg-success/20 text-success hover:bg-success/30 border-success/50';
    case 'returned': return 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50';
    default: return 'bg-muted/20 text-muted-foreground border-muted';
  }
}
