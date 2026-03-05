export interface WelcomeEmailData {
  name: string;
  role: string;
  loginUrl: string;
}

export function getWelcomeEmailSubject(): string {
  return "مرحبًا بك في منصة كلمة!";
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مرحبًا بك في منصة كلمة</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'IBM Plex Sans Arabic', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f8f8;" dir="rtl">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 12px 30px rgba(175,13,14,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #af0d0e; border-radius: 12px 12px 0 0;">
              <img src="cid:kalima-logo" alt="Kalima" width="72" style="display: block; margin: 0 auto 16px; height: auto;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 مرحبًا بك في كلمة!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 700;">مرحبًا ${data.name}!</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                تم تأكيد بريدك الإلكتروني بنجاح. مرحبًا بك في منصة كلمة بصفتك <strong>${data.role}</strong>!
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                الآن لديك وصول كامل إلى جميع الميزات المتاحة لحسابك. إليك ما يمكنك فعله بعد ذلك:
              </p>
              
              <!-- Features List -->
              <ul style="margin: 0 0 20px; padding: 0 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.9;">
                <li>استكمال معلومات ملفك الشخصي</li>
                <li>استكشاف الدورات والمحتوى المتاح</li>
                <li>التواصل مع مستخدمين آخرين على المنصة</li>
                <li>الوصول إلى لوحة التحكم الشخصية</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                      <a href="${data.loginUrl}" 
                        style="display: inline-block; padding: 16px 40px; background-color: #af0d0e; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px;">
                      🚀 الذهاب إلى لوحة التحكم الخاصة بي
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                إذا كان لديك أي أسئلة أو تحتاج مساعدة، لا تتردد في التواصل مع فريق الدعم.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fcfcfc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
              </p>
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

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  return `
مرحبًا بك في منصة كلمة!

مرحبًا ${data.name}!

تم تأكيد بريدك الإلكتروني بنجاح. مرحبًا بك في منصة كلمة بصفتك ${data.role}!
الآن لديك وصول كامل إلى جميع الميزات المتاحة لحسابك. إليك ما يمكنك فعله بعد ذلك:

- استكمال معلومات ملفك الشخصي
- استكشاف الدورات والمحتوى المتاح
- التواصل مع مستخدمين آخرين على المنصة
- الوصول إلى لوحة التحكم الشخصية

قم بزيارة لوحة التحكم الخاصة بك: ${data.loginUrl}

إذا كان لديك أي أسئلة أو تحتاج مساعدة، لا تتردد في التواصل مع فريق الدعم.

© ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
  `.trim();
}
