/**
 * Bell notification utility for alerting admins/subadmins/moderators
 * Emits a sound notification via Socket.io to specific user roles
 */

const User = require("../models/userModel");

/**
 * Emit a bell sound notification to all admin, subadmin, and moderator users
 * @param {Object} io - Socket.io instance
 * @param {Object} purchaseData - Purchase details to include in notification
 */
async function emitBellNotification(io, purchaseData) {
    try {
        // Find all users with admin, subadmin, or moderator roles
        const adminUsers = await User.find({
            role: { $in: ["Admin", "SubAdmin", "Moderator"] },
        }).select("_id");

        if (!adminUsers || adminUsers.length === 0) {
            console.log("[BELL NOTIFICATION] No admin users found to notify");
            return;
        }

        // Emit bell sound event to each admin user
        adminUsers.forEach((admin) => {
            // Emit to the user's room (userId is used as room name)
            io.to(admin._id.toString()).emit("bellAlert", {
                type: "new_purchase",
                timestamp: new Date(),
                purchaseData: {
                    purchaseId: purchaseData.purchaseId,
                    purchaseSerial: purchaseData.purchaseSerial,
                    customerName: purchaseData.customerName,
                    customerEmail: purchaseData.customerEmail,
                    total: purchaseData.total,
                    itemCount: purchaseData.itemCount,
                },
            });
        });

        console.log(
            `[BELL NOTIFICATION] Bell sound emitted to ${adminUsers.length} admin users for purchase ${purchaseData.purchaseSerial}`,
        );
    } catch (error) {
        console.error("[BELL NOTIFICATION] Error emitting bell notification:", error);
        // Don't throw error to avoid breaking purchase process
    }
}

module.exports = {
    emitBellNotification,
};
