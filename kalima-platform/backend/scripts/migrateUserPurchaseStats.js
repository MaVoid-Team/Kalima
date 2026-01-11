const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/userModel');
const ECCartPurchase = require('../models/ec.cartPurchaseModel');

// Connection string from environment
const MONGO_URI = process.env.DATABASE_URI;

if (!MONGO_URI) {
    console.error('Error: DATABASE_URI is not defined in .env file');
    process.exit(1);
}

const migrateUserPurchaseStats = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate`);

        let successCount = 0;
        let errorCount = 0;

        // For each user, calculate their purchase statistics
        for (const user of users) {
            try {
                // Count total purchases
                const numberOfPurchases = await ECCartPurchase.countDocuments({
                    createdBy: user._id
                });

                // Sum total spent amount
                const purchaseData = await ECCartPurchase.aggregate([
                    {
                        $match: {
                            createdBy: user._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: '$total' }
                        }
                    }
                ]);

                const TotalSpentAmount = purchaseData.length > 0 ? purchaseData[0].totalSpent : 0;

                // Update user with calculated values
                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    {
                        numberOfPurchases,
                        TotalSpentAmount
                    },
                    { new: true }
                );

                console.log(`✓ User ${user.name} (${user._id}): numberOfPurchases=${numberOfPurchases}, TotalSpentAmount=${TotalSpentAmount}`);
                successCount++;
            } catch (error) {
                console.error(`✗ Error updating user ${user._id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n=== Migration Complete ===`);
        console.log(`Successfully migrated: ${successCount} users`);
        console.log(`Failed: ${errorCount} users`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
migrateUserPurchaseStats();
