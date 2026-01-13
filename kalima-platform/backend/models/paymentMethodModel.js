const { required } = require("joi");
const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Payment method name is required"],
            trim: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        status: {
            type: Boolean,
            enum: [true, false],
            default: true,
        },
        paymentMethodImg: {
            type: String, // local file path
            trim: true,
            required: [true, "Payment method image is required"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
