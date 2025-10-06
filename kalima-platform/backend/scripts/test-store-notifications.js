/**
 * Test Script for Store Purchase Notifications
 * 
 * This script helps verify that the store purchase notification system is working correctly.
 * 
 * Usage:
 *   node scripts/test-store-notifications.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const NotificationTemplate = require("../models/notificationTemplateModel");
const Notification = require("../models/notification");
const User = require("../models/userModel");

async function testStoreNotifications() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("✅ Connected to MongoDB\n");

    // Test 1: Check if notification template exists
    console.log("📋 Test 1: Checking notification template...");
    const template = await NotificationTemplate.findOne({
      type: "store_purchase",
    });

    if (template) {
      console.log("✅ Store purchase template found:");
      console.log(`   Title: ${template.title}`);
      console.log(`   Message: ${template.message}\n`);
    } else {
      console.log("❌ Store purchase template NOT found!");
      console.log("   Run: npm run seed to create notification templates\n");
      process.exit(1);
    }

    // Test 2: Check for admin users
    console.log("👥 Test 2: Checking for Admin/SubAdmin users...");
    const adminUsers = await User.find({
      role: { $in: ["Admin", "SubAdmin"] },
    }).select("name email role");

    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} admin/subadmin user(s):`);
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.role}) - ${admin.email}`);
      });
      console.log();
    } else {
      console.log("⚠️  No Admin or SubAdmin users found!");
      console.log("   Create at least one admin user to receive notifications\n");
    }

    // Test 3: Check recent store purchase notifications
    console.log("🔔 Test 3: Checking recent store purchase notifications...");
    const recentNotifications = await Notification.find({
      type: "store_purchase",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email role");

    if (recentNotifications.length > 0) {
      console.log(`✅ Found ${recentNotifications.length} recent notification(s):`);
      recentNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. To: ${notif.userId?.name || "Unknown"} (${notif.userId?.role || "Unknown"})`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      Sent: ${notif.isSent ? "Yes" : "No (Pending)"}`);
        console.log(`      Read: ${notif.read ? "Yes" : "No"}`);
        console.log(`      Created: ${notif.createdAt.toLocaleString()}`);
        
        if (notif.metadata) {
          console.log(`      Buyer: ${notif.metadata.buyerName || "N/A"}`);
          console.log(`      Product: ${notif.metadata.productName || "N/A"}`);
          console.log(`      Price: ${notif.metadata.finalPrice || "N/A"} EGP`);
        }
        console.log();
      });
    } else {
      console.log("ℹ️  No store purchase notifications found yet.");
      console.log("   Make a test purchase to verify the system is working\n");
    }

    // Test 4: Create a sample notification (dry run)
    console.log("🧪 Test 4: Simulating notification creation...");
    const sampleMessage = template.message
      .replace("{buyer}", "John Doe")
      .replace("{product}", "Sample Product")
      .replace("{price}", "150")
      .replace("{time}", new Date().toLocaleString());

    console.log("✅ Sample notification would be:");
    console.log(`   Title: ${template.title}`);
    console.log(`   Message: ${sampleMessage}`);
    console.log();

    // Summary
    console.log("=" .repeat(60));
    console.log("📊 SUMMARY");
    console.log("=" .repeat(60));
    console.log(`✅ Template exists: ${template ? "Yes" : "No"}`);
    console.log(`✅ Admin users: ${adminUsers.length}`);
    console.log(`✅ Recent notifications: ${recentNotifications.length}`);
    console.log("=" .repeat(60));
    console.log();

    if (template && adminUsers.length > 0) {
      console.log("🎉 Store notification system is ready!");
      console.log("   Make a purchase to test real-time notifications.");
    } else {
      console.log("⚠️  Please complete setup:");
      if (!template) console.log("   - Run seed script to create templates");
      if (adminUsers.length === 0) console.log("   - Create admin users");
    }
    console.log();

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the test
testStoreNotifications();

