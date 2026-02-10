// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase book strategy.
// Strategy for book purchases; currently only adds book metadata
module.exports = {
  type: "ECBook",
  decorateItems: (items, body) =>
    items.map((item) => ({
      ...item,
      nameOnBook: body.nameOnBook,
      numberOnBook: body.numberOnBook,
      seriesName: body.seriesName,
    })),
};
