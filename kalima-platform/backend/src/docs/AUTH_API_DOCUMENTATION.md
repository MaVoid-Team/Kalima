# Authentication API Documentation

## Base URL

```
/api/v2/auth
```

---

## Table of Contents

1. [Registration Endpoints](#registration-endpoints)
2. [Login Endpoints](#login-endpoints)
3. [Token Management](#token-management)
4. [Password Management](#password-management)
5. [Email Verification](#email-verification)
6. [Account Linking](#account-linking)
7. [Admin User Creation](#admin-user-creation)
8. [Common Response Types](#common-response-types)
9. [Error Codes](#error-codes)

---

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Registration Endpoints

### Register Teacher (Local)

Creates a new teacher account with email/password authentication.

**Endpoint:** `POST /register/teacher`  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "is_primary": "boolean",
  "is_preparatory": "boolean",
  "is_secondary": "boolean",
  "government_id": "number (required)",
  "zone_id": "number (required)",
  "subject_id": "number (required)"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "secondary_phone": null,
    "gender": "male",
    "is_email_verified": false,
    "profile_pic_url": null,
    "created_at": "2026-02-15T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "refreshTokenExpiresAt": "2026-02-22T10:00:00.000Z"
  }
}
```

---

### Register Student (Local)

Creates a new student account.

**Endpoint:** `POST /register/student`  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "level_id": "number (required)",
  "government_id": "number (required)",
  "zone_id": "number (required)",
  "parent_phone_number": "string (optional)",
  "faction": "string (optional)"
}
```

**Success Response (201):** Same as Teacher registration

---

### Register Parent (Local)

Creates a new parent account.

**Endpoint:** `POST /register/parent`  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female"
}
```

**Success Response (201):** Same as Teacher registration

---

### Register Lecturer (Local)

Creates a new lecturer account.

**Endpoint:** `POST /register/lecturer`  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "bio": "string (optional)",
  "expertise": "string[] (optional)"
}
```

**Success Response (201):** Same as Teacher registration

---

### Register Teacher (Firebase)

Creates a new teacher account using Firebase OAuth (Google/Facebook).

**Endpoint:** `POST /register/teacher/firebase`  
**Auth Required:** No

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "is_primary": "boolean",
  "is_preparatory": "boolean",
  "is_secondary": "boolean",
  "government_id": "number (required)",
  "zone_id": "number (required)",
  "subject_id": "number (required)"
}
```

**Success Response (201):** Same as Teacher registration (email from Firebase token)

---

### Register Student (Firebase)

**Endpoint:** `POST /register/student/firebase`  
**Auth Required:** No

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "level_id": "number (required)",
  "government_id": "number (required)",
  "zone_id": "number (required)",
  "parent_phone_number": "string (optional)",
  "faction": "string (optional)"
}
```

---

### Register Parent (Firebase)

**Endpoint:** `POST /register/parent/firebase`  
**Auth Required:** No

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female"
}
```

---

### Register Lecturer (Firebase)

**Endpoint:** `POST /register/lecturer/firebase`  
**Auth Required:** No

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "bio": "string (optional)",
  "expertise": "string[] (optional)"
}
```

---

## Login Endpoints

### Login (Local)

Authenticates user with email and password.

**Endpoint:** `POST /login`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "secondary_phone": null,
    "gender": "male",
    "is_email_verified": true,
    "profile_pic_url": "https://...",
    "created_at": "2026-02-15T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "refreshTokenExpiresAt": "2026-02-22T10:00:00.000Z"
  },
  "portalAccess": {
    "store": true,
    "academy": false
  },
  "linkedProviders": [
    {
      "provider": "local",
      "providerEmail": "john@example.com"
    },
    {
      "provider": "google",
      "providerEmail": "john@gmail.com"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### Login (Firebase)

Authenticates user with Firebase OAuth token.

**Endpoint:** `POST /login/firebase`  
**Auth Required:** No

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)"
}
```

**Success Response (200):** Same as local login

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `404 Not Found` - User not registered

---

## Token Management

### Refresh Token

Exchanges a valid refresh token for new access and refresh tokens.

**Endpoint:** `POST /refresh`  
**Auth Required:** No

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200):**
```json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token...",
    "refreshTokenExpiresAt": "2026-02-22T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### Logout

Revokes the current refresh token.

**Endpoint:** `POST /logout`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Logout All Devices

Revokes all refresh tokens for the current user.

**Endpoint:** `POST /logout-all`  
**Auth Required:** Yes

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Logged out from all devices"
}
```

---

## Password Management

### Forgot Password

Sends password reset email if account exists.

**Endpoint:** `POST /forgot-password`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Note:** Always returns success to prevent email enumeration attacks.

---

### Reset Password

Resets password using token from email.

**Endpoint:** `POST /reset-password`  
**Auth Required:** No

**Request Body:**
```json
{
  "token": "string (required, from email link)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token

**Side Effects:**
- All refresh tokens are revoked (user logged out from all devices)
- Password changed notification email sent

---

### Change Password

Changes password for authenticated user.

**Endpoint:** `POST /change-password`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully. Please log in again."
}
```

**Error Responses:**
- `400 Bad Request` - Current password is incorrect

**Side Effects:**
- All refresh tokens are revoked
- Password changed notification email sent

---

### Set Password

Sets password for OAuth users who don't have one.

**Endpoint:** `POST /set-password`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "password": "string (required, min 8 chars)"
}
```

**Success Response (200):**
```json
{
  "message": "Password set successfully."
}
```

**Error Responses:**
- `400 Bad Request` - Password already set

---

## Email Verification

### Verify Email

Verifies user's email using token from email link.

**Endpoint:** `POST /verify-email`  
**Auth Required:** No

**Request Body:**
```json
{
  "token": "string (required, from email link)"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_email_verified": true,
    ...
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - Email already verified

**Side Effects:**
- Welcome email sent after successful verification

---

### Send Verification Email

Sends verification email to authenticated user.

**Endpoint:** `POST /send-verification`  
**Auth Required:** Yes

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Verification email sent"
}
```

**Error Responses:**
- `400 Bad Request` - Email already verified

---

### Resend Verification Email

Resends verification email (public endpoint).

**Endpoint:** `POST /resend-verification`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "If an account exists with this email, a verification link has been sent."
}
```

**Note:** Always returns success to prevent email enumeration attacks.

---

## Account Linking

### Link Firebase Account

Links a Firebase OAuth account to existing user.

**Endpoint:** `POST /link-firebase`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "idToken": "string (required, Firebase ID token)"
}
```

**Success Response (200):**
```json
{
  "message": "google account linked successfully",
  "linkedProviders": [
    { "provider": "local", "providerEmail": "john@example.com" },
    { "provider": "google", "providerEmail": "john@gmail.com" }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Account already linked to another user
- `400 Bad Request` - Provider already linked

---

### Unlink Provider

Removes a linked authentication provider.

**Endpoint:** `POST /unlink-provider`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "provider": "local | google | facebook | firebase"
}
```

**Success Response (200):**
```json
{
  "message": "google account unlinked successfully",
  "linkedProviders": [
    { "provider": "local", "providerEmail": "john@example.com" }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Cannot unlink the only authentication method
- `404 Not Found` - Provider not linked

---

### Get Linked Providers

Returns all linked authentication providers.

**Endpoint:** `GET /linked-providers`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "linkedProviders": [
    { "provider": "local", "providerEmail": "john@example.com" },
    { "provider": "google", "providerEmail": "john@gmail.com" }
  ]
}
```

---

## Admin User Creation

These endpoints are restricted to Admin users only.

### Create Admin

Creates a new Admin user.

**Endpoint:** `POST /create/admin`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 10,
    "name": "Admin User",
    "email": "admin@example.com",
    ...
  }
}
```

**Error Responses:**
- `403 Forbidden` - Only Admin can perform this action

---

### Create Sub-Admin

Creates a new Sub-Admin user.

**Endpoint:** `POST /create/sub-admin`  
**Auth Required:** Yes (Admin only)

**Request Body:** Same as Create Admin

**Error Responses:**
- `403 Forbidden` - Only Admin can perform this action

---

### Create Moderator

Creates a new Moderator user.

**Endpoint:** `POST /create/moderator`  
**Auth Required:** Yes (Admin or Sub-Admin)

**Request Body:** Same as Create Admin

**Error Responses:**
- `403 Forbidden` - Only Admin or SubAdmin can perform this action

---

### Create Assistant

Creates a new Assistant user linked to a Lecturer.

**Endpoint:** `POST /create/assistant`  
**Auth Required:** Yes (Admin, Sub-Admin, or the Lecturer)

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "phone": "string (required)",
  "secondary_phone": "string (optional)",
  "gender": "male | female",
  "lecturer_user_id": "number (required)"
}
```

