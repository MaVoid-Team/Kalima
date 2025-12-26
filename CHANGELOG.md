# Kalima Platform - Recent Updates & Changes

## Overview
This document summarizes all changes made to the Kalima Platform to support free products, improve checkout experience, and enhance order management features.

---

## Latest Fixes (December 26, 2024)

### 1. Payment Method Information Not Showing in Cart Purchases ✅ FIXED

**Problem:**
When retrieving cart purchases (both for users and admins), the payment method details (name and phone number) were not being populated, making it difficult to see which payment method was used.

**Solution:**
Updated all cart purchase retrieval endpoints to properly populate the `paymentMethod` field with both `name` and `phoneNumber`.

**Files Changed:**

**Backend:**
- `kalima-platform/backend/controllers/ec.cartPurchaseController.js`
  - Updated `getAllPurchases()` - Added `phoneNumber` to paymentMethod population
  - Updated `getCartPurchases()` - Added paymentMethod population with name and phoneNumber
  - Updated `getCartPurchaseById()` - Added paymentMethod population with name and phoneNumber
  - All populate calls now include: `.populate({ path: 'paymentMethod', select: 'name phoneNumber', strictPopulate: false })`

**Frontend:**
- `kalima-platform/frontend/src/pages/KalimaStore/AdminPanel/Orders.jsx`
  - Updated table display to show payment method as an object with `name` and `phoneNumber`
  - Updated details modal to display payment method name and phone number separately
  - Changed from hardcoded string checks to dynamic object property access
  - Now displays: Payment method name as badge + phone number below it in table
  - Details modal shows both payment method name and phone number

- `kalima-platform/frontend/public/locales/en/kalimaStore-orders.json`
  - Added `paymentMethodPhone` translation key

- `kalima-platform/frontend/public/locales/ar/kalimaStore-orders.json`
  - Added `paymentMethodPhone` translation key (رقم هاتف طريقة الدفع)

### 2. Duplicate /api/v1 in Return Purchase Endpoint ✅ FIXED

**Problem:**
The return purchase endpoint was failing with error: `Cannot PATCH /api/v1/api/v1/ec/cart-purchases/{id}/return`
This indicates the URL had a duplicate `/api/v1` prefix.

**Root Cause:**
The `BACKEND_URL` or `VITE_API_URL` environment variable in production/docker was set to include `/api/v1` (e.g., `http://backend:5000/api/v1`) when it should only be the base URL (e.g., `http://backend:5000`).

**Solution Implemented:**
Created a robust code-level fix that automatically handles this issue:

**New File:**
- `kalima-platform/frontend/src/utils/apiConfig.js`
  - Utility function that normalizes the API URL
  - Automatically strips `/api/v1` or `/api/v1/` from the end of `VITE_API_URL`
  - Works correctly regardless of how the environment variable is configured
  - Prevents duplicate `/api/v1` paths in all API calls

**Updated Files:**
- `kalima-platform/frontend/src/routes/orders.jsx`
  - Now imports `API_URL` from `apiConfig` utility
  - Ensures all cart purchase endpoints use normalized URL
  
- `kalima-platform/frontend/src/routes/cart.js`
  - Now imports `API_URL` from `apiConfig` utility
  - Ensures cart operations use normalized URL

**How It Works:**
The utility uses regex to remove `/api/v1` from the end:
```javascript
rawApiUrl.replace(/\/api\/v1\/?$/, '')
```

This means:
- `http://backend:5000` → `http://backend:5000` ✅
- `http://backend:5000/api/v1` → `http://backend:5000` ✅
- `http://backend:5000/api/v1/` → `http://backend:5000` ✅

**Recommendation:**
While the code now handles this automatically, it's still best practice to set environment variables correctly:
- ✅ Correct: `VITE_API_URL=http://backend:5000`
- ❌ Incorrect: `VITE_API_URL=http://backend:5000/api/v1`

---

## 1. Free Products Support (Cart Total = 0)

### Problem
The system required payment screenshots and payment information even for free products (price = 0), which created a poor user experience.

