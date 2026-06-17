# Backend Documentation Wiki

Welcome to the backend developers' wiki for `backend/src`.

This index serves as the central hub tying together our architecture, coding guidelines, and technical workflows.

### 📚 Core Documentation Links

1.  **[System Architecture & Overview](./SYSTEM_ARCHITECTURE.md)**
    - Understand the high-level design, tech stack, and directory layout of the `backend/src` structure.
2.  **[Setup & Local Development](./SETUP_GUIDE.md)**
    - Learn how to clone, install dependencies, configure environment variables, and run the server locally.
3.  **[Database & Data Access](./DATABASE_DATA_ACCESS.md)**
    - Discover how Prisma works, where our schemas are defined, and how to manage and seed relational logic.
4.  **[Core Application Flow](./CORE_APPLICATION_FLOW.md)**
    - Trace the lifecycle of a request from the routes through the controllers down to the services.
5.  **[Shared Libraries & Integrations](./SHARED_LIBRARIES.md)**
    - Learn about common utilities hosted in `libs/` for authentication, Redis caching, robust error handling, or web sockets.
6.  **[Developer Guidelines & Best Practices](./DEVELOPER_GUIDELINES.md)**
    - Review our coding style, exact conventions, standard flows for adding a new feature, and how to enforce error handling globally.

### ⚙️ Deep Dive: Service Modules

If you need to understand the exact business logic, Prisma dependencies, and integrations of specific features, refer below:

1.  **[Identity & Auth Services](./SERVICES_AUTH_USERS.md)**
    - Covers `auth.service.ts`, `user-management.service.ts`, and `user-profile.service.ts`.
2.  **[Transactional Services](./SERVICES_TRANSACTIONS.md)**
    - Covers the cart lifecycle (`cart.service.ts`) and the critical checkout process (`purchases.service.ts`).
3.  **[Catalog & Storefront Services](./SERVICES_CATALOG.md)**
    - Covers `product.service.ts`, `category.service.ts`, and promotional logic in `coupon.service.ts`.

### 🔌 API Specific Documentation

For endpoint-specific schemas and logic, refer to the respective REST API documentation files located directly within the `docs/api/` folder (e.g., `api/api/PRODUCTS_API_DOCUMENTATION.md`, `api/api/AUTH_API_DOCUMENTATION.md`, etc.).
