const mongoose = require("mongoose");
const Product = require("./ec.productModel");

const bookSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true }
});

const ECBook = Product.discriminator("ECBook", bookSchema);

module.exports = ECBook;
