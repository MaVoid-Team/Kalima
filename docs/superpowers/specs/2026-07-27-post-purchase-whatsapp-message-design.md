# Post-Purchase WhatsApp Message Update

## Goal

Update the Arabic WhatsApp message shown to administrators after a customer purchase.

## Message Changes

- Change the greeting from `هلاً بك أ/ {{name}}` to `اهلا بك أ/ {{name}}`.
- Add `طلبك هيكون جاهز في أقل من 24 ساعة.` immediately after the existing order-received sentence.
- Keep the order number, purchased products, total, support text, and closing unchanged.

## Scope

The change applies only to the Arabic post-purchase WhatsApp template.
It does not change email templates, order processing, delivery timing, or messages in other languages.

## Verification

- Add or update focused automated coverage for the Arabic translation values.
- Open the real administrator order message dialog in the local application.
- Confirm the greeting and 24-hour promise appear in the generated customer message.
- Capture a screenshot that visibly highlights both changed lines.
