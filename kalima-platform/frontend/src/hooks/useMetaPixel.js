/**
 * Meta Pixel Hook for tracking user events
 * Pixel ID: 895806246503953
 */

const PIXEL_ID = '895806246503953';

/**
 * Initialize Meta Pixel - call once on app load
 */
export const initMetaPixel = () => {
    if (window.fbq) return;

    (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
};

/**
 * Track a custom event
 * @param {string} eventName - The event name
 * @param {object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
    if (window.fbq) {
        window.fbq('track', eventName, params);
    }
};

/**
 * Track ViewContent event - when a user views a product/content
 * @param {object} params - { content_name, content_category, content_ids, content_type, value, currency }
 */
export const trackViewContent = ({
    contentName,
    contentCategory,
    contentIds = [],
    contentType = 'product',
    value,
    currency = 'EGP',
}) => {
    trackEvent('ViewContent', {
        content_name: contentName,
        content_category: contentCategory,
        content_ids: contentIds,
        content_type: contentType,
        value: value,
        currency: currency,
    });
};

/**
 * Track AddToCart event - when a user adds item to cart
 * @param {object} params - { content_name, content_ids, content_type, value, currency }
 */
export const trackAddToCart = ({
    contentName,
    contentIds = [],
    contentType = 'product',
    value,
    currency = 'EGP',
}) => {
    trackEvent('AddToCart', {
        content_name: contentName,
        content_ids: contentIds,
        content_type: contentType,
        value: value,
        currency: currency,
    });
};

/**
 * Track InitiateCheckout event - when a user starts checkout
 * @param {object} params - { content_ids, content_type, value, currency, num_items }
 */
export const trackInitiateCheckout = ({
    contentIds = [],
    contentType = 'product',
    value,
    currency = 'EGP',
    numItems,
}) => {
    trackEvent('InitiateCheckout', {
        content_ids: contentIds,
        content_type: contentType,
        value: value,
        currency: currency,
        num_items: numItems,
    });
};

/**
 * Track Purchase event - when a user completes a purchase
 * @param {object} params - { content_ids, content_type, value, currency, num_items }
 */
export const trackPurchase = ({
    contentIds = [],
    contentType = 'product',
    value,
    currency = 'EGP',
    numItems,
}) => {
    trackEvent('Purchase', {
        content_ids: contentIds,
        content_type: contentType,
        value: value,
        currency: currency,
        num_items: numItems,
    });
};

/**
 * React hook for Meta Pixel - provides all tracking functions
 */
export const useMetaPixel = () => {
    return {
        trackEvent,
        trackViewContent,
        trackAddToCart,
        trackInitiateCheckout,
        trackPurchase,
    };
};

export default useMetaPixel;
