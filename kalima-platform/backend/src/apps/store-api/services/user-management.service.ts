import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../../libs/db/prisma';
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
  CreateAdminDto,
  CreateSubAdminDto,
  CreateModeratorDto,
  CreateAssistantDto,
} from '../dtos/auth.dto';
import {
  BaseUserData,
  CreatorContext,
  FirebaseUserData,
} from '../interfaces/auth.interface';
import { role_enum, portal_enum, auth_provider_enum } from '../../generated/prisma';

// ============================================
// CONSTANTS
// ============================================

const SALT_ROUNDS = 12;

// ============================================
// USER MANAGEMENT SERVICE CLASS
// ============================================

class UserManagementService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // CREATE MAIN USERS (Local Registration)
  // ============================================

  async createTeacher(input: TeacherRegistrationDto): Promise<{ user: any; email: string }> {
    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);
    const serial = this.generateTeacherSerial();

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Teacher,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          teachers: {
            create: {
              serial,
              is_primary: input.is_primary,
              is_preparatory: input.is_preparatory,
              is_secondary: input.is_secondary,
              government_id: input.government_id,
              zone_id: input.zone_id,
              subject_id: input.subject_id,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.store,
              role: role_enum.Teacher,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email };
  }

  async createStudent(input: StudentRegistrationDto): Promise<{ user: any; email: string }> {
    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Student,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          students: {
            create: {
              level_id: input.level_id,
              government_id: input.government_id,
              zone_id: input.zone_id,
              parent_phone_number: input.parent_phone_number,
              faction: input.faction,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Student,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email };
  }

  async createParent(input: ParentRegistrationDto): Promise<{ user: any; email: string }> {
    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Parent,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          parents: {
            create: {},
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Parent,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email };
  }

  async createLecturer(input: LecturerRegistrationDto): Promise<{ user: any; email: string }> {
    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Lecturer,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          lecturers: {
            create: {
              bio: input.bio,
              expertise: input.expertise,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Lecturer,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email };
  }

  // ============================================
  // CREATE MAIN USERS (Firebase OAuth)
  // ============================================

  async createTeacherFromFirebase(
    input: TeacherFirebaseRegistrationDto,
    firebaseUser: FirebaseUserData
  ): Promise<{ user: any; email: string }> {
    await this.ensureEmailNotExists(firebaseUser.email);

    const serial = this.generateTeacherSerial();

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: firebaseUser.name,
          email: firebaseUser.email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          is_email_verified: firebaseUser.emailVerified,
          profile_pic_url: firebaseUser.photoUrl,
          role: role_enum.Teacher,
          auth_identities: {
            create: {
              provider: firebaseUser.provider,
              provider_user_id: firebaseUser.uid,
              provider_email: firebaseUser.email,
            },
          },
          teachers: {
            create: {
              serial,
              is_primary: input.is_primary,
              is_preparatory: input.is_preparatory,
              is_secondary: input.is_secondary,
              government_id: input.government_id,
              zone_id: input.zone_id,
              subject_id: input.subject_id,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.store,
              role: role_enum.Teacher,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email: firebaseUser.email };
  }

  async createStudentFromFirebase(
    input: StudentFirebaseRegistrationDto,
    firebaseUser: FirebaseUserData
  ): Promise<{ user: any; email: string }> {
    await this.ensureEmailNotExists(firebaseUser.email);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: firebaseUser.name,
          email: firebaseUser.email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          is_email_verified: firebaseUser.emailVerified,
          profile_pic_url: firebaseUser.photoUrl,
          role: role_enum.Student,
          auth_identities: {
            create: {
              provider: firebaseUser.provider,
              provider_user_id: firebaseUser.uid,
              provider_email: firebaseUser.email,
            },
          },
          students: {
            create: {
              level_id: input.level_id,
              government_id: input.government_id,
              zone_id: input.zone_id,
              parent_phone_number: input.parent_phone_number,
              faction: input.faction,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Student,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email: firebaseUser.email };
  }

  async createParentFromFirebase(
    input: ParentFirebaseRegistrationDto,
    firebaseUser: FirebaseUserData
  ): Promise<{ user: any; email: string }> {
    await this.ensureEmailNotExists(firebaseUser.email);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: firebaseUser.name,
          email: firebaseUser.email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          is_email_verified: firebaseUser.emailVerified,
          profile_pic_url: firebaseUser.photoUrl,
          role: role_enum.Parent,
          auth_identities: {
            create: {
              provider: firebaseUser.provider,
              provider_user_id: firebaseUser.uid,
              provider_email: firebaseUser.email,
            },
          },
          parents: {
            create: {},
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Parent,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email: firebaseUser.email };
  }

  async createLecturerFromFirebase(
    input: LecturerFirebaseRegistrationDto,
    firebaseUser: FirebaseUserData
  ): Promise<{ user: any; email: string }> {
    await this.ensureEmailNotExists(firebaseUser.email);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: firebaseUser.name,
          email: firebaseUser.email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          is_email_verified: firebaseUser.emailVerified,
          profile_pic_url: firebaseUser.photoUrl,
          role: role_enum.Lecturer,
          auth_identities: {
            create: {
              provider: firebaseUser.provider,
              provider_user_id: firebaseUser.uid,
              provider_email: firebaseUser.email,
            },
          },
          lecturers: {
            create: {
              bio: input.bio,
              expertise: input.expertise,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Lecturer,
            },
          },
          user_analytics: {
            create: {},
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return { user, email: firebaseUser.email };
  }

  // ============================================
  // CREATE NON-MAIN USERS (Admin creates these)
  // ============================================

  async createAdmin(input: CreateAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    this.ensureCreatorIsAdmin(creator);

    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Admin,
          is_email_verified: true, // Admin-created users are pre-verified
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          user_roles: {
            createMany: {
              data: [
                { portal: portal_enum.store, role: role_enum.Admin },
                { portal: portal_enum.academy, role: role_enum.Admin },
              ],
            },
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return this.mapToBaseUserData(user);
  }

  async createSubAdmin(input: CreateSubAdminDto, creator: CreatorContext): Promise<BaseUserData> {
    this.ensureCreatorIsAdmin(creator);

    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.SubAdmin,
          is_email_verified: true,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          user_roles: {
            createMany: {
              data: [
                { portal: portal_enum.store, role: role_enum.SubAdmin },
                { portal: portal_enum.academy, role: role_enum.SubAdmin },
              ],
            },
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return this.mapToBaseUserData(user);
  }

  async createModerator(input: CreateModeratorDto, creator: CreatorContext): Promise<BaseUserData> {
    this.ensureCreatorIsAdminOrSubAdmin(creator);

    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Moderator,
          is_email_verified: true,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Moderator,
            },
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return this.mapToBaseUserData(user);
  }

  async createAssistant(input: CreateAssistantDto, creator: CreatorContext): Promise<BaseUserData> {
    this.ensureCreatorCanCreateAssistant(creator, input.lecturer_user_id);

    const email = this.normalizeEmail(input.email);
    await this.ensureEmailNotExists(email);

    // Verify lecturer exists
    const lecturer = await this.db.lecturers.findUnique({
      where: { user_id: input.lecturer_user_id },
    });

    if (!lecturer) {
      throw new Error('Lecturer not found');
    }

    const passwordHash = await this.hashPassword(input.password);

    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name: input.name,
          email,
          phone: input.phone,
          secondary_phone: input.secondary_phone,
          gender: input.gender,
          password: passwordHash,
          role: role_enum.Assistant,
          is_email_verified: true,
          auth_identities: {
            create: {
              provider: 'local',
              provider_user_id: email,
              provider_email: email,
            },
          },
          assistants: {
            create: {
              lecturer_user_id: input.lecturer_user_id,
            },
          },
          user_roles: {
            create: {
              portal: portal_enum.academy,
              role: role_enum.Assistant,
            },
          },
        },
        select: this.baseUserSelect(),
      });

      return created;
    });

    return this.mapToBaseUserData(user);
  }

  // ============================================
  // USER LOOKUP METHODS
  // ============================================

  async findUserByEmail(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    return this.db.users.findFirst({
      where: { email: normalizedEmail },
      include: {
        user_roles: true,
        auth_identities: true,
      },
    });
  }

  async findUserById(userId: number) {
    return this.db.users.findUnique({
      where: { id: userId },
      include: {
        user_roles: true,
        auth_identities: true,
      },
    });
  }

  async findUserByAuthIdentity(provider: auth_provider_enum, providerUserId: string) {
    const identity = await this.db.auth_identities.findFirst({
      where: {
        provider,
        provider_user_id: providerUserId,
      },
      include: {
        users: {
          include: {
            user_roles: true,
            auth_identities: true,
          },
        },
      },
    });

    return identity?.users ?? null;
  }

  // ============================================
  // PASSWORD METHODS
  // ============================================

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.db.users.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        password_changed_at: new Date(),
      },
    });
  }

  // ============================================
  // AUTH IDENTITY METHODS
  // ============================================

  async createAuthIdentity(
    userId: number,
    provider: auth_provider_enum,
    providerUserId: string,
    providerEmail?: string
  ): Promise<void> {
    await this.db.auth_identities.create({
      data: {
        user_id: userId,
        provider,
        provider_user_id: providerUserId,
        provider_email: providerEmail,
      },
    });
  }

  async deleteAuthIdentity(identityId: number): Promise<void> {
    await this.db.auth_identities.delete({
      where: { id: identityId },
    });
  }

  async findAuthIdentity(userId: number, provider: auth_provider_enum) {
    return this.db.auth_identities.findFirst({
      where: {
        user_id: userId,
        provider,
      },
    });
  }

  async findAllAuthIdentities(userId: number) {
    return this.db.auth_identities.findMany({
      where: { user_id: userId },
      select: { id: true, provider: true, provider_email: true },
    });
  }

  // ============================================
  // EMAIL VERIFICATION TOKEN METHODS
  // ============================================

  async createEmailVerificationToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
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
  }

  async findValidEmailVerificationToken(tokenHash: string) {
    return this.db.email_verification_tokens.findFirst({
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
  }

  async markEmailVerificationTokenUsed(tokenId: number): Promise<void> {
    await this.db.email_verification_tokens.update({
      where: { id: tokenId },
      data: { used_at: new Date() },
    });
  }

  async verifyUserEmail(userId: number) {
    return this.db.users.update({
      where: { id: userId },
      data: {
        is_email_verified: true,
        email_verified_at: new Date(),
      },
      select: this.baseUserSelect(),
    });
  }

  // ============================================
  // PASSWORD RESET TOKEN METHODS
  // ============================================

  async createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.password_reset_tokens.upsert({
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
  }

  async findValidPasswordResetToken(tokenHash: string) {
    return this.db.password_reset_tokens.findFirst({
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
  }

  async markPasswordResetTokenUsed(tokenId: number): Promise<void> {
    await this.db.password_reset_tokens.update({
      where: { id: tokenId },
      data: { used_at: new Date() },
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async ensureEmailNotExists(email: string): Promise<void> {
    const existing = await this.db.users.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new Error('Email already in use');
    }
  }

  generateTeacherSerial(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `T-${timestamp}-${random}`.toUpperCase();
  }

  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  baseUserSelect() {
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

  mapToBaseUserData(user: any): BaseUserData {
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

  private ensureCreatorIsAdmin(creator: CreatorContext): void {
    if (creator.role !== role_enum.Admin) {
      throw new Error('Only Admin can perform this action');
    }
  }

  private ensureCreatorIsAdminOrSubAdmin(creator: CreatorContext): void {
    if (creator.role !== role_enum.Admin && creator.role !== role_enum.SubAdmin) {
      throw new Error('Only Admin or SubAdmin can perform this action');
    }
  }

  private ensureCreatorCanCreateAssistant(creator: CreatorContext, lecturerUserId: number): void {
    const isAdminOrSubAdmin = creator.role === role_enum.Admin || creator.role === role_enum.SubAdmin;
    const isLecturerCreatingOwn = creator.role === role_enum.Lecturer && creator.userId === lecturerUserId;

    if (!isAdminOrSubAdmin && !isLecturerCreatingOwn) {
      throw new Error('Only Admin, SubAdmin, or the Lecturer themselves can create an Assistant');
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
export default UserManagementService;
