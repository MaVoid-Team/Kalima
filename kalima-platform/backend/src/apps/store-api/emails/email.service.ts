import nodemailer from 'nodemailer';
import path from 'path';
import type { Transporter } from 'nodemailer';
import {
  getVerificationEmailHtml,
  getVerificationEmailText,
  getVerificationEmailSubject,
  VerificationEmailData,
  getPasswordResetEmailHtml,
  getPasswordResetEmailText,
  getPasswordResetEmailSubject,
  PasswordResetEmailData,
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  getWelcomeEmailSubject,
  WelcomeEmailData,
  getPasswordChangedEmailHtml,
  getPasswordChangedEmailText,
  getPasswordChangedEmailSubject,
  PasswordChangedEmailData,
  getAccountCreatedEmailHtml,
  getAccountCreatedEmailText,
  getAccountCreatedEmailSubject,
  AccountCreatedEmailData,
  getWelcomeOAuthEmailHtml,
  getWelcomeOAuthEmailText,
  getWelcomeOAuthEmailSubject,
  WelcomeOAuthEmailData,
  getOrderReceivedEmailHtml,
  getOrderReceivedEmailText,
  getOrderReceivedEmailSubject,
  OrderReceivedEmailData,
} from './templates';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: Transporter;
  private fromAddress: string;

  constructor(config?: EmailConfig) {
    const emailConfig = config || this.getDefaultConfig();
    
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.fromAddress = emailConfig.from;
  }

  private getDefaultConfig(): EmailConfig {
    // Prefer Resend SMTP relay when RESEND_API_KEY is available
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      return {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: resendKey,
        },
        from: process.env.EMAIL_FROM || 'Kalima Platform <noreply@kalima.com>',
      };
    }

    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Kalima Platform <noreply@kalima.com>',
    };
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const logoPath = path.resolve(__dirname, 'figs', 'kalima.jpg');
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: [
          {
            filename: 'kalima.jpg',
            path: logoPath,
            cid: 'kalima-logo',
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    to: string,
    data: VerificationEmailData
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getVerificationEmailSubject(),
      html: getVerificationEmailHtml(data),
      text: getVerificationEmailText(data),
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: PasswordResetEmailData
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getPasswordResetEmailSubject(),
      html: getPasswordResetEmailHtml(data),
      text: getPasswordResetEmailText(data),
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getWelcomeEmailSubject(),
      html: getWelcomeEmailHtml(data),
      text: getWelcomeEmailText(data),
    });
  }

  /**
   * Send welcome email for OAuth Users (pre-verified)
   */
  async sendWelcomeOAuthEmail(to: string, data: WelcomeOAuthEmailData): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getWelcomeOAuthEmailSubject(),
      html: getWelcomeOAuthEmailHtml(data),
      text: getWelcomeOAuthEmailText(data),
    });
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(
    to: string,
    data: PasswordChangedEmailData
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getPasswordChangedEmailSubject(),
      html: getPasswordChangedEmailHtml(data),
      text: getPasswordChangedEmailText(data),
    });
  }

  /**
   * Send account created email (registration confirmation with verification link)
   */
  async sendAccountCreatedEmail(
    to: string,
    data: AccountCreatedEmailData
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getAccountCreatedEmailSubject(),
      html: getAccountCreatedEmailHtml(data),
      text: getAccountCreatedEmailText(data),
    });
  }

  /**
   * Send order received confirmation
   */
  async sendOrderReceivedEmail(
    to: string,
    data: OrderReceivedEmailData
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: getOrderReceivedEmailSubject(),
      html: getOrderReceivedEmailHtml(data),
      text: getOrderReceivedEmailText(data),
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(config?: EmailConfig): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService(config);
  }
  return emailServiceInstance;
}

export default EmailService;
