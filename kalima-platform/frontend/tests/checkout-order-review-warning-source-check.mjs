import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

function read(relPath) {
  return fs.readFileSync(path.join(frontendRoot, relPath), "utf8");
}

console.log("Checking checkout review warning implementation...");

// 1. OrderReviewWarning component exists
const warningComp = read("src/components/checkout/OrderReviewWarning.jsx");
assert.ok(
  warningComp.includes('data-testid="checkout-modification-warning"'),
  "OrderReviewWarning must have data-testid"
);
assert.ok(
  warningComp.includes("orderSummary.reviewWarningTitle"),
  "OrderReviewWarning must use reviewWarningTitle translation"
);
assert.ok(
  warningComp.includes("orderSummary.reviewWarningMessage"),
  "OrderReviewWarning must use reviewWarningMessage translation"
);

// 2. PricingSummary includes OrderReviewWarning
const pricingSummary = read("src/components/checkout/PricingSummary.jsx");
assert.ok(
  pricingSummary.includes("OrderReviewWarning"),
  "PricingSummary must import and render OrderReviewWarning"
);

// 3. FastBuyOrderSummaryCard includes OrderReviewWarning
const fastBuySummary = read("src/components/fast-buy/FastBuyOrderSummaryCard.jsx");
assert.ok(
  fastBuySummary.includes("OrderReviewWarning"),
  "FastBuyOrderSummaryCard must import and render OrderReviewWarning"
);

// 4. OrderSummaryCard includes OrderReviewWarning
const orderSummaryCard = read("src/components/checkout/OrderSummaryCard.jsx");
assert.ok(
  orderSummaryCard.includes("OrderReviewWarning"),
  "OrderSummaryCard must import and render OrderReviewWarning"
);

// 5. Arabic and English locale files
const arCheckout = JSON.parse(read("src/locales/ar/checkout.json"));
const enCheckout = JSON.parse(read("src/locales/en/checkout.json"));

assert.ok(
  arCheckout.orderSummary?.reviewWarningTitle,
  "ar/checkout.json must have orderSummary.reviewWarningTitle"
);
assert.ok(
  arCheckout.orderSummary?.reviewWarningMessage,
  "ar/checkout.json must have orderSummary.reviewWarningMessage"
);
assert.ok(
  arCheckout.orderSummary.reviewWarningMessage.includes("50"),
  "ar/checkout.json reviewWarningMessage must mention 50 EGP"
);

assert.ok(
  enCheckout.orderSummary?.reviewWarningTitle,
  "en/checkout.json must have orderSummary.reviewWarningTitle"
);
assert.ok(
  enCheckout.orderSummary?.reviewWarningMessage,
  "en/checkout.json must have orderSummary.reviewWarningMessage"
);
assert.ok(
  enCheckout.orderSummary.reviewWarningMessage.includes("50"),
  "en/checkout.json reviewWarningMessage must mention 50 EGP"
);

console.log("All checkout review warning checks passed!");
