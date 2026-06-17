---
description: How to follow the core frontend architectural design and principles when implementing a task.sss
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
- **Hooks-Only API Pattern:** Components should never make direct API calls. Extract all data fetching and API logic into dedicated custom hooks (e.g., `useProducts.js`, `useProfileSettings.js`).
- **Axios:** All API calls within those custom hooks must utilize the configured Axios instance from `src/api/axios.js`.
- **Mutations:** For API mutations (POST, PATCH, DELETE), utilize the custom hook `useApiMutation` (`src/hooks/useApiMutation.js`) to standardize loading states and error/toast notifications.

## 4. Handling Duplicate Code (Helpers & Constants)
- **DRY Principle:** Do not duplicate code! Extract duplicate calculations (e.g., totaling prices), formatting logic (e.g., currency), or parsing logic.
- **Helpers:** Use helper files at all times! Create shared helper/lib files in the `src/lib/` directory (e.g., `src/lib/storeUtils.js` or `src/lib/cartUtils.js`) for any extracted or reusable logic, rather than keeping it inside components.
- **Constants:** Extract hardcoded string literals or reused static values as shared constants.

## 5. Styling
- **Tailwind CSS:** The project uses Tailwind CSS.
- **Semantic Colors:** We strictly use semantic colors from our `kalima-platform/frontend/src/index.css` file (e.g., `bg-background`, `text-primary`, `border-border`). Almost never hardcode rigid color values (like `bg-blue-500` or `#ffffff`). This properly supports our dynamic theming and dark mode toggle.
- **Class Merging:** Utilize the `cn()` utility from `src/lib/utils.js` for conditionally combining Tailwind classes safely.

## 6. Internationalization & Localization
- **Translations:** Use `react-i18next` (`useTranslation`) for all user-facing text. Avoid hardcoded strings in the UI components.
- **RTL & Logical Properties:** Ensure layouts naturally adapt to Right-To-Left (RTL) languages like Arabic. Use Tailwind's logical properties (e.g., `ms-2`, `pe-4`, `text-start`) instead of directional ones (e.g., `ml-2`, `pr-4`, `text-left`).

## 7. Responsive & Mobile-Friendly Design
- **Mobile-First Approach:** Always start by styling for smaller screens and use Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`, `xl:`) to adapt layouts for larger devices.
- **Fluid Layouts:** Rely on Flexbox (`flex`) and CSS Grid (`grid`) paired with relative units where appropriate to create highly adaptable fluid layouts.
- **Touch and Accessibility:** Ensure interactive elements (buttons, links, inputs) have adequate sizing, padding, and spacing to be easily usable on mobile touch devices.

## 8. Testing & Automation
- **Selenium-Friendly Code:** Always write Selenium-friendly code for testing. Add identifiable data attributes (e.g., `data-testid`, `id`, `name`) to interactive elements, links, buttons, and forms. This ensures UI automation tests can reliably interact with the DOM without depending on fragile CSS classes or layout structures.
You can follow this format for consistency : pageName-elementType-elementIdentifier (e.g., data-testid="login-page-submit-button").

**By following these guidelines, you will ensure the frontend codebase remains clean, maintainable, and uniform.**