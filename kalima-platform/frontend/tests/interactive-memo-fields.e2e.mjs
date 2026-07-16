import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.E2E_BASE_URL || "http://127.0.0.1:5178";
const proofDir = path.resolve(process.cwd(), "../../.codex/e2e-proof/interactive-memo-field-selection");
const screenshotPath = path.join(proofDir, "configured-optional-required-fields.png");

await mkdir(proofDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.addInitScript(() => {
  window.localStorage.setItem("accessToken", "local-e2e-token");
  window.localStorage.setItem("refreshToken", "local-e2e-refresh-token");
  window.localStorage.setItem(
    "user",
    JSON.stringify({ id: 1, name: "Local E2E Teacher", roles: ["Teacher"], confirmed: true }),
  );
});

const page = await context.newPage();
await page.route("**/api/v2/**", (route) => route.fulfill({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data: [] }),
}));
await page.route("**/api/v2/cart/fast-buy/checkout/preview", (route) => route.fulfill({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    data: {
      hasBooks: false,
      requiredFields: { common: [], itemsMissingFields: [] },
      isCheckoutReady: false,
    },
  }),
}));
await page.route("**/api/v2/cart/fast-buy", (route) => route.fulfill({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    data: {
      cart_items: [{
        id: 42,
        products: { title: "Configured memo product" },
        cart_item_required_fields: [
          {
            field_definition_id: 101,
            is_required: true,
            value: null,
            required_field_definitions: { label: "Required memo", field_type: "text" },
          },
          {
            field_definition_id: 202,
            is_required: false,
            value: null,
            required_field_definitions: { label: "Optional memo", field_type: "text" },
          },
        ],
      }],
      subtotal: 0,
      total: 0,
      discount: 0,
    },
  }),
}));
await page.route("**/api/v2/payment-methods", (route) => route.fulfill({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data: { data: [] } }),
}));

try {
  await page.goto(`${baseUrl}/fast-buy/checkout`);
  await page.getByTestId("fastbuy-dynamic-fields-text-input").nth(0).waitFor();

  const textInputs = page.getByTestId("fastbuy-dynamic-fields-text-input");
  assert.equal(await textInputs.count(), 2, "only the configured required and optional fields should render");
  assert.equal(await page.getByText("Required memo").count(), 1);
  assert.equal(await page.getByText("Optional memo").count(), 1);
  assert.equal(await page.getByText("Required memo").locator("..").getByText("*").count(), 1);
  assert.equal(await textInputs.nth(0).getAttribute("required"), "", "required configuration must reach the input");
  assert.equal(await textInputs.nth(1).getAttribute("required"), null, "optional configuration must remain optional");

  const submit = page.getByTestId("fastbuy-summary-submit-button");
  assert.equal(await submit.isDisabled(), true, "an empty required field must block checkout");
  await textInputs.nth(1).fill("optional value");
  assert.equal(await submit.isDisabled(), true, "an optional field must not satisfy required validation");
  await textInputs.nth(0).fill("required value");
  assert.equal(await submit.isDisabled(), false, "a filled required field should unblock checkout");

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Interactive memo fields browser E2E passed. Screenshot: ${screenshotPath}`);
} finally {
  await browser.close();
}
