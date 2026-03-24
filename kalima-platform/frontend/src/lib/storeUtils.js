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
 * Calculates discount percentage from original and discounted prices.
 * @param {number|string} mainPrice
 * @param {number|string} priceAfterDiscount
 * @param {number} precision number of decimal places in the result
 * @returns {number}
 */
export function calculateDiscountPercentage(mainPrice, priceAfterDiscount, precision = 2) {
  const original = Number.parseFloat(mainPrice);
  const discounted = Number.parseFloat(priceAfterDiscount);

  if (Number.isNaN(original) || Number.isNaN(discounted) || original <= 0) return 0;

  const raw = ((original - discounted) / original) * 100;
  const bounded = Math.max(0, Math.min(100, raw));

  return Number(bounded.toFixed(precision));
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
    import.meta.env.VITE_API_URL || "/api/v2";
  // Remove the trailing /api/vX to get the root domain
  const rootURL = baseURL.replace(/\/api\/v\d+$/, "");

  return `${rootURL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Returns the base API URL without trailing paths
 * @returns {string}
 */
export function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || "/api/v2";
  try {
    return new URL(raw).origin;
  } catch {
    try {
      return new URL(raw, globalThis.location.origin).origin;
    } catch {
      return globalThis.location.origin;
    }
  }
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
 * Builds a unified media array (images + videos) for advanced galleries.
 * @param {object} product
 * @returns {{ main: object|null, thumbnails: object[] }}
 */
export function buildProductMedia(product) {
  const mainImage = getImageUrl(product?.thumbnail_image?.url);
  const main = mainImage ? { type: 'image', url: mainImage, isMain: true } : null;

  const galleryImages = (product?.product_gallery || []).map(g => ({
    type: 'image',
    url: getImageUrl(g?.images?.url),
    sort_order: g.sort_order || 0
  })).filter(g => g.url);

  const galleryVideos = (product?.product_gallery_videos || []).map(v => {
    const isYoutube = v.url?.includes('youtube.com') || v.url?.includes('youtu.be');
    let thumbnail = null;
    if (isYoutube) {
      try {
        let videoId = '';
        if (v.url.includes('youtube.com/watch')) {
          videoId = new URL(v.url).searchParams.get('v');
        } else if (v.url.includes('youtu.be/')) {
          videoId = v.url.split('youtu.be/')[1].split(/[?#]/)[0];
        }
        if (videoId) thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      } catch (e) {}
    }
    return {
      type: 'video',
      url: getImageUrl(v.url),
      thumbnail,
      source_type: v.source_type,
      sort_order: v.sort_order || 0
    };
  }).filter(v => v.url);

  const thumbnails = [...galleryImages, ...galleryVideos].sort((a,b) => a.sort_order - b.sort_order);
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

/**
 * Formats a byte count into a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
