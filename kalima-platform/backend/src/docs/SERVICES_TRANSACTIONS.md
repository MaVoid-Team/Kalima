# Transactional Services (Cart & Purchases)

This document covers the core transaction loop of the eCommerce application, residing in `cart.service.ts` and `purchases.service.ts`.

---

## 1. `cart.service.ts`

**Primary Responsibility:**
Manages the temporary storage of items a user intends to buy. Handles adding items, removing items, updating quantities, and applying discount coupons.

**Core Dependencies:**

- `libs/db`: Intensive Prisma interaction.
- `product.service.ts`: To verify product existence and pricing before allowing it into a cart.
- `coupon.service.ts`: To validate if a coupon code is active and applicable to the current cart context.
- `cartCache.service.ts`: A secondary service that leverages Redis to temporarily cache cart grand-totals to prevent rapid DB recalculation on every page load.

**Database Models Touched:**

- `Carts` (Read/Upsert)
- `CartItems` (Insert/Update/Delete)
- `Products` (Read)

**Crucial Business Logic (Applying a Coupon):**
When applying a coupon:

1. Calculates raw total of `CartItems`.
2. Verifies `Coupon` expiration date and usage limits.
3. Verifies if the `Minimum Cart Value` threshold of the coupon is met.
4. Generates a new discounted total and attaches the `couponId` to the `Cart` document.

---

## 2. `purchases.service.ts`

**Primary Responsibility:**
The most critical service. It converts an active `Cart` into a legally binding `Purchase` (Order). It handles stock depletion and triggers notifications.

**Core Dependencies:**

- `libs/db`: For wrapping the entire checkout process in a **Database Transaction**.
- `cart.service.ts`: To fetch the final cart state.
- `image.service.ts`: If purchases require uploading payment receipts (e.g., bank transfer screenshots).
- `emails/`: To send order confirmation invoices to the customer.
- `notificationStream.service.ts`: To fire events to Redis/Sockets alerting Admins of a new pending purchase.

**Database Models Touched:**

- `Purchases` (Insert)
- `PurchaseItems` (Insert)
- `Carts` (Delete/Clear)
- `Products` (Update - Decrease Stock)

**Architectural Blueprint (Transactional Integrity):**
Checkout cannot partially fail. If the cart clears but the purchase isn't created, data is lost.
Therefore, `purchases.service.ts` relies heavily on Prisma's interactive transactions:

```typescript
await db.$transaction(async (prisma) => {
  // 1. Create Purchase
  // 2. Transfer CartItems to PurchaseItems
  // 3. Clear Cart
  // 4. Reduce Product Inventory (Stock - 1)
});
// If step 4 fails due to out-of-stock, steps 1-3 are automatically rolled back.
```
