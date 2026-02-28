export interface OrderReceivedEmailData {
  name: string;
  purchaseSerial: string;
  totalItems: number;
  productListHTML: string;
  ordersUrl?: string;
}

export function getOrderReceivedEmailSubject(): string {
  return "Your Order Has Been Received";
}

export function getOrderReceivedEmailHtml(
  data: OrderReceivedEmailData,
): string {
  return `
<div dir="auto" style='font-family: Arial, sans-serif;'>
    <h2>Thank you for your purchase!</h2>
    <p>Dear ${data.name},</p>
    <p>We’re happy to let you know that your order (<b>${data.purchaseSerial}</b>) has been received.</p>
    <p>You have ordered <b>${data.totalItems}</b> product(s).</p>
    <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
            <tr>
                <th style="text-align:center; padding: 8px; border-bottom: 1px solid #ddd;">##</th>
                <th style="text-align:start; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
            </tr>
        </thead>
        <tbody>
            ${data.productListHTML}
        </tbody>
    </table>
    <p>Your order will be processed after the payment is reviewed by our team during working hours from <b>9:00 AM to 9:00 PM</b>.</p>
    ${
      data.ordersUrl
        ? `
    <div style="text-align: center; margin: 20px 0;">
        <a href="${data.ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View My Orders</a>
    </div>
    `
        : ""
    }
    <p>If you have any questions, please contact our support team.</p>
    <br>
    <p>Best regards,<br><b>Kalima Team</b></p>
</div>
  `.trim();
}

export function getOrderReceivedEmailText(
  data: OrderReceivedEmailData,
): string {
  return `
Thank you for your purchase!

Dear ${data.name},

We’re happy to let you know that your order (${data.purchaseSerial}) has been received.
You have ordered ${data.totalItems} product(s).

Your order will be processed after the payment is reviewed by our team during working hours from 9:00 AM to 9:00 PM.
${
  data.ordersUrl
    ? `
View My Orders: ${data.ordersUrl}
`
    : ""
}
If you have any questions, please contact our support team.

Best regards,
Kalima Team
  `.trim();
}
