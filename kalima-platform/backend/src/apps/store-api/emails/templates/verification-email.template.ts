export interface VerificationEmailData {
  name: string;
  verificationUrl: string;
  expiresInHours: number;
}

export function getVerificationEmailSubject(): string {
  return 'Verify Your Email - Kalima Platform';
}

export function getVerificationEmailHtml(data: VerificationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Thank you for registering with Kalima Platform. Please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.verificationUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #4F46E5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f8f8f8; border-radius: 4px; word-break: break-all; color: #4F46E5; font-size: 14px;">
                ${data.verificationUrl}
              </p>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>${data.expiresInHours} hours</strong>.
              </p>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If you didn't create an account with Kalima Platform, please ignore this email.
              </p>
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

export function getVerificationEmailText(data: VerificationEmailData): string {
  return `
Verify Your Email - Kalima Platform

Hello ${data.name},

Thank you for registering with Kalima Platform. Please verify your email address by visiting the link below:

${data.verificationUrl}

This link will expire in ${data.expiresInHours} hours.

If you didn't create an account with Kalima Platform, please ignore this email.

© ${new Date().getFullYear()} Kalima Platform. All rights reserved.
  `.trim();
}