### Solution
Modified the cart and checkout system to conditionally show/hide payment fields based on cart total.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/CartPage.jsx`**
- Added conditional rendering for payment fields
- Payment screenshot upload only shows when `cartTotal > 0`
- "Number Transferred From" field only shows when `cartTotal > 0`
- Form validation updated to skip payment fields when cart is free
- Added visual indicators for free products

**Key Changes:**
```javascript
// Payment fields only show if cartTotal > 0
{cartTotal > 0 && (
  <>
    <PaymentScreenshotField />
    <NumberTransferredFromField />
  </>
)}
```

#### Backend Changes

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Modified validation logic to skip payment requirements when `cart.total === 0`
- Payment screenshot and transfer number are now optional for free orders
- Payment number only set when cart has value

**Key Changes:**
```javascript
// Validate payment info only if cart total > 0
if (cart.total > 0) {
    if (!req.body.numberTransferredFrom || !req.file) {
        return next(new AppError("Payment Screenshot and Number Transferred From are required", 400));
    }
}

// Only set payment data if cart total > 0
const paymentScreenShot = cart.total > 0 && req.file ? req.file.path : null;
const numberTransferredFrom = cart.total > 0 ? req.body.numberTransferredFrom : null;
```

---

## 2. Checkout Cooldown System (30 Seconds)

### Problem
Users could accidentally submit multiple orders by clicking the checkout button multiple times.

### Solution
Implemented a 30-second cooldown period between checkout submissions with both frontend and backend protection.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/CartPage.jsx`**
- Added cooldown timer state management
- Displays countdown timer when cooldown is active
- Disables checkout button during cooldown
- Persists cooldown state in localStorage
- Shows visual feedback with timer

**Key Features:**
- 30-second countdown timer
- Persistent across page refreshes
- Visual countdown display
- Disabled button during cooldown

#### Backend Changes

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Added server-side rate limiting
- Checks for purchases made in last 30 seconds
- Returns error with remaining seconds if cooldown active

**Key Changes:**
```javascript
// Rate limiting: Check if user has made a purchase in the last 30 seconds
const thirtySecondsAgo = new Date(Date.now() - 30000);
const recentPurchase = await ECCartPurchase.findOne({
    createdBy: req.user._id,
    createdAt: { $gte: thirtySecondsAgo }
}).sort({ createdAt: -1 });

if (recentPurchase) {
    const remainingSeconds = Math.ceil((30000 - timeSinceLastPurchase) / 1000);
    return next(new AppError(`Please wait ${remainingSeconds} seconds before making another purchase`, 429));
}
```

#### Translation Files Updated
- `kalima-platform/frontend/public/locales/ar/kalimaStore-Cart.json`
- `kalima-platform/frontend/public/locales/en/kalimaStore-Cart.json`

Added translations for:
- Cooldown messages
- Timer display
- Error messages

---

## 3. Already Purchased Product Indicators

### Problem
Users couldn't easily see which products they had already purchased, leading to confusion and potential duplicate purchases.

### Solution
Added visual indicators (ribbons) and confirmation dialogs for products users have already bought.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/Market.jsx`**
- Added "Already Purchased" ribbon overlay on product cards
- Fetches user's purchase history on component mount
- Shows confirmation dialog when adding already-purchased products to cart
- Visual styling with green ribbon and checkmark icon

**`kalima-platform/frontend/src/pages/KalimaStore/ProductDetails.jsx`**
- Added "Already Purchased" banner on product detail page
- Shows confirmation dialog before adding to cart
- Fetches purchase history for current product

#### Backend Changes

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Added `getUserPurchasedProducts` endpoint
- Returns list of all product IDs user has purchased
- Used by frontend to check purchase status

#### Translation Files Updated
- Added translations for "Already Purchased" messages
- Added confirmation dialog text
- Both Arabic and English translations

---

## 4. Confirmed Orders Report (Admin Dashboard)

### Problem
Admins needed a way to track which orders were confirmed and by whom, with performance statistics.

### Solution
Created a comprehensive admin dashboard page showing confirmed orders and admin statistics.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/ConfirmedOrdersReport.jsx`** (NEW FILE)
- Complete admin dashboard for confirmed orders
- Shows statistics by admin/moderator
- Displays total confirmed orders and revenue
- Lists recent confirmed orders
- Shows admin performance metrics

**Features:**
- Summary statistics (total orders, revenue, average confirmation time)
- Admin leaderboard (sorted by confirmations)
- Recent confirmed orders list
- Detailed order information
- Responsive design

**`kalima-platform/frontend/src/App.jsx`**
- Added route for confirmed orders report
- Protected route (admin only)

**`kalima-platform/frontend/src/components/UnifiedSidebar.jsx`**
- Added navigation link to confirmed orders report
- Only visible to admins

#### Backend Changes

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Added `getConfirmedOrdersReport` endpoint
- Aggregates confirmed orders by confirmer
- Calculates statistics and performance metrics
- Returns detailed order information

