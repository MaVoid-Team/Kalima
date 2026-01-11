require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const ECCartPurchase = require('../models/ec.cartPurchaseModel');
const { DateTime } = require('luxon');

const getCurrentEgyptTime = () => {
    return DateTime.now().setZone('Africa/Cairo');
};

async function backfillMonthlyCount() {
    try {
        if (!process.env.DATABASE_URI) {
            throw new Error('DATABASE_URI environment variable is not set');
        }
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to database');

        const now = getCurrentEgyptTime();
        const monthStart = now.startOf('month').toJSDate();
        const monthEnd = now.endOf('month').toJSDate();

        // Get users with staff roles only (Admin, SubAdmin, Moderator)
        const staffRoles = ['Admin', 'SubAdmin', 'Moderator'];
        const users = await User.find({ role: { $in: staffRoles } });
        console.log(`Found ${users.length} staff users to update (roles: ${staffRoles.join(', ')})`);

        for (const user of users) {
            // Count confirmed purchases for current month
            const count = await ECCartPurchase.countDocuments({
                confirmedBy: user._id,
                status: 'confirmed',
                confirmedAt: {
                    $gte: monthStart,
                    $lte: monthEnd
                }
            });

            // Update user
            await User.findByIdAndUpdate(user._id, {
                monthlyConfirmedCount: count,
                lastConfirmedCountUpdate: new Date()
            });

            console.log(`✓ Updated ${user.name || user.email} (${user.role}): ${count} confirmed purchases`);
        }

        console.log('Backfill completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Backfill failed:', err);
        process.exit(1);
    }
}

backfillMonthlyCount();