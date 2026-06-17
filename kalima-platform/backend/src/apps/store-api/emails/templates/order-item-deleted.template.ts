export interface OrderItemDeletedEmailData {
  name: string;
  purchaseSerial: string;
  itemName: string;
  ordersUrl?: string;
}

export function getOrderItemDeletedEmailSubject(): string {
  return "تحديث على طلبك: تم إزالة منتج";
}

export function getOrderItemDeletedEmailHtml(
  data: OrderItemDeletedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تحديث على طلبك: تم إزالة منتج</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'IBM Plex Sans Arabic', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f8f8;" dir="rtl">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 12px 30px rgba(175,13,14,0.08);">
          <tr>
            <td style="padding: 32px 40px 20px; text-align: center; background-color: #f97316; border-radius: 12px 12px 0 0;">
              <img src="cid:kalima-logo" alt="Kalima" width="72" style="display: block; margin: 0 auto 12px; height: auto;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">تم إزالة منتج من طلبك</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 700;">مرحبًا ${data.name}،</h2>
              <p style="margin: 0 0 12px; color: #4b5563; font-size: 16px; line-height: 1.8;">نود إعلامك بأنه تم إزالة المنتج التالي من طلبك رقم (<strong>${data.purchaseSerial}</strong>):</p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <strong style="color: #1a1a1a; font-size: 18px;">${data.itemName}</strong>
              </div>
              <p style="margin: 20px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">تم هذا الإجراء بناءً على طلبك أو بسبب عدم توفر المنتج حاليًا. إذا كان قد تم الدفع المسبق لهذا المنتج، سيتم استرداد المبلغ ضمن سياسة الاسترجاع.</p>
              ${
                data.ordersUrl
                  ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${data.ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #af0d0e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700;">عرض تفاصيل الطلب المتحدثة</a>
              </div>
              `
                  : ""
              }
              <p style="margin: 16px 0 0; color: #1a1a1a; font-size: 15px; line-height: 1.8;">نأسف لأي إزعاج،<br><strong>فريق كلمة</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fcfcfc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getOrderItemDeletedEmailText(
  data: OrderItemDeletedEmailData,
): string {
  return `
تحديث على طلبك: تم إزالة منتج

مرحبًا ${data.name}،

نود إعلامك بأنه تم إزالة المنتج التالي من طلبك رقم (${data.purchaseSerial}):
${data.itemName}

تم هذا الإجراء بناءً على طلبك أو بسبب عدم توفر المنتج حاليًا. إذا كان قد تم الدفع المسبق لهذا المنتج، سيتم استرداد المبلغ ضمن سياسة الاسترجاع.
${
  data.ordersUrl
    ? `
عرض تفاصيل الطلب المتحدثة: ${data.ordersUrl}
`
    : ""
}
نأسف لأي إزعاج،
فريق كلمة
  `.trim();
}