#### Translation Files Updated
- `kalima-platform/frontend/public/locales/ar/common.json`
- `kalima-platform/frontend/public/locales/en/common.json`

Added translations for:
- Report titles and labels
- Statistics labels
- Admin performance metrics

---

## 5. WhatsApp Notifications with Product List (Admin Panel)

### Problem
When admins contacted customers via WhatsApp, the message didn't include order details or product list.

### Solution
Enhanced WhatsApp contact feature to include complete order information with product list.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/AdminPanel/Orders.jsx`**
- Updated `handleWhatsAppContact` function
- Builds detailed product list from order items
- Includes order number, product names, prices
- Shows discount and total
- All text in Arabic for customer communication

**Message Format:**
```
أهلاً بك أ/ [Customer Name] 👋

تم استلام طلبك بنجاح، وجارٍ تجهيزه الآن.

*رقم الطلب:* [Order Serial]

*المنتجات:*
1. [Product Name] - [Price] جنيه
2. [Product Name] - [Price] جنيه

- الخصم: [Discount] جنيه
*الإجمالي: [Total] جنيه*

لو عندك أي استفسار بخصوص الطلب، تقدر تتواصل معانا في أي وقت على نفس الرقم.

نتمنى تعجبك تجربتك معانا، ومبسوطين إنك اخترتنا! 💙

مع تحيات فريق عمل
منصة كلمة
```

---

## Summary of All Modified Files

### Backend Files (1)
1. `kalima-platform/backend/controllers/ec.cartPurchaseController.js`
   - Free products support
   - Checkout cooldown
   - Confirmed orders report endpoint

### Frontend Files (6)
1. `kalima-platform/frontend/src/pages/KalimaStore/CartPage.jsx`
   - Free products UI
   - Checkout cooldown timer

2. `kalima-platform/frontend/src/pages/KalimaStore/Market.jsx`
   - Already purchased indicators

3. `kalima-platform/frontend/src/pages/KalimaStore/ProductDetails.jsx`
   - Already purchased banner

4. `kalima-platform/frontend/src/pages/KalimaStore/ConfirmedOrdersReport.jsx` (NEW)
   - Admin confirmed orders dashboard

5. `kalima-platform/frontend/src/pages/KalimaStore/AdminPanel/Orders.jsx`
   - Enhanced WhatsApp messages with product list

6. `kalima-platform/frontend/src/App.jsx`
   - Added confirmed orders route

7. `kalima-platform/frontend/src/components/UnifiedSidebar.jsx`
   - Added confirmed orders navigation

### Translation Files (4)
1. `kalima-platform/frontend/public/locales/ar/kalimaStore-Cart.json`
2. `kalima-platform/frontend/public/locales/en/kalimaStore-Cart.json`
3. `kalima-platform/frontend/public/locales/ar/common.json`
4. `kalima-platform/frontend/public/locales/en/common.json`

---

## Testing Checklist

### Free Products
- [ ] Add free product (price = 0) to cart
- [ ] Verify payment fields are hidden
- [ ] Complete checkout without payment screenshot
- [ ] Verify order is created successfully

### Checkout Cooldown
- [ ] Complete a checkout
- [ ] Try to checkout again immediately
- [ ] Verify 30-second countdown appears
- [ ] Wait for countdown to finish
- [ ] Verify checkout is enabled again

### Already Purchased Indicators
- [ ] Purchase a product
- [ ] Navigate to market page
- [ ] Verify "Already Purchased" ribbon appears
- [ ] Try to add to cart
- [ ] Verify confirmation dialog appears

### Confirmed Orders Report
- [ ] Login as admin
- [ ] Navigate to confirmed orders report
- [ ] Verify statistics are displayed
- [ ] Check admin leaderboard
- [ ] View recent confirmed orders

### WhatsApp Messages
- [ ] Open admin orders panel
- [ ] Click WhatsApp button on an order
- [ ] Verify message includes product list
- [ ] Verify message includes order number and total
- [ ] Verify message is in Arabic

---

## Notes for Developers

1. **Free Products**: The system now fully supports products with 0 price. Payment validation is conditional based on cart total.

2. **Cooldown System**: Both frontend and backend implement cooldown. Frontend uses localStorage for persistence, backend uses database queries.

3. **Purchase History**: The system tracks user purchases and displays indicators. This helps prevent duplicate purchases.

4. **Admin Dashboard**: New confirmed orders report provides insights into order processing and admin performance.

5. **WhatsApp Integration**: Messages are pre-formatted with order details. Ready for WhatsApp API integration when needed.

---

## 6. Admin Notifications for New Orders

### Problem
Admins, sub-admins, and moderators were not notified when new orders were placed, requiring them to manually check for new orders.

### Solution
Implemented real-time notification system that alerts all admin users when a cart purchase is created.

### Files Changed

#### Backend Changes

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Added notification creation after successful purchase
- Queries all users with Admin, SubAdmin, or Moderator roles
- Creates individual notifications for each admin user
- Includes complete order details in notification metadata

**Notification Details:**
- **Title**: "طلب جديد في المتجر" (New Store Order)
- **Message**: Customer name, order number, item count, total
- **Type**: `store_purchase`
- **Metadata**: Complete order details including:
  - Purchase serial number
  - Customer information (name, email, phone)
  - Product list with prices
  - Subtotal, discount, and total
  - Item count and individual product details

**Key Features:**
- Real-time notifications via Socket.IO
- Notifications persist if admin is offline
- Detailed order information in metadata
- Non-blocking (purchase succeeds even if notifications fail)
- Supports multiple admin users simultaneously

**Code Example:**
```javascript
// Find all admin users
const adminUsers = await User.find({
    role: { $in: ['Admin', 'SubAdmin', 'Moderator'] }
}).select('_id name role');

