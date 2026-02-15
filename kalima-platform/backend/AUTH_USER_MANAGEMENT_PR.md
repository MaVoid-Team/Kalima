# Pull Request: Auth & User Management System Refactoring

## Overview

This PR introduces a comprehensive refactoring of the authentication and user management system, implementing SOLID principles, DRY patterns, and adding email verification functionality.

---

## Changes Summary

### 🆕 New Files Created

| File | Purpose |
|------|---------|
| `src/apps/store-api/services/user-management.service.ts` | Dedicated service for user CRUD operations |
| `src/apps/store-api/controllers/auth.controller.ts` | Express controller with all auth endpoints |
| `src/apps/store-api/routes/auth.routes.ts` | Route definitions with public/protected endpoints |
| `src/libs/auth/middleware.ts` | JWT authentication middleware |
| `src/apps/store-api/emails/email.service.ts` | Email sending service with nodemailer |
| `src/apps/store-api/emails/templates/*.ts` | Email templates (5 files) |
| `src/apps/store-api/emails/index.ts` | Email module exports |

### ✏️ Modified Files

| File | Changes |
|------|---------|
| `src/apps/store-api/services/auth.service.ts` | Refactored to use UserManagementService, reduced from 1510 to 906 lines |
| `src/apps/store-api/prisma/schema.prisma` | Added `email_verification_tokens` and `password_reset_tokens` tables |
| `src/apps/store-api/interfaces/auth.interface.ts` | Updated `RefreshResponse` interface |

---

## Detailed Changes

### 1. Auth Service Refactoring (`auth.service.ts`)

**Before:** 1510 lines with duplicated code across registration methods  
**After:** 906 lines (~40% reduction)

#### What Changed:
- Delegated all user creation logic to `UserManagementService`
- Removed duplicate helper methods:
  - `ensureEmailNotExists()`
  - `generateTeacherSerial()`
  - `ensureCreatorIsAdmin()`
  - `ensureCreatorIsAdminOrSubAdmin()`
  - `ensureCreatorCanCreateAssistant()`

#### Registration Methods Now Delegate:
```typescript
// Before (each method had ~50 lines of transaction code)
async registerTeacher(input: TeacherRegistrationDto): Promise<RegistrationResponse> {
  const email = this.normalizeEmail(input.email);
  await this.ensureEmailNotExists(email);
  const passwordHash = await this.hashPassword(input.password);
  // ... 40+ more lines of transaction code
}

// After (clean delegation)
async registerTeacher(input: TeacherRegistrationDto): Promise<RegistrationResponse> {
  const { user, email } = await userManagementService.createTeacher(input);
  const tokens = await this.issueTokens(user.id);
  await this.sendAccountVerificationEmail(user.id, user.name, email, role_enum.Teacher);
  return { user: this.mapToBaseUserData(user), tokens };
}
```

---

### 2. User Management Service (`user-management.service.ts`)

New service (~938 lines) handling all user CRUD operations.

#### Methods:

**Main User Creation (Local):**
- `createTeacher(input)` → `{ user, email }`
- `createStudent(input)` → `{ user, email }`
- `createParent(input)` → `{ user, email }`
- `createLecturer(input)` → `{ user, email }`

**Main User Creation (Firebase OAuth):**
- `createTeacherFromFirebase(input, firebaseUser)` → `{ user, email }`
- `createStudentFromFirebase(input, firebaseUser)` → `{ user, email }`
- `createParentFromFirebase(input, firebaseUser)` → `{ user, email }`
- `createLecturerFromFirebase(input, firebaseUser)` → `{ user, email }`

**Non-Main User Creation (Admin-only):**
- `createAdmin(input, creator)` → `BaseUserData`
- `createSubAdmin(input, creator)` → `BaseUserData`
- `createModerator(input, creator)` → `BaseUserData`
- `createAssistant(input, creator)` → `BaseUserData`

---

### 3. Email System

