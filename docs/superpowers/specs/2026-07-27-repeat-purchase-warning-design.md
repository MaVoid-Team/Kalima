# Repeat Purchase Warning Design

## Goal

Warn an authenticated customer before they submit a regular-product or e-booklet purchase containing an item they purchased or requested before.

The warning must inform the customer without preventing a repeated purchase.

## Scope

The first release covers both customer checkout systems:

- Regular store products.
- Teacher e-booklets.

The warning appears only at the final purchase action.

Cart browsing and adding items to the cart remain unchanged.

## Previous Purchase Definition

An item is considered previously purchased when an order for the same authenticated customer contains the same stable item identifier and has an active or successful status.

Included statuses are pending, paid, approved, processing, and completed, together with their existing equivalent statuses in each checkout system.

Excluded statuses are failed, rejected, cancelled, and refunded, together with their existing equivalent statuses.

Regular products are matched by their stable product identifier.

E-booklets are matched by their stable template identifier rather than their title or current version identifier.

Matching by title, price, or display text is not allowed because those values can change.

## Customer Flow

1. The customer completes the checkout form.
2. The customer clicks the final `Place order` or `Submit purchase` action.
3. Existing client-side validation runs first.
4. The frontend sends the current item identifiers to an authenticated duplicate-purchase preflight endpoint.
5. If no duplicates exist, the frontend submits the purchase normally.
6. If duplicates exist, the frontend opens a compact confirmation dialog listing each repeated item.
7. Selecting `Go back` closes the dialog and leaves the checkout form unchanged.
8. Selecting `Continue purchase` submits the purchase normally without another warning for that submission attempt.

The dialog copy is:

> You have purchased or already requested these items before.
> Do you want to purchase them again?

The dialog actions are `Go back` and `Continue purchase`.

## Backend Design

Each checkout system exposes an authenticated preflight operation using its existing route and service conventions.

The request contains only the stable identifiers required for matching.

The server derives the customer identity from the authenticated session or token and never accepts a customer identifier from the client.

The server queries prior order items through their owning orders and filters by the included and excluded status rules.

The response returns a normalized list containing the stable item identifier and current display title for each duplicate.

The operation does not create, modify, reserve, or cancel an order.

The existing order-creation endpoints remain unchanged and continue to permit repeated purchases.

## Frontend Design

Both checkout pages use the same small presentation component for the warning dialog while retaining checkout-specific request logic.

The dialog follows Kalima's existing accessible dialog components, spacing, button hierarchy, focus management, keyboard behavior, RTL behavior, and mobile width constraints.

`Go back` is the safe secondary action.

`Continue purchase` is the explicit primary action.

The dialog lists duplicate item titles when more than one cart item matches.

The form data and uploaded payment proof remain intact when the dialog opens or closes.

Repeated clicks are disabled while the preflight check or final submission is running.

## Failure Handling

If the preflight request fails, the application shows the existing checkout error treatment and does not silently submit the order.

The customer can retry the final purchase action after the temporary failure is resolved.

If the final order submission fails after confirmation, the existing checkout error behavior remains authoritative.

The confirmation applies only to the current submission attempt.

Changing the cart or leaving the page requires a new preflight check.

## Testing

Backend tests cover:

- A matching item in every active or successful status is returned.
- A matching item in every excluded status is ignored.
- Orders belonging to another customer are ignored.
- Regular products match by product identifier.
- E-booklets match by template identifier across template versions.
- Multiple duplicate items are returned once each.
- Unauthenticated requests are rejected.
- The preflight operation does not mutate order data.

Frontend tests cover:

- A checkout with no duplicates submits immediately.
- A checkout with duplicates opens the warning and does not submit yet.
- `Go back` closes the warning and preserves the form.
- `Continue purchase` submits exactly once.
- Multiple duplicate titles render correctly.
- A failed preflight check shows an error and does not submit.
- The warning works in both regular-product and e-booklet checkout.

Browser verification covers desktop, mobile, English, Arabic RTL, keyboard focus, and both dialog actions.

The final UI proof includes a screenshot of the warning with at least one repeated item visible.

## Success Criteria

An authenticated customer receives a clear warning immediately before submitting a repeated regular-product or e-booklet purchase.

Pending purchases trigger the warning.

Failed, rejected, cancelled, and refunded purchases do not trigger the warning.

The customer can deliberately continue and complete the repeated purchase.

No repeated purchase is blocked or automatically cancelled.
