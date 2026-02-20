const mongoose = require("mongoose");

const mongoUri = process.env.DATABASE_URI || process.env.MONGO_URI;

const mongoClient = mongoUri ? mongoose.createConnection(mongoUri) : null;

module.exports = mongoClient;
