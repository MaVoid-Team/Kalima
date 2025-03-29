const mongoose = require("mongoose");
const Container = require("./containerModel");

const lectureSchema = new mongoose.Schema({
  videoLink: { type: String, required: true },
  description: { type: String },
  numberOfViews: { type: Number, default: 3 },

  //we can add meterials and quizzes later
});
module.exports = Container.discriminator("Lecture", lectureSchema);
