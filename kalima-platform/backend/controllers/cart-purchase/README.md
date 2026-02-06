# Cart Purchase Module

## Module Overview

Handles checkout orchestration end-to-end while keeping logic isolated: validation lives in `services/checkoutValidator.js`, price math in `services/priceCalculator.js`, and product-type rules in `strategies/`. The controller wires these pieces together, persists the purchase, and triggers notifications.

## Architecture & Design Pattern

We apply the Strategy Pattern to separate book-specific decoration from generic product handling. The controller delegates to a factory that inspects cart item types and returns the right strategy. All volatile logic (validation, math) sits behind services to keep the controller thin.

Flow (text diagram):

```
HTTP POST /cart-purchases
	-> controller/createCartPurchase
		-> throttle check
		-> load cart (itemsWithDetails + coupon)
		-> CheckoutValidator (cart not empty, book fields, payment rules)
		-> StrategyFactory picks bookStrategy | productStrategy
				-> strategy.decorateItems(lineItems)
		-> PriceCalculator (line items + cart totals)
		-> persist ECCartPurchase
		-> notifications (email/optional WhatsApp/admin/bell)
		-> user stats update + cart.clear()
```

## File Structure

```
cart-purchase/
	createCartPurchase.js       # Entry controller orchestrating the flow
	helpers.js                  # Timezone/business-minute helpers (shared with reports)
	index.js                    # Exports handlers for routes
	services/
		checkoutValidator.js      # All checkout validation rules (required fields, payment checks)
		priceCalculator.js        # Builds line items; reuses cart subtotal/discount/total
		serialService.js          # Cairo-time daily serial generation per user
	strategies/
		strategyFactory.js        # Chooses strategy based on item type; rejects mixed types
		bookStrategy.js           # Decorates items with book metadata
		productStrategy.js        # Pass-through for non-book items
	...other controllers        # read-only/reporting endpoints unchanged
```

## Extension Guide

- Add a Per-Item Coupon: extend logic in `services/priceCalculator.js` (apply per-item discounts, then adjust totals). Controller stays unchanged.
- Add Dynamic Required Fields: enhance `services/checkoutValidator.js` to load rules (e.g., from DB) and enforce them; no controller changes needed.
- Add a New Product Type: create a new strategy module with `decorateItems(items, body)` and register it in `strategies/strategyFactory.js`.

## Testing Strategy

- Unit test `services/checkoutValidator.js` with table-driven cases for required fields, book-only checks, and payment scenarios (free vs paid).
- Unit test `services/priceCalculator.js` to verify line-item construction and totals/discount preservation.
- Unit test strategies to ensure book decoration adds metadata and product strategy passes through.
- Integration test `createCartPurchase` happy paths (book vs product) using stubbed models or an in-memory DB; assert persistence shape and notifications are invoked.
