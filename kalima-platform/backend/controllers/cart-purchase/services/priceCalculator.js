// Centralized price calculation to preserve behavior while isolating future changes.
// Product-type decoration (book fields etc.) is handled by strategies, not here.
const PriceCalculator = {
  buildLineItems(cartItems) {
    return cartItems.map((item) => ({
      product: item.product._id,
      productType: item.product.__t || "ECProduct",
      priceAtPurchase: item.priceAtAdd,
      productSnapshot: {
        title: item.product.title,
        thumbnail: item.product.thumbnail,
        section: item.product.section,
        serial: item.product.serial,
      },
    }));
  },

  totalsFromCart(cart) {
    return {
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      couponCode: cart.couponCode,
    };
  },
};

module.exports = PriceCalculator;
