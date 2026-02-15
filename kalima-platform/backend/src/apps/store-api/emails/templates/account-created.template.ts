export interface AccountCreatedEmailData {
  name: string;
  role: string;
  verificationUrl: string;
  expiresInHours: number;
}

export function getAccountCreatedEmailSubject(): string {
  return 'Welcome to Kalima Platform - Verify Your Account';
}

export function getAccountCreatedEmailHtml(data: AccountCreatedEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kalima Platform</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Welcome to Kalima!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Hello ${data.name}!</h2>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                Thank you for joining Kalima Platform as a <strong>${data.role}</strong>! We're excited to have you on board.
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                To complete your registration and access all features, please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.verificationUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #10B981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Verify My Account
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
              
              <!-- Info Box -->
              <div style="margin: 30px 0 0; padding: 20px; background-color: #EEF2FF; border-radius: 8px; border-left: 4px solid #4F46E5;">
                <p style="margin: 0; color: #3730A3; font-size: 14px; line-height: 1.6;">
                  <strong>What happens next?</strong><br>
                  Once you verify your email, you'll have full access to all the features available for your ${data.role} account.
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
                If you didn't create this account, please ignore this email.
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

export function getAccountCreatedEmailText(data: AccountCreatedEmailData): string {
  return `
Welcome to Kalima Platform!

Hello ${data.name}!

Thank you for joining Kalima Platform as a ${data.role}! We're excited to have you on board.

To complete your registration and access all features, please verify your email address by visiting the link below:

${data.verificationUrl}

This link will expire in ${data.expiresInHours} hours.

What happens next?
Once you verify your email, you'll have full access to all the features available for your ${data.role} account.

© ${new Date().getFullYear()} Kalima Platform. All rights reserved.
If you didn't create this account, please ignore this email.
  `.trim();
}
