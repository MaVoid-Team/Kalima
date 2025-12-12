const fs = require('fs');
const path = require('path');
const ECCartPurchase = require('../models/ec.cartPurchaseModel');
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Cleanup script to delete watermark images older than 30 days
 * This script should be run as a cron job (e.g., daily at midnight)
 */

const WATERMARKS_DIR = path.join(__dirname, '../uploads/watermarks');
const DAYS_TO_KEEP = 30;

async function cleanupOldWatermarks() {
  try {
    console.log('Starting watermark cleanup...');
    
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database');

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`);

    // Find purchases with watermarks older than 30 days
    const oldPurchases = await ECCartPurchase.find({
      watermark: { $exists: true, $ne: null },
      createdAt: { $lt: cutoffDate }
    });

    console.log(`Found ${oldPurchases.length} purchases with old watermarks`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const purchase of oldPurchases) {
      try {
        // Get the watermark file path
        const watermarkPath = path.join(__dirname, '..', purchase.watermark);
        
        // Check if file exists
        if (fs.existsSync(watermarkPath)) {
          // Delete the file
          fs.unlinkSync(watermarkPath);
          console.log(`Deleted watermark: ${watermarkPath}`);
          deletedCount++;
        } else {
          console.log(`Watermark file not found: ${watermarkPath}`);
        }

        // Update database to remove watermark reference
        await ECCartPurchase.findByIdAndUpdate(purchase._id, {
          watermark: null
        });

      } catch (error) {
        console.error(`Error deleting watermark for purchase ${purchase._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Cleanup Summary ===');
    console.log(`Total purchases checked: ${oldPurchases.length}`);
    console.log(`Watermarks deleted: ${deletedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Cleanup completed successfully');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupOldWatermarks()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