**Error Responses:**
- `403 Forbidden` - Not authorized to create assistant
- `404 Not Found` - Lecturer not found

---

## Common Response Types

### BaseUserData

```typescript
{
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  gender: "male" | "female" | null;
  is_email_verified: boolean;
  profile_pic_url: string | null;
  created_at: Date;
}
```

### AuthTokens

```typescript
{
  accessToken: string;      // JWT, expires in 15 minutes
  refreshToken: string;     // Opaque token, expires in 7 days
  refreshTokenExpiresAt: Date;
}
```

### PortalAccess

```typescript
{
  store: boolean;    // Access to store portal
  academy: boolean;  // Access to academy portal
}
```

### LinkedProvider

```typescript
{
  provider: "local" | "google" | "facebook" | "firebase";
  providerEmail?: string;
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input or validation error |
| `401` | Unauthorized - Invalid or missing authentication |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists (e.g., email in use) |
| `500` | Internal Server Error |

### Error Response Format

```json
{
  "error": "Error message describing the issue",
  "statusCode": 400
}
```

---

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Login attempts | 5 per minute per IP |
| Password reset | 3 per hour per email |
| Registration | 10 per hour per IP |
| API requests (authenticated) | 100 per minute |

---

## Security Considerations

1. **Passwords**: Hashed using bcrypt with 12 salt rounds
2. **Tokens**: 
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Tokens are revoked on password change
3. **Email Verification**: 
   - Tokens expire in 48 hours
   - SHA-256 hashed in database
4. **Password Reset**:
   - Tokens expire in 24 hours
   - SHA-256 hashed in database
   - Single use (invalidated after use)

---

## Webhooks

Coming soon: Webhook notifications for auth events.

---

## SDK Support

Coming soon: Official SDKs for:
- JavaScript/TypeScript
- Dart (Flutter)
- Swift (iOS)
- Kotlin (Android)