#### Email Service (`emails/email.service.ts`)
- Uses nodemailer with SMTP configuration
- Singleton pattern with `getEmailService()`
- Configurable via environment variables:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`

#### Email Templates Created:

| Template | Purpose |
|----------|---------|
| `verification-email.ts` | Email verification link |
| `password-reset.ts` | Password reset link |
| `welcome.ts` | Welcome email after verification |
| `password-changed.ts` | Password change notification |
| `account-created.ts` | New account with verification |

---

### 4. Database Schema Updates

#### New Tables:

```prisma
model email_verification_tokens {
  id         Int       @id @default(autoincrement())
  user_id    Int       @unique
  token_hash String
  expires_at DateTime
  used_at    DateTime?
  created_at DateTime  @default(now())
  users      users     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model password_reset_tokens {
  id         Int       @id @default(autoincrement())
  user_id    Int       @unique
  token_hash String
  expires_at DateTime
  used_at    DateTime?
  created_at DateTime  @default(now())
  users      users     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

#### Users Table Update:
- Added `email_verified_at` field

---

### 5. Auth Controller (`controllers/auth.controller.ts`)

Express controller with all auth endpoints using class-validator for DTO validation.

#### Endpoints Handled:
- POST `/register/teacher`
- POST `/register/student`
- POST `/register/parent`
- POST `/register/lecturer`
- POST `/register/teacher/firebase`
- POST `/register/student/firebase`
- POST `/register/parent/firebase`
- POST `/register/lecturer/firebase`
- POST `/login`
- POST `/login/firebase`
- POST `/refresh`
- POST `/logout`
- POST `/logout-all`
- POST `/forgot-password`
- POST `/reset-password`
- POST `/change-password`
- POST `/set-password`
- POST `/verify-email`
- POST `/resend-verification`
- POST `/send-verification`
- POST `/link-firebase`
- POST `/unlink-provider`
- GET `/linked-providers`
- POST `/create/admin`
- POST `/create/sub-admin`
- POST `/create/moderator`
- POST `/create/assistant`

---

### 6. Auth Routes (`routes/auth.routes.ts`)

Route configuration with:
- Public routes (no authentication required)
- Protected routes (JWT authentication required)
- Uses `authenticateToken` middleware

---

### 7. JWT Middleware (`libs/auth/middleware.ts`)

Two middleware functions:
- `authenticateToken` - Required authentication
- `optionalAuthenticateToken` - Optional authentication (for mixed-access routes)

---

## Architecture Improvements

### SOLID Principles Applied:

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | `AuthService` = auth flow, `UserManagementService` = user CRUD |
| **Open/Closed** | Services are extendable without modification |
| **Dependency Inversion** | Services depend on abstractions (PrismaClient interface) |

### DRY Improvements:
- Eliminated ~600 lines of duplicated user creation code
- Centralized helper methods in appropriate services
- Reusable email templates with consistent styling

---

## Environment Variables Required

```env
# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM_NAME=Kalima Platform
EMAIL_FROM_ADDRESS=noreply@kalima.com

# App
APP_URL=http://localhost:3000
SUPPORT_URL=http://localhost:3000/support
```

---

## Testing Considerations

### Endpoints to Test:
1. All registration flows (local + Firebase)
2. Login flows (local + Firebase)
3. Password reset flow (forgot → email → reset)
4. Email verification flow (register → email → verify)
5. Account linking/unlinking
6. Admin user creation (permissions check)

### Edge Cases:
- Duplicate email registration
- Invalid/expired tokens
- Unauthorized access attempts
- Firebase token verification failures

---

## Migration Steps

1. Run Prisma migration for new tables:
   ```bash
   npx prisma migrate dev --name add_email_verification_tokens
   ```

2. Install new dependencies (if not already):
   ```bash
   npm install nodemailer class-validator class-transformer
   npm install -D @types/nodemailer
   ```

3. Update environment variables with SMTP configuration

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

---

## Breaking Changes

None - All existing API contracts are maintained. The refactoring is internal.

---

## Files Changed

```
backend/
├── src/
│   ├── apps/
│   │   └── store-api/
│   │       ├── controllers/
│   │       │   └── auth.controller.ts (NEW)
│   │       ├── emails/
│   │       │   ├── email.service.ts (NEW)
│   │       │   ├── index.ts (NEW)
│   │       │   └── templates/
│   │       │       ├── account-created.ts (NEW)
│   │       │       ├── password-changed.ts (NEW)
│   │       │       ├── password-reset.ts (NEW)
│   │       │       ├── verification-email.ts (NEW)
│   │       │       └── welcome.ts (NEW)
│   │       ├── interfaces/
│   │       │   └── auth.interface.ts (MODIFIED)
│   │       ├── prisma/
│   │       │   └── schema.prisma (MODIFIED)
│   │       ├── routes/
│   │       │   └── auth.routes.ts (NEW)
│   │       └── services/
│   │           ├── auth.service.ts (MODIFIED - refactored)
│   │           └── user-management.service.ts (NEW)
│   └── libs/
│       └── auth/
│           └── middleware.ts (NEW)
```

---

## Reviewers Checklist

- [ ] Code follows project conventions
- [ ] No sensitive data exposed in logs
- [ ] Error messages are user-friendly
- [ ] Email templates render correctly
- [ ] JWT tokens are properly validated
- [ ] Database transactions are used where needed
- [ ] TypeScript compilation passes
- [ ] No unused imports or dead code
