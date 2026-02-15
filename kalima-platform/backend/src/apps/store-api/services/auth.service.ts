import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { firebaseAuth } from '../../../libs/auth/firebase';
import { prisma } from '../../../libs/db/prisma';
import {
  generateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokensForUser,
  signAccessToken,
  verifyRefreshToken,
} from '../../../libs/auth/jwt';
import type { PrismaClient } from '../../../libs/db/prisma';
import {
  TeacherRegistrationDto,
  StudentRegistrationDto,
  ParentRegistrationDto,
  LecturerRegistrationDto,
  TeacherFirebaseRegistrationDto,
  StudentFirebaseRegistrationDto,
  ParentFirebaseRegistrationDto,
  LecturerFirebaseRegistrationDto,
  LoginDto,
  CreateAdminDto,
  CreateSubAdminDto,
  CreateModeratorDto,
  CreateAssistantDto,
  ChangePasswordDto,
  SetPasswordDto,
} from '../dtos/auth.dto';
import {
  AuthTokens,
  LoginResponse,
  RegistrationResponse,
  RefreshResponse,
  PortalAccess,
  BaseUserData,
  CreatorContext,
  FirebaseUserData,
  LinkedProvider,
  LinkProviderResponse,
} from '../interfaces/auth.interface';
import { role_enum, portal_enum, auth_provider_enum } from '../../generated/prisma';
import { getEmailService } from '../emails';
import { userManagementService } from './user-management.service';

// ============================================
// CONSTANTS
// ============================================

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRY_HOURS = 24;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 48;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPPORT_URL = process.env.SUPPORT_URL || 'http://localhost:3000/support';

// ============================================
// AUTH SERVICE CLASS
// ============================================

