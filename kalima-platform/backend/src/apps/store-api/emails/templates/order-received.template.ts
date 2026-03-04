export interface OrderReceivedEmailData {
  name: string;
  purchaseSerial: string;
  totalItems: number;
  productListHTML: string;
  ordersUrl?: string;
}

export function getOrderReceivedEmailSubject(): string {
  return "تم استلام طلبك";
}

export function getOrderReceivedEmailHtml(
  data: OrderReceivedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم استلام طلبك</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'IBM Plex Sans Arabic', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f8f8;" dir="rtl">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 12px 30px rgba(175,13,14,0.08);">
          <tr>
            <td style="padding: 32px 40px 20px; text-align: center; background-color: #af0d0e; border-radius: 12px 12px 0 0;">
              <img src="cid:kalima-logo" alt="Kalima" width="72" style="display: block; margin: 0 auto 12px; height: auto;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">تم استلام طلبك</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 700;">شكرًا على شرائك!</h2>
              <p style="margin: 0 0 12px; color: #4b5563; font-size: 16px; line-height: 1.8;">عميلنا ${data.name}،</p>
              <p style="margin: 0 0 12px; color: #4b5563; font-size: 16px; line-height: 1.8;">يسرنا إعلامك أن طلبك (<strong>${data.purchaseSerial}</strong>) تم استلامه.</p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">لقد طلبت <strong>${data.totalItems}</strong> منتجًا.</p>
              <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr>
                    <th style="text-align:center; padding: 10px; border-bottom: 1px solid #e5e7eb; background-color: #fcfcfc; color: #1a1a1a;">الرقم</th>
                    <th style="text-align:start; padding: 10px; border-bottom: 1px solid #e5e7eb; background-color: #fcfcfc; color: #1a1a1a;">المنتج</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.productListHTML}
                </tbody>
              </table>
              <p style="margin: 20px 0 0; color: #4b5563; font-size: 15px; line-height: 1.8;">سيتم معالجة طلبك بعد مراجعة الدفع من فريقنا خلال ساعات العمل من <strong>9:00 صباحًا إلى 9:00 مساءً</strong>.</p>
              ${
                data.ordersUrl
                  ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${data.ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #af0d0e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700;">عرض طلباتي</a>
              </div>
              `
                  : ""
              }
              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.8;">إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم.</p>
              <p style="margin: 16px 0 0; color: #1a1a1a; font-size: 15px; line-height: 1.8;">مع أطيب التحيات،<br><strong>فريق كلمة</strong></p>
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

export function getOrderReceivedEmailText(
  data: OrderReceivedEmailData,
): string {
  return `
شكرًا على شرائك!

عميلنا ${data.name}،

يسرنا إعلامك أن طلبك (${data.purchaseSerial}) تم استلامه.
لقد طلبت ${data.totalItems} منتجًا.

سيتم معالجة طلبك بعد مراجعة الدفع من فريقنا خلال ساعات العمل من 9:00 صباحًا إلى 9:00 مساءً.
${
  data.ordersUrl
    ? `
عرض طلباتي: ${data.ordersUrl}
`
    : ""
}
إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم.

مع أطيب التحيات،
فريق كلمة
  `.trim();
}