// Create notification for each admin
const notificationPromises = adminUsers.map(admin => {
    return Notification.create({
        userId: admin._id,
        title: 'طلب جديد في المتجر',
        message: `طلب جديد من ${req.user.name}...`,
        type: 'store_purchase',
        relatedId: purchase._id,
        metadata: { /* order details */ }
    });
});

await Promise.all(notificationPromises);
```

### How It Works

1. **Order Creation**: When a user completes checkout, a purchase is created
2. **Admin Query**: System finds all users with admin roles
3. **Notification Creation**: Individual notification created for each admin
4. **Real-time Delivery**: Socket.IO sends notification to online admins
5. **Persistence**: Offline admins receive notification when they log in

### Important Note

**Duplicate Notification Fix**: The old single-product purchase system (`ec.purchaseController.js`) also had notification logic that was creating duplicate notifications. This has been disabled since the platform now uses the cart-based purchase system exclusively. If you need to re-enable single-product purchases, uncomment the notification code in `ec.purchaseController.js` and change the notification type to distinguish it from cart purchases.

### Notification Content

**Arabic Message Format:**
```
طلب جديد في المتجر

طلب جديد من [Customer Name]
رقم الطلب: [Purchase Serial]
عدد المنتجات: [Item Count]
الإجمالي: [Total] EGP
```

**Metadata Includes:**
- Purchase serial number
- Customer details (name, email, phone)
- Complete product list with prices
- Financial details (subtotal, discount, total)
- Timestamp

---

## Future Enhancements

- [ ] Add email notifications with product list (currently basic)
- [ ] Implement actual WhatsApp API integration (currently uses wa.me links)
- [ ] Add export functionality for confirmed orders report
- [ ] Add date range filters for confirmed orders
- [ ] Add customer notes display in WhatsApp messages
- [ ] Add notification preferences for admins
- [ ] Add notification sound/badge for new orders
- [ ] Add bulk notification actions

---

**Last Updated:** December 8, 2025
**Version:** 1.1
**Authors:** Development Team


---

## 7. Watermark Upload & Payment Method Selection

### Problem
Teachers needed the ability to upload watermark images for their memos, and all users needed to specify their payment method (Vodafone Cash or Instapay) during checkout.

### Solution
Added watermark upload field (teachers only) and payment method dropdown (all users) to the cart checkout page, with full admin dashboard integration.

### Files Changed

#### Frontend Changes

**`kalima-platform/frontend/src/pages/KalimaStore/CartPage.jsx`**
- Added `getUserFromToken` import to check user role
- Added `userRole` state to track current user's role
- Added `watermark` and `paymentMethod` fields to `checkoutData` state
- Added `handleWatermarkChange` function for watermark file upload
- Added watermark upload field (only visible for teachers)
- Added warning message about printing issues (English & Arabic)
- Added payment method dropdown with two options:
  - Vodafone Cash: 01008715756
  - Instapay: 01001122334
- Updated form validation to require payment method for paid orders
- Updated form reset to include watermark and paymentMethod

**Key Changes:**
```javascript
// Watermark upload (only for teachers)
...(userRole === "Teacher" ? [
  {
    key: "watermark",
    label: t("uploadWatermark"),
    warning: <WarningAlert message={t("watermarkWarning")} />,
    input: <FileInput onChange={handleWatermarkChange} />
  }
] : [])