class AuthService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // MAIN USER REGISTRATION (Delegated to UserManagementService)
  // ============================================

  async registerTeacher(input: TeacherRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await userManagementService.createTeacher(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Teacher);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerStudent(input: StudentRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await userManagementService.createStudent(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Student);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerParent(input: ParentRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await userManagementService.createParent(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Parent);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerLecturer(input: LecturerRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await userManagementService.createLecturer(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Lecturer);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  // ============================================
  // MAIN USER REGISTRATION (Firebase OAuth - Delegated)
  // ============================================

  async registerTeacherFirebase(input: TeacherFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await userManagementService.createTeacherFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerStudentFirebase(input: StudentFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await userManagementService.createStudentFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerParentFirebase(input: ParentFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await userManagementService.createParentFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  async registerLecturerFirebase(input: LecturerFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await userManagementService.createLecturerFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);
    return { user: this.mapToBaseUserData(user), tokens };
  }

  // ============================================
  // NON-MAIN USER CREATION (Delegated to UserManagementService)
  // ============================================

  async createAdmin(input: CreateAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    return userManagementService.createAdmin(input, creator);
  }

  async createSubAdmin(input: CreateSubAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    return userManagementService.createSubAdmin(input, creator);
  }

  async createModerator(input: CreateModeratorDto, creator: CreatorContext): Promise<BaseUserData> {
    return userManagementService.createModerator(input, creator);
  }

  async createAssistant(input: CreateAssistantDto, creator: CreatorContext): Promise<BaseUserData> {
    return userManagementService.createAssistant(input, creator);
  }

  // ============================================
  // LOGIN
  // ============================================

  async login(input: LoginDto): Promise<LoginResponse> {
    const email = this.normalizeEmail(input.email);

    const user = await this.db.users.findFirst({
      where: { email },
      select: {
        ...this.baseUserSelect(),
        password: true,
        user_roles: {
          select: {
            portal: true,
            role: true,
          },
        },
        auth_identities: {
          select: {
            provider: true,
            provider_email: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.password);

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id);
    const portalAccess = this.calculatePortalAccess(user.user_roles);
    const linkedProviders = this.mapLinkedProviders(user.auth_identities);

    return {
      user: this.mapToBaseUserData(user),
      tokens,
      portalAccess,
      linkedProviders,
    };
  }

  async loginFirebase(idToken: string): Promise<LoginResponse> {
    const firebaseUser = await this.verifyFirebaseToken(idToken);

    // Check if user exists
    const user = await this.db.users.findFirst({
      where: { email: firebaseUser.email },
      select: {
        ...this.baseUserSelect(),
        user_roles: {
          select: {
            portal: true,
            role: true,
          },
        },
        auth_identities: {
          select: {
            provider: true,
            provider_email: true,
            provider_user_id: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not registered. Please sign up first.');
    }

    // Link Firebase identity if not already linked
    const existingIdentity = user.auth_identities.find(
      (identity) => identity.provider === firebaseUser.provider && identity.provider_user_id === firebaseUser.uid
    );

    if (!existingIdentity) {
      await this.db.auth_identities.create({
        data: {
          user_id: user.id,
          provider: firebaseUser.provider,
          provider_user_id: firebaseUser.uid,
          provider_email: firebaseUser.email,
        },
      });
    }

    // Refresh auth identities after potential linking
    const updatedIdentities = await this.db.auth_identities.findMany({
      where: { user_id: user.id },
      select: { provider: true, provider_email: true },
    });

    const tokens = await this.issueTokens(user.id);
    const portalAccess = this.calculatePortalAccess(user.user_roles);
    const linkedProviders = this.mapLinkedProviders(updatedIdentities);

    return {
      user: this.mapToBaseUserData(user),
      tokens,
      portalAccess,
      linkedProviders,
    };
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const verified = await verifyRefreshToken(refreshToken);

    if (!verified) {
      throw new Error('Invalid refresh token');
    }

    // Revoke old token and issue new ones
    await revokeRefreshToken(refreshToken);
    const tokens = await this.issueTokens(verified.userId);

    return { tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await revokeRefreshToken(refreshToken);
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await revokeAllRefreshTokensForUser(userId);
  }

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = this.normalizeEmail(email);
    const emailService = getEmailService();

    const user = await this.db.users.findFirst({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = this.generateSecureToken();
    const resetTokenHash = await this.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store reset token
    await this.db.password_reset_tokens.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        token_hash: resetTokenHash,
        expires_at: expiresAt,
      },
      update: {
        token_hash: resetTokenHash,
        expires_at: expiresAt,
        used_at: null,
      },
    });

    // Send password reset email
    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email!, {
      name: user.name,
      resetUrl,
      expiresInHours: RESET_TOKEN_EXPIRY_HOURS,
    });

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string, ipAddress?: string): Promise<{ message: string }> {
    const tokenHash = await this.hashToken(token);
    const emailService = getEmailService();

    const resetToken = await this.db.password_reset_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        expires_at: { gt: new Date() },
        used_at: null,
      },
      include: {
        users: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!resetToken || !resetToken.users) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(newPassword);

    await this.db.$transaction(async (tx) => {
      // Update password
      await tx.users.update({
        where: { id: resetToken.users.id },
        data: {
          password: passwordHash,
          password_changed_at: new Date(),
        },
      });

      // Mark token as used
      await tx.password_reset_tokens.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      });
    });

    // Revoke all refresh tokens
    await revokeAllRefreshTokensForUser(resetToken.users.id);

    // Send password changed notification
    if (resetToken.users.email) {
      await emailService.sendPasswordChangedEmail(resetToken.users.email, {
        name: resetToken.users.name,
        changedAt: new Date(),
        ipAddress,
        supportUrl: SUPPORT_URL,
      });
    }

    return { message: 'Password has been reset successfully.' };
  }

  async changePassword(userId: number, input: ChangePasswordDto, ipAddress?: string): Promise<{ message: string }> {
    const emailService = getEmailService();

    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { password: true, email: true, name: true },
    });

    if (!user || !user.password) {
      throw new Error('User not found or has no password set');
    }

    const passwordValid = await bcrypt.compare(input.currentPassword, user.password);

    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }

    const newPasswordHash = await this.hashPassword(input.newPassword);

    await this.db.users.update({
      where: { id: userId },
      data: {
        password: newPasswordHash,
        password_changed_at: new Date(),
      },
    });

    // Revoke all refresh tokens to force re-login on all devices
    await revokeAllRefreshTokensForUser(userId);

    // Send password changed notification
    if (user.email) {
      await emailService.sendPasswordChangedEmail(user.email, {
        name: user.name,
        changedAt: new Date(),
        ipAddress,
        supportUrl: SUPPORT_URL,
      });
    }

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async setPassword(userId: number, input: SetPasswordDto): Promise<{ message: string }> {
    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { password: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password) {
      throw new Error('Password already set. Use change password instead.');
    }

    const passwordHash = await this.hashPassword(input.password);

    await this.db.users.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        password_changed_at: new Date(),
      },
    });

    // Create local auth identity if user has email
    if (user.email) {
      await this.db.auth_identities.create({
        data: {
          user_id: userId,
          provider: 'local',
          provider_user_id: user.email,
          provider_email: user.email,
        },
      }).catch(() => {
        // Identity might already exist
      });
    }

    return { message: 'Password set successfully.' };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Sends account verification email after registration
   */
  private async sendAccountVerificationEmail(
    userId: number,
    name: string,
    email: string,
    role: role_enum
  ): Promise<void> {
    const emailService = getEmailService();

    const verificationToken = this.generateSecureToken();
    const tokenHash = await this.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store verification token
    await this.db.email_verification_tokens.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    // Send account created email with verification link
    const verificationUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
    const roleName = this.formatRoleName(role);

    await emailService.sendAccountCreatedEmail(email, {
      name,
      role: roleName,
      verificationUrl,
      expiresInHours: VERIFICATION_TOKEN_EXPIRY_HOURS,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private baseUserSelect() {
    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      secondary_phone: true,
      gender: true,
      is_email_verified: true,
      profile_pic_url: true,
      created_at: true,
    };
  }

  private mapToBaseUserData(user: any): BaseUserData {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      secondary_phone: user.secondary_phone,
      gender: user.gender,
      is_email_verified: user.is_email_verified ?? false,
      profile_pic_url: user.profile_pic_url,
      created_at: user.created_at,
    };
  }

  private calculatePortalAccess(roles: Array<{ portal: portal_enum; role: role_enum }>): PortalAccess {
    const access: PortalAccess = {
      store: false,
      academy: false,
    };

    for (const roleEntry of roles) {
      if (roleEntry.portal === portal_enum.store) {
        access.store = true;
      }
      if (roleEntry.portal === portal_enum.academy) {
        access.academy = true;
      }
    }

    return access;
  }

  private mapLinkedProviders(identities: Array<{ provider: auth_provider_enum; provider_email?: string | null }>): LinkedProvider[] {
    return identities.map((identity) => ({
      provider: identity.provider,
      providerEmail: identity.provider_email ?? undefined,
    }));
  }

  private async verifyFirebaseToken(idToken: string): Promise<FirebaseUserData> {
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error('Firebase token does not contain an email');
    }

    // Determine the provider based on Firebase sign-in method
    let provider: auth_provider_enum = auth_provider_enum.firebase;
    const signInProvider = decoded.firebase?.sign_in_provider;

    if (signInProvider === 'google.com') {
      provider = auth_provider_enum.google;
    } else if (signInProvider === 'facebook.com') {
      provider = auth_provider_enum.facebook;
    }

    return {
      uid: decoded.uid,
      email: decoded.email.toLowerCase(),
      name: decoded.name ?? decoded.email.split('@')[0],
      emailVerified: decoded.email_verified ?? false,
      photoUrl: decoded.picture,
      provider,
    };
  }

  private async issueTokens(userId: number): Promise<AuthTokens> {
    const roleRows = await this.db.user_roles.findMany({
      where: { user_id: userId },
      select: { portal: true, role: true },
    });

    const accessToken = signAccessToken({
      userId,
      roles: roleRows.map((r) => ({
        portal: r.portal,
        role: r.role,
      })),
    });

    const refresh = await generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
    };
  }

  // ============================================
  // EMAIL VERIFICATION METHODS
  // ============================================

  async sendVerificationEmail(userId: number): Promise<{ message: string }> {
    const emailService = getEmailService();

    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, is_email_verified: true },
    });

    if (!user || !user.email) {
      throw new Error('User not found or has no email');
    }

    if (user.is_email_verified) {
      return { message: 'Email is already verified' };
    }

    const verificationToken = this.generateSecureToken();
    const tokenHash = await this.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store verification token
    await this.db.email_verification_tokens.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
      update: {
        token_hash: tokenHash,
        expires_at: expiresAt,
        used_at: null,
      },
    });

    // Send verification email
    const verificationUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
    await emailService.sendVerificationEmail(user.email, {
      name: user.name,
      verificationUrl,
      expiresInHours: VERIFICATION_TOKEN_EXPIRY_HOURS,
    });

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string): Promise<{ message: string; user: BaseUserData }> {
    const emailService = getEmailService();
    const tokenHash = await this.hashToken(token);

    const verificationToken = await this.db.email_verification_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        expires_at: { gt: new Date() },
        used_at: null,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            secondary_phone: true,
            gender: true,
            is_email_verified: true,
            profile_pic_url: true,
            created_at: true,
            role: true,
          },
        },
      },
    });

    if (!verificationToken || !verificationToken.users) {
      throw new Error('Invalid or expired verification token');
    }

    if (verificationToken.users.is_email_verified) {
      throw new Error('Email is already verified');
    }

    // Update user and mark token as used
    const updatedUser = await this.db.$transaction(async (tx) => {
      const user = await tx.users.update({
        where: { id: verificationToken.users.id },
        data: {
          is_email_verified: true,
          email_verified_at: new Date(),
        },
        select: this.baseUserSelect(),
      });

      await tx.email_verification_tokens.update({
        where: { id: verificationToken.id },
        data: { used_at: new Date() },
      });

      return user;
    });

    // Send welcome email
    const loginUrl = `${APP_URL}/auth/login`;
    const roleName = this.formatRoleName(verificationToken.users.role);

    if (verificationToken.users.email) {
      await emailService.sendWelcomeEmail(verificationToken.users.email, {
        name: verificationToken.users.name,
        role: roleName,
        loginUrl,
      });
    }

    return {
      message: 'Email verified successfully',
      user: this.mapToBaseUserData(updatedUser),
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.db.users.findFirst({
      where: { email: normalizedEmail },
      select: { id: true, is_email_verified: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a verification link has been sent.' };
    }

    if (user.is_email_verified) {
      return { message: 'Email is already verified' };
    }

    await this.sendVerificationEmail(user.id);

    return { message: 'If an account exists with this email, a verification link has been sent.' };
  }

  private formatRoleName(role: role_enum): string {
    const roleNames: Record<role_enum, string> = {
      [role_enum.Admin]: 'Administrator',
      [role_enum.SubAdmin]: 'Sub-Administrator',
      [role_enum.Teacher]: 'Teacher',
      [role_enum.Student]: 'Student',
      [role_enum.Parent]: 'Parent',
      [role_enum.Lecturer]: 'Lecturer',
      [role_enum.Assistant]: 'Assistant',
      [role_enum.Moderator]: 'Moderator',
    };
    return roleNames[role] || role;
  }

  // ============================================
  // ACCOUNT LINKING METHODS
  // ============================================

  async linkFirebaseAccount(userId: number, idToken: string): Promise<LinkProviderResponse> {
    const firebaseUser = await this.verifyFirebaseToken(idToken);

    // Check if this Firebase account is already linked to another user
    const existingLink = await this.db.auth_identities.findFirst({
      where: {
        provider: firebaseUser.provider,
        provider_user_id: firebaseUser.uid,
      },
    });

    if (existingLink && existingLink.user_id !== userId) {
      throw new Error('This account is already linked to another user');
    }

    if (existingLink && existingLink.user_id === userId) {
      throw new Error('This account is already linked');
    }

    // Check if user already has this provider linked
    const userExistingProvider = await this.db.auth_identities.findFirst({
      where: {
        user_id: userId,
        provider: firebaseUser.provider,
      },
    });

    if (userExistingProvider) {
      throw new Error(`You already have a ${firebaseUser.provider} account linked`);
    }

    await this.db.auth_identities.create({
      data: {
        user_id: userId,
        provider: firebaseUser.provider,
        provider_user_id: firebaseUser.uid,
        provider_email: firebaseUser.email,
      },
    });

    const identities = await this.db.auth_identities.findMany({
      where: { user_id: userId },
      select: { provider: true, provider_email: true },
    });

    return {
      message: `${firebaseUser.provider} account linked successfully`,
      linkedProviders: this.mapLinkedProviders(identities),
    };
  }

  async unlinkProvider(userId: number, provider: auth_provider_enum): Promise<LinkProviderResponse> {
    // Check if user has this provider linked
    const identity = await this.db.auth_identities.findFirst({
      where: {
        user_id: userId,
        provider,
      },
    });

    if (!identity) {
      throw new Error(`No ${provider} account is linked`);
    }

    // Check if user has at least one other auth method
    const allIdentities = await this.db.auth_identities.findMany({
      where: { user_id: userId },
    });

    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    const hasPassword = !!user?.password;
    const hasOtherProviders = allIdentities.length > 1;

    if (!hasPassword && !hasOtherProviders) {
      throw new Error('Cannot unlink the only authentication method. Set a password first.');
    }

    // Don't allow unlinking local if it's the only method
    if (provider === auth_provider_enum.local && !hasOtherProviders) {
      throw new Error('Cannot unlink local authentication. Link another provider first.');
    }

    await this.db.auth_identities.delete({
      where: { id: identity.id },
    });

    const remainingIdentities = await this.db.auth_identities.findMany({
      where: { user_id: userId },
      select: { provider: true, provider_email: true },
    });

    return {
      message: `${provider} account unlinked successfully`,
      linkedProviders: this.mapLinkedProviders(remainingIdentities),
    };
  }

  async getLinkedProviders(userId: number): Promise<LinkedProvider[]> {
    const identities = await this.db.auth_identities.findMany({
      where: { user_id: userId },
      select: { provider: true, provider_email: true },
    });

    return this.mapLinkedProviders(identities);
  }
}

export default AuthService;