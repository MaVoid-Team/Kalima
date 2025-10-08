/**
 * Cleanup Test Products
 * 
 * This script removes all test products, sections, and subsections
 * 
 * Usage:
 *   node scripts/cleanup-test-products.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ECProduct = require("../models/ec.productModel");
const ECSection = require("../models/ec.sectionModel");
const ECSubSection = require("../models/ec.subSectionModel");
const ECPurchase = require("../models/ec.purchaseModel");

async function cleanupTestData() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("🗑️  Starting cleanup of test data...\n");

    // Find test section
    const testSection = await ECSection.findOne({ name: "Test Products" });

    if (!testSection) {
      console.log("ℹ️  No test section found. Nothing to clean up.");
      process.exit(0);
    }

    console.log(`📦 Found test section: ${testSection.name} (ID: ${testSection._id})`);

    // Count test products
    const testProducts = await ECProduct.find({ section: testSection._id });
    console.log(`   Found ${testProducts.length} test product(s)\n`);

    if (testProducts.length > 0) {
      console.log("📋 Test Products:");
      testProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} (${product.serial})`);
      });
      console.log();
    }

    // Check for purchases of test products
    const testProductIds = testProducts.map(p => p._id);
    const testPurchases = await ECPurchase.find({ 
      productId: { $in: testProductIds } 
    });

    if (testPurchases.length > 0) {
      console.log(`⚠️  Found ${testPurchases.length} purchase(s) of test products`);
      console.log("   These will also be deleted.\n");
    }

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('⚠️  Are you sure you want to delete all test data? (yes/no): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log("\n❌ Cleanup cancelled.");
      process.exit(0);
    }

    console.log("\n🗑️  Deleting test data...\n");

    // Delete purchases
    if (testPurchases.length > 0) {
      await ECPurchase.deleteMany({ productId: { $in: testProductIds } });
      console.log(`✅ Deleted ${testPurchases.length} test purchase(s)`);
    }

    // Delete products
    if (testProducts.length > 0) {
      await ECProduct.deleteMany({ section: testSection._id });
      console.log(`✅ Deleted ${testProducts.length} test product(s)`);
    }

    // Delete subsections
    const testSubSections = await ECSubSection.find({ section: testSection._id });
    if (testSubSections.length > 0) {
      await ECSubSection.deleteMany({ section: testSection._id });
      console.log(`✅ Deleted ${testSubSections.length} test subsection(s)`);
    }

    // Delete section
    await ECSection.findByIdAndDelete(testSection._id);
    console.log(`✅ Deleted test section`);

    console.log("\n" + "=" .repeat(70));
    console.log("🎉 CLEANUP COMPLETE!");
    console.log("=" .repeat(70));
    console.log("All test products and related data have been removed.\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run cleanup
cleanupTestData();

