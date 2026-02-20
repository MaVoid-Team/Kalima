export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresInHours: number;
}

export function getPasswordResetEmailSubject(): string {
  return 'Reset Your Password - Kalima Platform';
}

export function getPasswordResetEmailHtml(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.resetUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #DC2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f8f8f8; border-radius: 4px; word-break: break-all; color: #4F46E5; font-size: 14px;">
                ${data.resetUrl}
              </p>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>${data.expiresInHours} hours</strong>.
              </p>
              
              <!-- Security Notice -->
              <div style="margin: 30px 0 0; padding: 20px; background-color: #FEF3C7; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                  <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Kalima Platform. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
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

export function getPasswordResetEmailText(data: PasswordResetEmailData): string {
  return `
Reset Your Password - Kalima Platform

Hello ${data.name},

We received a request to reset your password. Visit the link below to create a new password:

${data.resetUrl}

This link will expire in ${data.expiresInHours} hours.

SECURITY NOTICE: If you didn't request a password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.

© ${new Date().getFullYear()} Kalima Platform. All rights reserved.
  `.trim();
}
