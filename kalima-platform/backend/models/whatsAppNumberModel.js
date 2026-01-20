const mongoose = require("mongoose");
const whatsAppNumberSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true },
);

module.exports = mongoose.model("WhatsAppNumber", whatsAppNumberSchema);
