# Environment Variable Fix for Duplicate /api/v1 Issue

## Problem
API calls are failing with duplicate `/api/v1` in the URL:
```
Cannot PATCH /api/v1/api/v1/ec/cart-purchases/{id}/return
```

## Root Cause
The `BACKEND_URL` or `VITE_API_URL` environment variable includes `/api/v1` when it should only be the base URL.

## Solution Implemented ✅

### Code-Level Fix (Recommended)
We've implemented a robust solution that automatically handles this issue regardless of how the environment variable is set:

**New File:** `kalima-platform/frontend/src/utils/apiConfig.js`
- Automatically strips `/api/v1` from the end of `VITE_API_URL` if present
- Prevents duplicate paths in API calls
- Works with both correct and incorrect environment variable configurations

**Updated Files:**
- `kalima-platform/frontend/src/routes/orders.jsx` - Now imports API_URL from apiConfig
- `kalima-platform/frontend/src/routes/cart.js` - Now imports API_URL from apiConfig

This fix ensures that even if `VITE_API_URL` is set to `http://backend:5000/api/v1`, it will be normalized to `http://backend:5000` before constructing API endpoints.

### Environment Variable Fix (Still Recommended)

While the code now handles this automatically, it's still best practice to set the environment variable correctly:

**❌ INCORRECT:**
```bash
VITE_API_URL=http://backend:5000/api/v1
BACKEND_URL=http://backend:5000/api/v1
VITE_API_URL=https://kalima.mavoid.com/api/v1
```

**✅ CORRECT:**
```bash
VITE_API_URL=http://backend:5000
BACKEND_URL=http://backend:5000
VITE_API_URL=https://kalima.mavoid.com
```

### For Local Development

In `kalima-platform/frontend/.env`:
```bash
VITE_API_URL=http://localhost:3000
```

**Do NOT include `/api/v1` in the URL** - the frontend code already appends it.

## How It Works

The new `apiConfig.js` utility:
```javascript
export const getApiUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || ''
  // Remove /api/v1 or /api/v1/ from the end if present
  return rawApiUrl.replace(/\/api\/v1\/?$/, '')
}
```

This regex pattern removes:
- `/api/v1` at the end
- `/api/v1/` at the end (with trailing slash)

So whether you set:
- `VITE_API_URL=http://backend:5000` → Returns: `http://backend:5000`
- `VITE_API_URL=http://backend:5000/api/v1` → Returns: `http://backend:5000`
- `VITE_API_URL=http://backend:5000/api/v1/` → Returns: `http://backend:5000`

All result in the correct base URL!

## Why This Happens

The frontend code constructs URLs like this:
```javascript
`${API_URL}/api/v1/ec/cart-purchases/${purchaseId}/return`
```

If `API_URL` already contains `/api/v1`, you get:
```
http://backend:5000/api/v1 + /api/v1/ec/cart-purchases/... = /api/v1/api/v1/ec/cart-purchases/...
```

## Files to Check

1. **Docker Compose:** `docker-compose.yml`
   - Check the `BACKEND_URL` environment variable
   
2. **Production .env:** Root level or deployment configuration
   - Ensure `BACKEND_URL` doesn't include `/api/v1`

3. **Frontend .env:** `kalima-platform/frontend/.env`
   - Should be: `VITE_API_URL=http://localhost:3000` (for local dev)

## Verification

After the fix, test the return endpoint:
```bash
curl -X PATCH http://your-domain/api/v1/ec/cart-purchases/{id}/return \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The URL should be `/api/v1/ec/cart-purchases/{id}/return` (single `/api/v1`).

## Migration Guide for Other Route Files

If you want to update other route files to use the new utility (optional but recommended):

**Before:**
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

**After:**
```javascript
import { API_URL } from "../utils/apiConfig"
```

This ensures consistent behavior across all API calls.
