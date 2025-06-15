const mongoose = require("mongoose");

// Import the base ECPurchase schema
const ecPurchaseSchema = new mongoose.Schema(
  {
    // User information
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    // Product information
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    
    // Product reference
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    
    // Pricing
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    
    // Payment transfer information
    numberTransferredFrom: {
      type: String,
      required: [true, "Transfer number is required"],
      trim: true,
    },
    
    // Purchase serial number ("userserial"-"section number"-"product serial")
    purchaseSerial: {
      type: String,
      required: [true, "Purchase serial is required"],
      unique: true,
      trim: true,
    },
    
    // Confirmation status
    confirmed: {
      type: Boolean,
      default: false,
    },
    
    // id of the user do the purchase
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
    
    // User who updated or confirmed this record
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create Extended ECPurchase Schema that inherits from base schema
const extendedECPurchaseSchema = new mongoose.Schema(
  {
    // Inherit all fields from base schema
    ...ecPurchaseSchema.obj,
    
    // Additional fields
    NameOnBook: {
      type: String,
      required: [true, "Name on book is required"],
      trim: true,
    },
    NumberOnBook: {
      type: String,
      required: [true, "Number is required"],
      trim: true,
    },
    SName: {
      type: String,
      required: [true, "S-number is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance (including base indexes)
extendedECPurchaseSchema.index({ purchaseSerial: 1 }, { unique: true });
extendedECPurchaseSchema.index({ productId: 1 });
extendedECPurchaseSchema.index({ confirmed: 1 });
extendedECPurchaseSchema.index({ createdBy: 1 });
extendedECPurchaseSchema.index({ createdAt: -1 });

// Additional indexes for new fields
extendedECPurchaseSchema.index({ NameOnBook: 1 });
extendedECPurchaseSchema.index({ Number: 1 });
extendedECPurchaseSchema.index({ Snumber: 1 });

// Virtual to get formatted creation date
extendedECPurchaseSchema.virtual("formattedCreatedAt").get(function () {
  return this.createdAt ? this.createdAt.toLocaleDateString() : null;
});

module.exports = mongoose.model("ExtendedECPurchase", extendedECPurchaseSchema);