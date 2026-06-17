# Catalog & Storefront Services

This document details the configuration layers of the eCommerce storefront: Products, Categories, and Coupons.

---

## 1. `product.service.ts`

**Primary Responsibility:**
Handles the CRUD operations for the platform's inventory. Administers product pricing, descriptions, stock levels, and associated media.

**Core Dependencies:**

- `libs/db`: Prisma client.
- `image.service.ts`: Relied upon heavily since creating a product typically involves uploading a thumbnail or a gallery of images to Cloudinary.

**Database Models Touched:**

- `Products`
- `Categories` (Junction tables mapping Product -> Category)
- `Images` / `Assets`

**Key Pattern:**
Because the frontend often requests lists of products with complex filtering (e.g., `?minPrice=10&categoryId=uuid&sortBy=price_asc`), this service contains the heaviest dynamic Prisma query builds in the application, mapping `req.query` strings to Prisma `where` and `orderBy` clauses.

**Main Methods Exposed:**

- `createProduct(dto, thumbnail, sample)`: Inserts a product, sequentially handles cloudinary image uploads for the thumbnail and sample file.
- `getAllProducts(userId?, filters?)`: Paginated robust fetch utilizing `PRODUCT_INCLUDE` for deep relationship graphs.
- `getProductById(id)` / `updateProduct(...)` / `deleteProduct(...)`: Routine entity lifecycle management.
- `uploadThumbnail(...)` / `removeThumbnail(...)`: Image manipulation.
- `addToGallery(productId, files, compress?)`: Uploads multiple images concurrently to Cloudinary and links them to the product gallery table.
- `attachCategories(...)` / `attachRequiredFields(...)`: Pivot table (junction) handlers for Many-to-Many entity graphs.

---

## 2. `category.service.ts`

**Primary Responsibility:**
Manages the hierarchical taxonomy of the store. Categories can often be nested (Parent -> Child).

**Database Models Touched:**

- `Categories`
- `Products` (via relations)

**Optimization Note:**
Categories rarely change but are fetched constantly (to render the navigation bar). Therefore, `category.service.ts` is an excellent candidate for Redis caching.

**Main Methods Exposed:**

- `getAllCategories(filters?)`: Fetches rooted hierarchy. Designed to nest recursively up to 3 levels deep (`sub_categories` -> `sub_categories`).
- `getRootCategories()` / `getChildrenByParent(parentId)`: Granular fetch utilities for frontend chunking.
- `createCategory()` / `updateCategory()` / `deleteCategory(id, deleteProducts)`: The delete method accepts a critical flag on whether to cascade delete attached products or merely orphan them.

**Special/Internal Computations:**

- `getCategoryDepth(categoryId)`: Determines the nesting integer level (1 = root, 2 = child).
- `isDescendantOf(descendantId, ancestorId)`: Algorithmic checker to prevent endless cyclical parent assignments.
- `collectDescendantIds` / `archiveCascade`: Performs recursive sweeping over the category tree structure.

---

## 3. `coupon.service.ts`

**Primary Responsibility:**
Administers promotional codes. Checks validity, enforces limits, and calculates discount output percentages or fixed-rate deductions.

**Core Flow (Validation Logic):**
When validating a coupon, it checks:

1.  **Is Active?**: `status === 'ACTIVE'`
2.  **Date Validity**: `currentDate >= startDate && currentDate <= expirationDate`.
3.  **Global Limits**: `usageCount < maxUsesList`.
4.  **User Limits**: Has this specific user already claimed it? (Requires querying `Purchases` to see if the user ID matches a past order with this coupon).

**Main Methods Exposed:**

- `createCoupon(...)` / `updateCoupon(...)` / `deleteCoupon(...)`
- `getAllCoupons(...)`: Searches across type (`AMOUNT` vs `PERCENTAGE`).
- `getCouponsByProduct(productId)`: Fetches promotions isolated to a specific item.
- `validateCoupon(code, userId?, productId?)`: The primary validation engine invoked heavily by `CartService`.

**Special Approaches / Generation:**

- `generateUniqueCode()`: Custom `crypto.randomBytes` generation, verified against database collisions, formatted strictly to `KLM-XXXXXX`.
- `recordCouponUsage(userId, couponId, tx?)`: Crucial atomic transaction step ensuring that immediately after a purchase, the `current_usages` metric escalates safely.
