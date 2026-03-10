export interface PasswordChangedEmailData {
  name: string;
  changedAt: Date;
  ipAddress?: string;
  supportUrl: string;
}

export function getPasswordChangedEmailSubject(): string {
  return "تم تغيير كلمة المرور - منصة كلمة";
}

export function getPasswordChangedEmailHtml(
  data: PasswordChangedEmailData,
): string {
  const formattedDate = data.changedAt.toLocaleString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم تغيير كلمة المرور</title>
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">منصة كلمة</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 700;">تم تغيير كلمة المرور بنجاح</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                مرحبًا <strong>${data.name}</strong>،
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                تم تغيير كلمة المرور بنجاح في <strong>${formattedDate}</strong>.
              </p>
              
              ${
                data.ipAddress
                  ? `
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                <strong>عنوان IP:</strong> ${data.ipAddress}
              </p>
              `
                  : ""
              }
              
              <!-- Security Notice -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border-radius: 10px; border-left: 4px solid #af0d0e;">
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.8;">
                    <strong>هل لم تقم بإجراء هذا التغيير؟</strong><br>
                    إذا لم تقم بتغيير كلمة المرور، فقد تكون حسابك معرضًا للخطر. يرجى التواصل مع فريق الدعم فورًا وإعادة تعيين كلمة المرور.
                  </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                      <a href="${data.supportUrl}" 
                        style="display: inline-block; padding: 16px 40px; background-color: #af0d0e; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px;">
                      🆘 التواصل مع فريق الدعم
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fcfcfc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
              </p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">
                هذه رسالة أمنية. الرجاء عدم الرد على هذا البريد.
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

export function getPasswordChangedEmailText(
  data: PasswordChangedEmailData,
): string {
  const formattedDate = data.changedAt.toLocaleString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
تم تغيير كلمة المرور - منصة كلمة

مرحبًا ${data.name}،

تم تغيير كلمة المرور بنجاح في ${formattedDate}.
${data.ipAddress ? `عنوان IP: ${data.ipAddress}` : ""}

هل لم تقم بإجراء هذا التغيير؟
إذا لم تقم بتغيير كلمة المرور، فقد تكون حسابك معرضًا للخطر. يرجى التواصل مع فريق الدعم فورًا وإعادة تعيين كلمة المرور.

التواصل مع الدعم: ${data.supportUrl}

© ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.
هذه رسالة أمنية. الرجاء عدم الرد على هذا البريد.
  `.trim();
}
