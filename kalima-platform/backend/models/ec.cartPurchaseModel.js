const mongoose = require("mongoose");

const cartPurchaseItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ECProduct",
        required: true
    },
    productType: {
        type: String,
        enum: ["ECProduct", "ECBook"],
        required: true
    },
    priceAtPurchase: {
        type: Number,
        required: true
    },
    // For books
    nameOnBook: String,
    numberOnBook: String,
    seriesName: String,
    // Snapshot of product data
    productSnapshot: {
        title: String,
        thumbnail: String,
        section: mongoose.Schema.Types.Mixed,
        serial: String
    }
});

const cartPurchaseSchema = new mongoose.Schema(
    {
        // User information
        userName: {
            type: String,
            required: [true, "User name is required"],
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Created by user is required"],
        },

        // Items in the purchase
        items: [cartPurchaseItemSchema],

        // Payment information
        numberTransferredFrom: {
            type: String,
            required: [true, "Transfer number is required"],
            trim: true,
        },
        paymentNumber: {
            type: String,
            required: [true, "Payment Number is required"],
            trim: true,
        },
        paymentScreenShot: {
            type: String,
            required: [true, "Payment screenshot is required"],
            trim: true,
        },

        // Purchase serial number ("CP-timestamp-userid")
        purchaseSerial: {
            type: String,
            required: [true, "Purchase serial is required"],
            unique: true,
            trim: true,
        },

        // Status
        confirmed: {
            type: Boolean,
            default: false,
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Notes
        notes: {
            type: String,
            trim: true,
            default: null,
        },
        adminNotes: {
            type: String,
            trim: true,
            default: null,
        },
        adminNoteBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Pricing
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal cannot be negative"],
        },
        couponCode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ECCoupon",
            default: null,
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"],
        },
        total: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"],
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for common queries
cartPurchaseSchema.index({ createdBy: 1 });
cartPurchaseSchema.index({ confirmed: 1 });
cartPurchaseSchema.index({ purchaseSerial: 1 });
cartPurchaseSchema.index({ createdAt: -1 });

// Virtual to get formatted creation date
cartPurchaseSchema.virtual("formattedCreatedAt").get(function () {
    return this.createdAt ? this.createdAt.toLocaleDateString() : null;
});

// Method to generate purchase serial
cartPurchaseSchema.pre('save', function (next) {
    if (!this.purchaseSerial) {
        const timestamp = Math.floor(Date.now() / 1000);
        this.purchaseSerial = `CP-${timestamp}-${this.createdBy}`;
    }
    next();
});

const ECCartPurchase = mongoose.model("ECCartPurchase", cartPurchaseSchema);
module.exports = ECCartPurchase;