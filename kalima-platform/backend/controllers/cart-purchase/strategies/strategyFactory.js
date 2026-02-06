const AppError = require("../../../utils/appError");
const bookStrategy = require("./bookStrategy");
const productStrategy = require("./productStrategy");

const strategyByType = {
  ECBook: bookStrategy,
  ECProduct: productStrategy,
};

const detectType = (cartItems) => {
  const types = new Set(
    cartItems.map((item) => item.product?.__t || "ECProduct"),
  );
  if (types.size === 0) return "ECProduct";
  if (types.size > 1) {
    throw new AppError("Mixed product types in cart are not supported", 400);
  }
  return Array.from(types)[0];
};

const getStrategy = (cartItems) => {
  const type = detectType(cartItems);
  return strategyByType[type] || productStrategy;
};

module.exports = { getStrategy, detectType };
