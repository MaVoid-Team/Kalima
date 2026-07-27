# Required Post-Purchase Tracking Design

## Goal

After checkout succeeds, the purchase receipt popup must direct the customer to track the order through WhatsApp.
The customer must not be able to dismiss the popup without selecting the tracking action.

## User Experience

The popup continues to display the purchase receipt, including the serial, status, totals, item count, and purchased items.
A short instruction tells the customer to continue on WhatsApp to track the order.
The only visible action is a full-width, visually prominent `Track your order` button with the existing WhatsApp icon.
The button uses Kalima's success color treatment so its purpose is clear and distinct from the red purchase action behind the popup.

## Required Behavior

The existing Print, View My Orders, and Cancel actions are removed.
Clicking outside the popup does not close it.
Pressing Escape does not close it.
The popup does not expose another dismissal control.
Clicking `Track your order` opens the existing WhatsApp URL in a new tab with the order serial prefilled in the message.
The popup remains open in the Kalima tab after WhatsApp is opened.

## Scope

The change is limited to the standard cart checkout receipt in `PaymentStep`.
It does not change the standalone checkout success card, fast-buy flow, order creation, receipt data, or WhatsApp message content.

## Testing

A focused component or source-contract test verifies that the receipt exposes only the tracking action and no longer exposes Print, View My Orders, or Cancel.
The test also verifies that outside interaction and Escape cannot dismiss the popup.
Browser verification completes a real local purchase and confirms the receipt popup contains one action, the WhatsApp link contains the generated purchase serial, and the popup remains visible after an attempted outside click and Escape.
A screenshot records the verified real-app result.
