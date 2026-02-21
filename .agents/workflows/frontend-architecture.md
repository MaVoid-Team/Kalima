---
description: How to follow the core frontend architectural design and principles when implementing a task.
---

This workflow outlines the established patterns in the frontend architecture. Developers and agents should strictly adhere to these principles for consistency and maintainability when working on the frontend (`kalima-platform/frontend`).

## 1. Authentication
- **Status:** Fully implemented.
- **Usage:** Cart and Checkout APIs require authentication. Use existing Login or Register UI flows to authenticate and test users.
- **Interceptors:** The `axios` interceptor is already configured to automatically attach the valid JWT token to every request.
- **Hooks:** If you need to verify user authentication status or retrieve user details inside components, use the `useAuth` hook located in `src/hooks/auth/useAuth.js`.

## 2. Component Structure
- **UI Components:** Use reusable UI components from `src/components/ui/` (based on shadcn/ui) whenever possible. Avoid writing custom raw elements for standard UI parts.
- **Domain-Specific Components:** Place components specific to a domain or feature in their respective feature folders (e.g., `src/components/MarketPage`, `src/components/cart`, `src/components/checkout`). 
- **Clean Pages:** Keep page components clean by extracting complex logic into these smaller components.

## 3. API & State Management
- **Axios:** All API calls must utilize the configured Axios instance from `src/api/axios.js`.
- **Mutations:** For API mutations (POST, PATCH, DELETE), utilize the custom hook `useApiMutation` (`src/hooks/useApiMutation.js`) to standardize loading states and error/toast notifications.

## 4. Handling Duplicate Code (Helpers & Constants)
- **DRY Principle:** Do not duplicate code! Extract duplicate calculations (e.g., totaling prices), formatting logic (e.g., currency), or parsing logic.
- **Helpers:** Create shared helper/lib files in the `src/lib/` directory (e.g., `src/lib/storeUtils.js` or `src/lib/cartUtils.js`).
- **Constants:** Extract hardcoded string literals or reused static values as shared constants.

## 5. Styling
- **Tailwind CSS:** The project uses Tailwind CSS.
- **Class Merging:** Utilize the `cn()` utility from `src/lib/utils.js` for conditionally combining Tailwind classes safely.

**By following these guidelines, you will ensure the frontend codebase remains clean, maintainable, and uniform.**