// Payment method dropdown (all users)
{
  key: "paymentMethod",
  label: t("paymentMethod"),
  input: (
    <select value={checkoutData.paymentMethod}>
      <option value="vodafone cash">Vodafone Cash - 01008715756</option>
      <option value="instapay">Instapay - 01001122334</option>
    </select>
  )
}
```

**`kalima-platform/frontend/src/routes/cart.js`**
- Updated `createCartPurchase` to append `paymentMethod` to FormData
- Updated `createCartPurchase` to append `watermark` file to FormData

**`kalima-platform/frontend/src/pages/KalimaStore/AdminPanel/Orders.jsx`**
- Added "Payment Method" column to orders table
- Added watermark view button in actions column (purple icon with "W")
- Updated table colspan from 11 to 12 for new column
- Added payment method display in order details modal
- Added watermark view button in order details modal
- Payment method shown as badge (Vodafone Cash or Instapay)

**Translation Files:**
- `kalima-platform/frontend/public/locales/ar/kalimaStore-Cart.json`
- `kalima-platform/frontend/public/locales/en/kalimaStore-Cart.json`

**New Translation Keys:**
```json
{
  "watermark": "Watermark / علامة مائية",
  "watermarkWarning": "Warning message about printing issues",
  "uploadWatermark": "Upload Watermark (Optional)",
  "paymentMethod": "Payment Method / طريقة الدفع",
  "selectPaymentMethod": "Select payment method",
  "vodafoneCash": "Vodafone Cash / فودافون كاش",
  "instapay": "Instapay / انستاباي",
  "paymentMethodRequired": "Payment method is required"
}
```

#### Backend Changes

**`kalima-platform/backend/models/ec.cartPurchaseModel.js`**
- Uncommented `paymentMethod` field in schema
- Field type: String
- Enum values: ["instapay", "vodafone cash"]
- Default: null

**`kalima-platform/backend/controllers/ec.cartPurchaseController.js`**
- Uncommented payment method validation
- Added validation to ensure valid payment method is selected for paid orders
- Payment method validation: `['instapay', 'vodafone cash']`
- Error message: "Valid Payment Method is required (instapay or vodafone cash)"

**Note:** Backend watermark upload was already supported via `uploadCartPurchaseFiles` middleware in `uploadFiles.js`. No changes needed to backend upload handling.

### Testing Checklist
- [ ] Teacher can see watermark upload field
- [ ] Non-teacher users cannot see watermark upload field
- [ ] Warning message displays correctly in both languages
- [ ] Watermark file uploads successfully
- [ ] Payment method dropdown shows both options with phone numbers
- [ ] Payment method is required for paid orders
- [ ] Free orders don't require payment method
- [ ] Admin can see payment method column in orders table
- [ ] Admin can view watermark from actions column
- [ ] Payment method displays correctly in order details modal
- [ ] Watermark view button works in order details modal

### User Experience
- Teachers can now upload watermark images for their memos
- Clear warning about potential printing issues
- All users must select payment method (Vodafone Cash or Instapay)
- Phone numbers displayed for each payment method
- Admin can easily see payment method and view watermarks
- Improved order tracking and verification

### Update (Latest Changes)
**Watermark Field Simplified:**
- Changed from Teacher/Lecturer-only to **available for ALL users**
- Changed warning message to friendly helper text: "If you want to upload a watermark feel free to do so."
- File type restricted to PNG/JPG only
- Added automatic cleanup: Watermarks older than 30 days are automatically deleted

**Automatic Cleanup System:**
- Created cleanup script: `backend/scripts/cleanupOldWatermarks.js`
- Script deletes watermark files older than 30 days
- Updates database to remove watermark references
- Can be run manually: `npm run cleanup:watermarks`
- Includes setup instructions for cron jobs (Linux/Mac/Windows)
- PM2 integration support for production environments

**Files Added:**
- `kalima-platform/backend/scripts/cleanupOldWatermarks.js` - Cleanup script
- `kalima-platform/backend/scripts/WATERMARK_CLEANUP_README.md` - Setup instructions

**Files Modified:**
- `kalima-platform/backend/package.json` - Added cleanup script command
- `kalima-platform/frontend/src/pages/KalimaStore/CartPage.jsx` - Watermark now available for all users
- Translation files - Updated helper text

---
