import { firebaseAuth } from '../../../libs/auth/firebase';
import {
  generateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokensForUser,
  signAccessToken,
  verifyRefreshToken,
} from '../../../libs/auth/jwt';
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

const RESET_TOKEN_EXPIRY_HOURS = 24;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 48;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPPORT_URL = process.env.SUPPORT_URL || 'http://localhost:3000/support';

// ============================================
// AUTH SERVICE CLASS
// ============================================

class AuthService {
  private userService = userManagementService;

  // ============================================
  // MAIN USER REGISTRATION (Local)
  // ============================================

  async registerTeacher(input: TeacherRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await this.userService.createTeacher(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Teacher);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerStudent(input: StudentRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await this.userService.createStudent(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Student);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerParent(input: ParentRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await this.userService.createParent(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Parent);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerLecturer(input: LecturerRegistrationDto): Promise<RegistrationResponse> {
    const { user, email } = await this.userService.createLecturer(input);
    const tokens = await this.issueTokens(user.id);
    await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Lecturer);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  // ============================================
  // MAIN USER REGISTRATION (Firebase OAuth)
  // ============================================

  async registerTeacherFirebase(input: TeacherFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await this.userService.createTeacherFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerStudentFirebase(input: StudentFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await this.userService.createStudentFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerParentFirebase(input: ParentFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await this.userService.createParentFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  async registerLecturerFirebase(input: LecturerFirebaseRegistrationDto): Promise<RegistrationResponse> {
    const firebaseUser = await this.verifyFirebaseToken(input.idToken);
    const { user } = await this.userService.createLecturerFromFirebase(input, firebaseUser);
    const tokens = await this.issueTokens(user.id);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
    };
  }

  // ============================================
  // NON-MAIN USER CREATION (Admin creates these)
  // ============================================

  async createAdmin(input: CreateAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    return this.userService.createAdmin(input, creator);
  }

  async createSubAdmin(input: CreateSubAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    return this.userService.createSubAdmin(input, creator);
  }

  async createModerator(input: CreateModeratorDto, creator: CreatorContext): Promise<BaseUserData> {
    return this.userService.createModerator(input, creator);
  }

  async createAssistant(input: CreateAssistantDto, creator: CreatorContext): Promise<BaseUserData> {
    return this.userService.createAssistant(input, creator);
  }

  // ============================================
  // LOGIN METHODS
  // ============================================

  async login(input: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findUserByEmail(input.email);

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await this.userService.verifyPassword(input.password, user.password);

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id);
    const portalAccess = this.calculatePortalAccess(user.user_roles);
    const linkedProviders = this.mapLinkedProviders(user.auth_identities);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
      portalAccess,
      linkedProviders,
    };
  }

  async loginFirebase(idToken: string): Promise<LoginResponse> {
    const firebaseUser = await this.verifyFirebaseToken(idToken);

    const user = await this.userService.findUserByAuthIdentity(
      firebaseUser.provider,
      firebaseUser.uid
    );

    if (!user) {
      throw new Error('No account found with this provider. Please register first.');
    }

    const tokens = await this.issueTokens(user.id);
    const portalAccess = this.calculatePortalAccess(user.user_roles);
    const linkedProviders = this.mapLinkedProviders(user.auth_identities);

    return {
      user: this.userService.mapToBaseUserData(user),
      tokens,
      portalAccess,
      linkedProviders,
    };
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    // Revoke old token and issue new ones
    await revokeRefreshToken(refreshToken);
    const tokens = await this.issueTokens(payload.userId);

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
    const normalizedEmail = this.userService.normalizeEmail(email);
    const emailService = getEmailService();

    const user = await this.userService.findUserByEmail(normalizedEmail);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = this.userService.generateSecureToken();
    const resetTokenHash = await this.userService.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.userService.createPasswordResetToken(user.id, resetTokenHash, expiresAt);

    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email!, {
      name: user.name,
      resetUrl,
      expiresInHours: RESET_TOKEN_EXPIRY_HOURS,
    });

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string, ipAddress?: string): Promise<{ message: string }> {
    const tokenHash = await this.userService.hashToken(token);
    const emailService = getEmailService();

    const resetToken = await this.userService.findValidPasswordResetToken(tokenHash);

    if (!resetToken || !resetToken.users) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await this.userService.hashPassword(newPassword);

    await this.userService.updatePassword(resetToken.users.id, passwordHash);
    await this.userService.markPasswordResetTokenUsed(resetToken.id);

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

    const user = await this.userService.findUserById(userId);

    if (!user || !user.password) {
      throw new Error('User not found or has no password set');
    }

    const passwordValid = await this.userService.verifyPassword(input.currentPassword, user.password);

    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }

    const newPasswordHash = await this.userService.hashPassword(input.newPassword);
    await this.userService.updatePassword(userId, newPasswordHash);

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
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password) {
      throw new Error('Password already set. Use change password instead.');
    }

    const passwordHash = await this.userService.hashPassword(input.password);
    await this.userService.updatePassword(userId, passwordHash);

    // Create local auth identity if user has email
    if (user.email) {
      try {
        await this.userService.createAuthIdentity(
          userId,
          auth_provider_enum.local,
          user.email,
          user.email
        );
      } catch {
        // Identity might already exist
      }
    }

    return { message: 'Password set successfully.' };
  }

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  async sendVerificationEmail(userId: number): Promise<{ message: string }> {
    const user = await this.userService.findUserById(userId);
    const emailService = getEmailService();

    if (!user || !user.email) {
      throw new Error('User not found or has no email');
    }

    if (user.is_email_verified) {
      return { message: 'Email is already verified' };
    }

    const verificationToken = this.userService.generateSecureToken();
    const tokenHash = await this.userService.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.userService.createEmailVerificationToken(userId, tokenHash, expiresAt);

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
    const tokenHash = await this.userService.hashToken(token);

    const verificationToken = await this.userService.findValidEmailVerificationToken(tokenHash);

    if (!verificationToken || !verificationToken.users) {
      throw new Error('Invalid or expired verification token');
    }

    if (verificationToken.users.is_email_verified) {
      throw new Error('Email is already verified');
    }

    const updatedUser = await this.userService.verifyUserEmail(verificationToken.users.id);
    await this.userService.markEmailVerificationTokenUsed(verificationToken.id);

    // Send welcome email
    const loginUrl = `${APP_URL}/auth/login`;
    const roleName = this.formatRoleName(verificationToken.users.role!);

    if (verificationToken.users.email) {
      await emailService.sendWelcomeEmail(verificationToken.users.email, {
        name: verificationToken.users.name,
        role: roleName,
        loginUrl,
      });
    }

    return {
      message: 'Email verified successfully',
      user: this.userService.mapToBaseUserData(updatedUser),
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const normalizedEmail = this.userService.normalizeEmail(email);
    const user = await this.userService.findUserByEmail(normalizedEmail);

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

  // ============================================
  // ACCOUNT LINKING
  // ============================================

  async linkFirebaseAccount(userId: number, idToken: string): Promise<LinkProviderResponse> {
    const firebaseUser = await this.verifyFirebaseToken(idToken);

    // Check if this Firebase account is already linked to another user
    const existingUser = await this.userService.findUserByAuthIdentity(
      firebaseUser.provider,
      firebaseUser.uid
    );

    if (existingUser && existingUser.id !== userId) {
      throw new Error('This account is already linked to another user');
    }

    if (existingUser && existingUser.id === userId) {
      throw new Error('This account is already linked');
    }

    // Check if user already has this provider linked
    const existingIdentity = await this.userService.findAuthIdentity(userId, firebaseUser.provider);

    if (existingIdentity) {
      throw new Error(`You already have a ${firebaseUser.provider} account linked`);
    }

    await this.userService.createAuthIdentity(
      userId,
      firebaseUser.provider,
      firebaseUser.uid,
      firebaseUser.email
    );

    const identities = await this.userService.findAllAuthIdentities(userId);

    return {
      message: `${firebaseUser.provider} account linked successfully`,
      linkedProviders: this.mapLinkedProviders(identities),
    };
  }

  async unlinkProvider(userId: number, provider: auth_provider_enum): Promise<LinkProviderResponse> {
    const identity = await this.userService.findAuthIdentity(userId, provider);

    if (!identity) {
      throw new Error(`No ${provider} account is linked`);
    }

    const allIdentities = await this.userService.findAllAuthIdentities(userId);
    const user = await this.userService.findUserById(userId);

    const hasPassword = !!user?.password;
    const hasOtherProviders = allIdentities.length > 1;

    if (!hasPassword && !hasOtherProviders) {
      throw new Error('Cannot unlink the only authentication method. Set a password first.');
    }

    if (provider === auth_provider_enum.local && !hasOtherProviders) {
      throw new Error('Cannot unlink local authentication. Link another provider first.');
    }

    await this.userService.deleteAuthIdentity(identity.id);

    const remainingIdentities = await this.userService.findAllAuthIdentities(userId);

    return {
      message: `${provider} account unlinked successfully`,
      linkedProviders: this.mapLinkedProviders(remainingIdentities),
    };
  }

  async getLinkedProviders(userId: number): Promise<LinkedProvider[]> {
    const identities = await this.userService.findAllAuthIdentities(userId);
    return this.mapLinkedProviders(identities);
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private async sendAccountVerificationEmail(
    userId: number,
    name: string,
    email: string,
    role: role_enum
  ): Promise<void> {
    const emailService = getEmailService();

    const verificationToken = this.userService.generateSecureToken();
    const tokenHash = await this.userService.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.userService.createEmailVerificationToken(userId, tokenHash, expiresAt);

    const verificationUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
    const roleName = this.formatRoleName(role);

    await emailService.sendAccountCreatedEmail(email, {
      name,
      role: roleName,
      verificationUrl,
      expiresInHours: VERIFICATION_TOKEN_EXPIRY_HOURS,
    });
  }

  private async verifyFirebaseToken(idToken: string): Promise<FirebaseUserData> {
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error('Firebase token does not contain an email');
    }

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
    const user = await this.userService.findUserById(userId);
    const roleRows = user?.user_roles ?? [];

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
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;
