// Centralized price calculation to preserve behavior while isolating future changes
const PriceCalculator = {
  buildLineItems(cartItems, body) {
    return cartItems.map((item) => ({
      product: item.product._id,
      productType: item.product.__t || "ECProduct",
      priceAtPurchase: item.priceAtAdd,
      nameOnBook: item.product.__t === "ECBook" ? body.nameOnBook : undefined,
      numberOnBook:
        item.product.__t === "ECBook" ? body.numberOnBook : undefined,
      seriesName: item.product.__t === "ECBook" ? body.seriesName : undefined,
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
