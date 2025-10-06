# 🎁 FREE Test Product - Quick Guide

## 🚀 Quick Start (2 Steps)

### Step 1: Create the Test Product
```bash
cd backend
node scripts/seed-test-product.js
```

This will create a **FREE test product** (0 EGP) in your Kalima Store.

### Step 2: Test the Notifications
1. **Login as Admin/SubAdmin** in one browser tab
2. **Login as Student/Parent** in another tab
3. **Purchase the test product** (it's FREE!)
4. **Watch the notification** appear instantly in admin's notification center! 🔔

---

## 📦 What Gets Created

The script creates:
- ✅ **Test Section**: "Test Products" (Section #999)
- ✅ **Test SubSection**: "Free Test Items"
- ✅ **Test Product**: "🎁 FREE Test Product - Notification Testing"
  - Price: **0 EGP** (completely free!)
  - Serial: TEST001 (or random)
  - Can be purchased multiple times

---

## 🧪 Testing the Notification System

### Setup (One-time)
```bash
# 1. Make sure notification template is seeded
npm start  # Template auto-seeds on startup

# 2. Create test product
node scripts/seed-test-product.js
```

### Test Purchase Flow
```
┌─────────────────────────────────────────────────────────┐
│ 1. Admin Browser Tab                                    │
│    - Login as Admin/SubAdmin                            │
│    - Open notification center (bell icon)               │
│    - Keep tab visible                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Student Browser Tab                                  │
│    - Login as Student/Parent                            │
│    - Go to Kalima Store                                 │
│    - Find "🎁 FREE Test Product"                        │
│    - Click "Purchase"                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Complete Purchase                                    │
│    - Upload any image as payment screenshot             │
│    - Enter any phone number                             │
│    - Submit purchase                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Watch Admin Tab                                      │
│    - Notification appears INSTANTLY! 🔔                 │
│    - Shows buyer name, product, price, time             │
│    - Browser notification (if enabled)                  │
│    - Unread count increases                             │
└─────────────────────────────────────────────────────────┘
```

### Expected Notification Message
```
"Ahmed Mohamed purchased 🎁 FREE Test Product - Notification Testing 
for 0 EGP at Dec 1, 2024, 03:45 PM"
```

---

## 🔍 Verification Checklist

- [ ] Test product appears in Kalima Store
- [ ] Product shows as FREE (0 EGP)
- [ ] Can add to cart and proceed to checkout
- [ ] Purchase completes successfully
- [ ] Admin receives notification INSTANTLY
- [ ] Notification shows in notification center
- [ ] Browser notification appears (if permission granted)
- [ ] Notification includes all details (buyer, product, price, time)
- [ ] Can purchase multiple times

---

## 🛠️ Script Commands

### Create Test Product
```bash
node scripts/seed-test-product.js
```

**Output:**
```
✅ Connected to MongoDB
✅ Using admin: Admin User (admin@kalima.com)
✅ Test Section created
✅ Test SubSection created
✅ Test product created successfully!

📦 TEST PRODUCT DETAILS
🎁 Title:        🎁 FREE Test Product - Notification Testing
🔢 Serial:       TEST042
💰 Price:        0 EGP → 0 EGP
📂 Section:      Test Products
📁 SubSection:   Free Test Items
```

### Remove Test Products
```bash
node scripts/cleanup-test-products.js
```

**What it removes:**
- All test products
- Test section
- Test subsections
- Test product purchases

---

## 💡 Tips & Tricks

### 1. Multiple Test Purchases
The test product can be purchased multiple times. Each purchase will trigger a new notification.

### 2. Test Offline Admins
1. Make admin go offline (close browser/disconnect)
2. Make a purchase as student
3. Admin comes back online
4. Should receive pending notification!

### 3. Test Browser Notifications
```javascript
// Enable browser notifications first
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});
```

### 4. Check Backend Logs
Watch backend console for:
```
Found 2 admin/subadmin users to notify
Created notification for Admin John Doe, online: true
Sent real-time notification to Admin John Doe
Store purchase notifications created for 2 admins/subadmins
```

### 5. Verify in Database
```javascript
// In MongoDB shell or Compass
db.notifications.find({type: "store_purchase"}).sort({createdAt: -1}).limit(5)
```

---

## 🐛 Troubleshooting

### Product Not Appearing in Store?

**Check:**
1. Section created? `db.ecsections.findOne({name: "Test Products"})`
2. Product created? `db.ecproducts.findOne({serial: /TEST/})`
3. SubSection linked? Check product has `subSection` field

**Fix:**
```bash
# Re-run seed script
node scripts/seed-test-product.js
```

### Can't Purchase Test Product?

**Common Issues:**
1. User doesn't have `userSerial` - Register properly as student
2. Missing payment screenshot - Upload any image
3. Payment number required - Enter any number

### No Notification Received?

**Debug Steps:**
```bash
# 1. Check template exists
node scripts/test-store-notifications.js

# 2. Check Socket.io connection (browser console)
import { getSocket } from './utils/socket';
console.log('Connected:', getSocket()?.connected);

# 3. Check admin role
# In MongoDB: db.users.findOne({email: "admin@email.com"})

# 4. Check backend logs
# Look for: "Found X admin/subadmin users to notify"
```

### Payment Screenshot Upload Fails?

**Workaround:**
- Use a small PNG/JPEG image (< 5MB)
- Make sure `uploads/` directory exists
- Check file permissions

---

## 📊 Test Scenarios

### Scenario 1: Basic Notification Test
```
✅ Admin online → Student purchases → Instant notification
```

### Scenario 2: Offline Admin Test
```
✅ Admin offline → Student purchases → Admin comes online → Receives pending notification
```

### Scenario 3: Multiple Admins Test
```
✅ Multiple admins online → Student purchases → All admins receive notification
```

### Scenario 4: Browser Notification Test
```
✅ Admin enables browser notifications → Student purchases → Desktop alert appears
```

### Scenario 5: Metadata Test
```
✅ Make purchase → Check notification → Verify all metadata (buyer, product, price, time)
```

---

## 🧹 Cleanup After Testing

### Remove Only Test Products
```bash
node scripts/cleanup-test-products.js
```

### Remove Test Notifications
```javascript
// In MongoDB shell
db.notifications.deleteMany({type: "store_purchase"})
```

### Keep for Future Testing
You can keep the test product indefinitely for future testing. It won't interfere with real products since it's in a separate "Test Products" section.

---

## 📈 Performance Testing

### Test High Volume
```bash
# Create multiple test products
for i in {1..5}; do 
  node scripts/seed-test-product.js
done
```

### Test Concurrent Purchases
- Open multiple student tabs
- Purchase simultaneously
- Check if all notifications are delivered

---

## 🎯 Best Practices

1. **Keep test data separate** - Test products are in dedicated section
2. **Clean up regularly** - Remove old test purchases to keep DB clean
3. **Use realistic data** - Test with actual student/admin accounts
4. **Test edge cases** - Offline admins, network issues, etc.
5. **Monitor logs** - Watch backend console for errors

---

## ✨ What's Next?

After successful testing:
1. ✅ System is production-ready
2. ✅ Create real products in actual sections
3. ✅ Monitor real purchase notifications
4. ✅ Optionally remove test products

---

## 📞 Quick Reference

### Create Test Product
```bash
node scripts/seed-test-product.js
```

### Test Notifications
```bash
node scripts/test-store-notifications.js
```

### Cleanup
```bash
node scripts/cleanup-test-products.js
```

### Check Logs
```bash
# Backend
tail -f backend.log

# MongoDB
db.notifications.find({type: "store_purchase"}).pretty()
```

---

**Happy Testing! 🎉**

If everything works, you'll see instant notifications when purchases happen!

