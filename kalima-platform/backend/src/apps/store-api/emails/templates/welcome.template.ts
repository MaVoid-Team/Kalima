export interface WelcomeEmailData {
  name: string;
  role: string;
  loginUrl: string;
}

export function getWelcomeEmailSubject(): string {
  return 'Welcome to Kalima Platform!';
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
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
                Your email has been verified successfully. Welcome to Kalima Platform as a <strong>${data.role}</strong>!
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                You now have full access to all the features available for your account. Here's what you can do next:
              </p>
              
              <!-- Features List -->
              <ul style="margin: 0 0 20px; padding: 0 0 0 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                <li>Complete your profile information</li>
                <li>Explore available courses and content</li>
                <li>Connect with other users on the platform</li>
                <li>Access your personalized dashboard</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.loginUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #10B981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, feel free to contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Kalima Platform. All rights reserved.
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
Welcome to Kalima Platform!

Hello ${data.name}!

Your email has been verified successfully. Welcome to Kalima Platform as a ${data.role}!

You now have full access to all the features available for your account. Here's what you can do next:

- Complete your profile information
- Explore available courses and content
- Connect with other users on the platform
- Access your personalized dashboard

Visit your dashboard: ${data.loginUrl}

If you have any questions or need assistance, feel free to contact our support team.

© ${new Date().getFullYear()} Kalima Platform. All rights reserved.
  `.trim();
}
