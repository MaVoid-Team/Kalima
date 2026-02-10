// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase product strategy.
// Strategy for non-book products; no extra decoration needed
module.exports = {
  type: "ECProduct",
  decorateItems: (items) => items,
};
