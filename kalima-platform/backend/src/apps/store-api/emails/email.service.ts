import nodemailer from 'nodemailer';
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
    });

    this.fromAddress = emailConfig.from;
  }

  private getDefaultConfig(): EmailConfig {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: process.env.SMTP_FROM || 'Kalima Platform <noreply@kalima.com>',
    };
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
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
