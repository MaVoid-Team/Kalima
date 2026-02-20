export interface PasswordChangedEmailData {
  name: string;
  changedAt: Date;
  ipAddress?: string;
  supportUrl: string;
}

export function getPasswordChangedEmailSubject(): string {
  return 'Your Password Has Been Changed - Kalima Platform';
}

export function getPasswordChangedEmailHtml(data: PasswordChangedEmailData): string {
  const formattedDate = data.changedAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Kalima Platform</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Password Changed Successfully</h2>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Your password was successfully changed on <strong>${formattedDate}</strong>.
              </p>
              
              ${data.ipAddress ? `
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong>IP Address:</strong> ${data.ipAddress}
              </p>
              ` : ''}
              
              <!-- Security Notice -->
              <div style="margin: 30px 0; padding: 20px; background-color: #FEE2E2; border-radius: 8px; border-left: 4px solid #DC2626;">
                <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
                  <strong>Didn't make this change?</strong><br>
                  If you didn't change your password, your account may have been compromised. Please contact our support team immediately and reset your password.
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.supportUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #DC2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Contact Support
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Kalima Platform. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                This is a security notification. Please do not reply to this email.
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

export function getPasswordChangedEmailText(data: PasswordChangedEmailData): string {
  const formattedDate = data.changedAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return `
Password Changed - Kalima Platform

Hello ${data.name},

Your password was successfully changed on ${formattedDate}.
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}

DIDN'T MAKE THIS CHANGE?
If you didn't change your password, your account may have been compromised. Please contact our support team immediately and reset your password.

Contact Support: ${data.supportUrl}

© ${new Date().getFullYear()} Kalima Platform. All rights reserved.
This is a security notification. Please do not reply to this email.
  `.trim();
}
