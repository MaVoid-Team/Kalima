const mongoose = require("mongoose");
const User = require("./userModel");


const moderatorSchema = new mongoose.Schema({
    monthlyConfirmedCount: { type: Number, default: 0 },
    lastConfirmedCountUpdate: { type: Date }
}, {
    timestamps: true,
}
);

const Moderator = User.discriminator("Moderator", moderatorSchema);

module.exports = Moderator;