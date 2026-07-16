import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const proofDir = path.resolve(process.cwd(), "..", "..", ".codex/e2e-proof/product-image-zoom");

const productFixture = {
  success: true,
  data: {
    id: 1,
    title: "Zoom Test Product",
    serial: "ZOOM-001",
    price: 120,
    price_after_discount: 99,
    is_released: true,
    thumbnail_image: { url: "https://fixture.local/image-main.svg" },
    product_gallery: [
      {
        id: 2,
        url: "https://fixture.local/image-detail.svg",
        images: { url: "https://fixture.local/image-detail.svg" },
        sort_order: 1,
      },
    ],
    product_gallery_videos: [],
    product_categories: [],
    product_required_fields: [],
    product_reviews: [],
  },
};

const mainImage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#0f172a"/><circle cx="600" cy="450" r="260" fill="#22d3ee"/><circle cx="600" cy="450" r="160" fill="#f59e0b"/><text x="600" y="470" fill="#0f172a" font-family="sans-serif" font-size="72" font-weight="700" text-anchor="middle">KALIMA</text></svg>`;

test("opens the product image viewer and zooms the selected image", async ({ page }) => {
  await page.route("**/api/v2/products/1", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(productFixture),
  }));
  await page.route("**/image-main.svg", (route) => route.fulfill({
    status: 200,
    contentType: "image/svg+xml",
    body: mainImage,
  }));
  await page.route("**/image-detail.svg", (route) => route.fulfill({
    status: 200,
    contentType: "image/svg+xml",
    body: mainImage,
  }));

  await page.goto("/product/1");
  await page.getByTestId("product-gallery-main-button").click();

  await expect(page.getByTestId("product-image-viewer")).toBeVisible();
  await expect(page.getByTestId("product-image-zoom-level")).toHaveText("100%");
  await page.getByTestId("product-image-zoom-in").click();
  await expect(page.getByTestId("product-image-zoom-level")).toHaveText("125%");
  await page.getByTestId("product-image-zoom-in").click();
  await expect(page.getByTestId("product-image-zoom-level")).toHaveText("150%");
  await page.waitForTimeout(250);

  fs.mkdirSync(proofDir, { recursive: true });
  await page.screenshot({
    path: path.join(proofDir, "product-image-viewer-zoomed.png"),
    fullPage: false,
  });

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByTestId("product-image-viewer")).toBeHidden();
});
