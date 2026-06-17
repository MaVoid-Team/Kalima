# Identity & Auth Services

This document details the responsibilities, dependencies, and architecture of the user and authentication services located within `backend/src/apps/store-api/services/`.

---

## 1. `auth.service.ts`

**Primary Responsibility:**
Handles registration, login, logout, password resets, and token generation for users. It is the gatekeeper for issuing JSON Web Tokens (JWT) and maintaining session security.

**Core Dependencies:**

- `libs/db`: For retrieving user credentials and roles.
- `libs/redis`: Optional session invalidation tracking (e.g., blacklisting tokens on logout).
- `bcrypt`: Used for hashing and salting incoming passwords before DB storage.
- `jsonwebtoken`: For generating `access_tokens`.
- `emails/`: Triggers transactional emails for "Forgot Password" or "Welcome" flows.

**Database Models Touched:**

- `Users` (Read/Write)
- `UserRoles` (Read)

**Key Flow Example (Login):**

1.  Receives email and plaintext password.
2.  Fetches user by email. Throws `401 Unauthorized` if not found.
3.  Compares plaintext password with stored hash via `bcrypt.compare()`.
4.  If valid, signs a JWT carrying `{ userId, roles }`.
5.  Returns the token and user metadata.

---

## 2. `user-management.service.ts`

**Primary Responsibility:**
Designed strictly for **Admin operations**. It allows high-level staff to mutate other users, assign moderation roles, suspend accounts, and view paginated user lists.

**Core Dependencies:**

- `libs/db`: Heavy reliance on complex Prisma queries to manage relational data (like assigning a `SubAdmin` role to a standard user).

**Database Models Touched:**

- `Users` (Read/Update)
- `Roles` (Read)
- `UserRoles` (Insert/Delete)

**Architectural Note:**
Because this service executes destructive or highly sensitive actions (like role elevation), Controller methods calling this service MUST be protected by the `isAdmin` or `isSuperAdmin` middleware.

---

## 3. `user-profile.service.ts`

**Primary Responsibility:**
Designed for the **Platform User**. It allows a logged-in user to fetch their own data (My Orders, My Cart, My Details) and update their personal information (Changing Name, Phone Number, uploading a new Avatar).

**Core Dependencies:**

- `libs/db`
- `image.service.ts`: Forwarded requests to Cloudinary if the user updates their profile picture.

**Difference from `user-management`:**
While `user-management` can fetch _any_ user, `user-profile` strictly requires `req.user.id` to ensure users can only ever fetch or mutate their _own_ relational data.
