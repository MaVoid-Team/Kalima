import { auth_provider_enum, portal_enum, role_enum } from '../../generated/prisma';

// ============================================
// AUTH TOKENS
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenPayload {
  userId: number;
  roles: UserRole[];
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: number;
}

// ============================================
// USER ROLES & PERMISSIONS
// ============================================

export interface UserRole {
  portal: portal_enum;
  role: role_enum;
}

export interface PortalAccess {
  store: boolean;
  academy: boolean;
}

// ============================================
// FIREBASE AUTH
// ============================================

export interface FirebaseDecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  phone_number?: string;
  firebase: {
    sign_in_provider: string;
    identities?: Record<string, string[]>;
  };
}

export interface FirebaseUserData {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  photoUrl?: string;
  provider: auth_provider_enum;
}

export interface LinkedProvider {
  provider: auth_provider_enum;
  providerEmail?: string;
  linkedAt?: Date;
}

// ============================================
// USER PROFILE DATA
// ============================================

export interface BaseUserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  secondary_phone?: string | null;
  gender: string;
  is_email_verified: boolean;
  profile_pic_url?: string | null;
  created_at: Date;
}

export interface TeacherProfileData extends BaseUserData {
  teacher: {
    serial: string;
    is_primary: boolean;
    is_preparatory: boolean;
    is_secondary: boolean;
    government_id: number;
    zone_id: number;
    subject_id: number;
  };
}

export interface StudentProfileData extends BaseUserData {
  student: {
    level_id: number;
    government_id: number;
    zone_id: number;
    parent_phone_number: string;
    faction?: string | null;
  };
}

export interface ParentProfileData extends BaseUserData {
  parent: {
    government_id?: number | null;
    zone_id?: number | null;
  };
}

export interface LecturerProfileData extends BaseUserData {
  lecturer: {
    bio?: string | null;
    expertise?: string | null;
  };
}

export interface AssistantProfileData extends BaseUserData {
  assistant: {
    lecturer_user_id: number;
  };
}

// ============================================
// AUTH RESPONSES
// ============================================

export interface LoginResponse {
  user: BaseUserData;
  tokens: AuthTokens;
  portalAccess: PortalAccess;
  linkedProviders: LinkedProvider[];
}

export interface RegistrationResponse {
  user: BaseUserData;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  tokens: AuthTokens;
}

export interface LinkProviderResponse {
  message: string;
  linkedProviders: LinkedProvider[];
}

// ============================================
// PASSWORD RESET
// ============================================

export interface PasswordResetToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

// ============================================
// CREATOR CONTEXT (for audit trail)
// ============================================

export interface CreatorContext {
  userId: number;
  role: role_enum;
}
