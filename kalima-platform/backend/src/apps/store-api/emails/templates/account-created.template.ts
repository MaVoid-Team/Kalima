export interface AccountCreatedEmailData {
  name: string;
  role: string;
  verificationUrl: string;
  expiresInHours: number;
}

export function getAccountCreatedEmailSubject(): string {
  return "مرحبًا بك في منصة كلمة - قم بتفعيل حسابك";
}

export function getAccountCreatedEmailHtml(
  data: AccountCreatedEmailData,
): string {
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
                شكرًا لانضمامك إلى منصة كلمة بصفتك <strong>${data.role}</strong>! نحن متحمسون لوجودك معنا.
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                لإكمال التسجيل والوصول إلى جميع الميزات، الرجاء تأكيد بريدك الإلكتروني عبر الضغط على الزر أدناه:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                      <a href="${data.verificationUrl}" 
                        style="display: inline-block; padding: 16px 40px; background-color: #af0d0e; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px;">
                      ✅ تفعيل حسابي
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4b5563; font-size: 14px; line-height: 1.8;">
                أو انسخ هذا الرابط والصقه في المتصفح:
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #fcfcfc; border-radius: 6px; word-break: break-all; color: #af0d0e; font-size: 14px; border: 1px solid #f1f1f1;">
                ${data.verificationUrl}
              </p>
              
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                سينتهي صلاحية هذا الرابط خلال <strong>${data.expiresInHours} ساعات</strong>.
              </p>
              
              <!-- Info Box -->
              <div style="margin: 30px 0 0; padding: 20px; background-color: #fcf5e9; border-radius: 10px; border-left: 4px solid #c5a059;">
                <p style="margin: 0; color: #7a5e2a; font-size: 14px; line-height: 1.8;">
                  <strong>ماذا سيحدث بعد ذلك؟</strong><br>
                  بمجرد تأكيد بريدك، ستحصل على وصول كامل لجميع الميزات المتاحة لحسابك كـ ${data.role}.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fcfcfc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
              </p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">
                إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
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

export function getAccountCreatedEmailText(
  data: AccountCreatedEmailData,
): string {
  return `
مرحبًا بك في منصة كلمة!

مرحبًا ${data.name}!

شكرًا لانضمامك إلى منصة كلمة بصفتك ${data.role}! نحن متحمسون لوجودك معنا.

لإكمال التسجيل والوصول إلى جميع الميزات، الرجاء تأكيد بريدك الإلكتروني من خلال الرابط التالي:

${data.verificationUrl}

سينتهي صلاحية هذا الرابط خلال ${data.expiresInHours} ساعات.

ماذا سيحدث بعد ذلك؟
بمجرد تأكيد بريدك، ستحصل على وصول كامل لجميع الميزات المتاحة لحسابك كـ ${data.role}.

© ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
  `.trim();
}
