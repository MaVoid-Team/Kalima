/**
 * Seed Test Product for Kalima Store
 * 
 * This script creates a FREE test product to test the purchase notification system
 * 
 * Usage:
 *   node scripts/seed-test-product.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ECProduct = require("../models/ec.productModel");
const ECSection = require("../models/ec.sectionModel");
const ECSubSection = require("../models/ec.subSectionModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

async function seedTestProduct() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Find or create admin user
    console.log("👤 Step 1: Finding admin user...");
    let adminUser = await User.findOne({ role: "Admin" });
    
    if (!adminUser) {
      console.log("⚠️  No Admin user found. Looking for any user with admin privileges...");
      adminUser = await User.findOne({ role: { $in: ["Admin", "SubAdmin"] } });
    }

    if (!adminUser) {
      console.error("❌ No admin user found! Please create an admin user first.");
      console.log("   You can create one through your admin registration flow.");
      process.exit(1);
    }

    console.log(`✅ Using admin: ${adminUser.name} (${adminUser.email})\n`);

    // Step 2: Find or create Test Section
    console.log("📦 Step 2: Finding or creating Test Section...");
    let testSection = await ECSection.findOne({ name: "Test Products" });

    if (!testSection) {
      console.log("   Creating new Test Section...");
      
      // Create a simple test thumbnail (you can replace this with a real image path)
      const thumbnailPath = "uploads/test-section-thumbnail.png";
      
      testSection = await ECSection.create({
        name: "Test Products",
        number: 999, // High number to avoid conflicts
        thumbnail: thumbnailPath,
        description: "Test products for notification testing - FREE",
        allowedFor: ["Student", "Parent", "Teacher"],
      });
      console.log("✅ Test Section created");
    } else {
      console.log("✅ Test Section already exists");
    }
    console.log(`   Section ID: ${testSection._id}\n`);

    // Step 3: Find or create Test SubSection
    console.log("📂 Step 3: Finding or creating Test SubSection...");
    let testSubSection = await ECSubSection.findOne({ 
      name: "Free Test Items",
      section: testSection._id 
    });

    if (!testSubSection) {
      console.log("   Creating new Test SubSection...");
      testSubSection = await ECSubSection.create({
        name: "Free Test Items",
        section: testSection._id,
        description: "Free test products for testing notifications",
      });

      // Add subsection to section
      await ECSection.findByIdAndUpdate(testSection._id, {
        $addToSet: { subSections: testSubSection._id }
      });

      console.log("✅ Test SubSection created");
    } else {
      console.log("✅ Test SubSection already exists");
    }
    console.log(`   SubSection ID: ${testSubSection._id}\n`);

    // Step 4: Check if test product already exists
    console.log("🎁 Step 4: Checking for existing test products...");
    const existingProduct = await ECProduct.findOne({ 
      serial: "TEST001",
      section: testSection._id 
    });

    if (existingProduct) {
      console.log("⚠️  Test product already exists!");
      console.log(`   Product: ${existingProduct.title}`);
      console.log(`   Price: ${existingProduct.priceAfterDiscount} EGP`);
      console.log(`   ID: ${existingProduct._id}\n`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Do you want to create another test product? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log("\n✅ Using existing test product. You can proceed with testing!\n");
        await displayProductInfo(existingProduct);
        process.exit(0);
      }
      console.log("\n");
    }

    // Step 5: Create the FREE test product
    console.log("🆕 Step 5: Creating FREE test product...");
    
    // Create a dummy thumbnail (you can replace with actual image)
    const thumbnailPath = "uploads/product_thumbnails/test-product.png";
    
    // Ensure the directory exists
    const thumbnailDir = path.dirname(thumbnailPath);
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
      console.log(`   Created directory: ${thumbnailDir}`);
    }

    // Create a simple placeholder image if it doesn't exist
    if (!fs.existsSync(thumbnailPath)) {
      console.log("   Creating placeholder thumbnail...");
      // Just create an empty file as placeholder (you should replace with actual image)
      fs.writeFileSync(thumbnailPath, "");
    }

    const testProductData = {
      title: "🎁 FREE Test Product - Notification Testing",
      serial: `TEST${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      thumbnail: thumbnailPath,
      section: testSection._id,
      subSection: testSubSection._id,
      price: 0, // FREE!
      priceAfterDiscount: 0, // FREE!
      description: "This is a FREE test product for testing the real-time notification system. Purchase this to see instant notifications sent to all Admins and SubAdmins!",
      whatsAppNumber: "+201234567890", // Placeholder
      paymentNumber: "0000000000", // Placeholder for free product
      createdBy: adminUser._id,
    };

    const testProduct = await ECProduct.create(testProductData);

    console.log("✅ Test product created successfully!\n");
    await displayProductInfo(testProduct);

    // Summary
    console.log("=" .repeat(70));
    console.log("🎉 SUCCESS! TEST PRODUCT IS READY");
    console.log("=" .repeat(70));
    console.log("\n📋 TESTING INSTRUCTIONS:");
    console.log("1. Login as Admin or SubAdmin in one browser tab");
    console.log("2. Login as Student or Parent in another tab");
    console.log("3. Go to Kalima Store and find the test product");
    console.log("4. Purchase the FREE test product (upload any payment screenshot)");
    console.log("5. Check the Admin's notification center for instant notification! 🔔");
    console.log("\n💡 TIP: The product is FREE (0 EGP) so you won't need to make a real payment!");
    console.log("\n🗑️  To remove test products later, run:");
    console.log("   node scripts/cleanup-test-products.js\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

async function displayProductInfo(product) {
  const populatedProduct = await ECProduct.findById(product._id)
    .populate('section', 'name number')
    .populate('subSection', 'name')
    .populate('createdBy', 'name email');

  console.log("=" .repeat(70));
  console.log("📦 TEST PRODUCT DETAILS");
  console.log("=" .repeat(70));
  console.log(`🎁 Title:        ${populatedProduct.title}`);
  console.log(`🔢 Serial:       ${populatedProduct.serial}`);
  console.log(`💰 Price:        ${populatedProduct.price} EGP → ${populatedProduct.priceAfterDiscount} EGP`);
  console.log(`📂 Section:      ${populatedProduct.section?.name || 'N/A'}`);
  console.log(`📁 SubSection:   ${populatedProduct.subSection?.name || 'N/A'}`);
  console.log(`👤 Created By:   ${populatedProduct.createdBy?.name || 'N/A'}`);
  console.log(`📝 Description:  ${populatedProduct.description}`);
  console.log(`🆔 Product ID:   ${populatedProduct._id}`);
  console.log("=" .repeat(70));
  console.log();
}

// Run the seed
seedTestProduct();

