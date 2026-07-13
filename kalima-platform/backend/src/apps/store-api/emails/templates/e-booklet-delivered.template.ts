export interface EBookletDeliveredEmailData {
  name: string;
  bookletTitle: string;
  ordersUrl?: string;
}

export function getEBookletDeliveredEmailSubject(): string {
  return "تم تسليم كتابك الإلكتروني";
}

export function getEBookletDeliveredEmailHtml(data: EBookletDeliveredEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم تسليم كتابك الإلكتروني</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'IBM Plex Sans Arabic', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f8f8;" dir="rtl">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 12px 30px rgba(175,13,14,0.08);">
          <tr>
            <td style="padding: 32px 40px 20px; text-align: center; background-color: #059669; border-radius: 12px 12px 0 0;">
              <img src="cid:kalima-logo" alt="Kalima" width="72" style="display: block; margin: 0 auto 12px; height: auto;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">تم تسليم كتابك الإلكتروني</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 700;">أصبح كتابك جاهزًا، ${data.name}!</h2>
              <p style="margin: 0 0 12px; color: #4b5563; font-size: 16px; line-height: 1.8;">تم تجهيز وتسليم كتابك الإلكتروني <strong>${data.bookletTitle}</strong> بنجاح.</p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">يمكنك الآن الدخول إلى مكتبتك والبدء باستخدامه.</p>
              ${data.ordersUrl ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${data.ordersUrl}" style="display: inline-block; padding: 12px 24px; background-color: #af0d0e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700;">عرض كتبي الإلكترونية</a>
              </div>
              ` : ""}
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

export function getEBookletDeliveredEmailText(data: EBookletDeliveredEmailData): string {
  return `
أصبح كتابك جاهزًا، ${data.name}!

تم تجهيز وتسليم كتابك الإلكتروني ${data.bookletTitle} بنجاح.
يمكنك الآن الدخول إلى مكتبتك والبدء باستخدامه.
${data.ordersUrl ? `\nعرض كتبي الإلكترونية: ${data.ordersUrl}\n` : ""}
مع أطيب التحيات،
فريق كلمة
  `.trim();
}
