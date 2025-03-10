require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3200;
const cors = require("cors");
const connectDB = require("./config/dbConn.js");
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions.js");
const cookieParser = require("cookie-parser");

connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/register", require("./routes/registerRoutes.js"));
app.use("/auth", require("./routes/authRoutes.js"));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB.");
  app.listen(PORT, () => {
    console.log(`Server active and listening on port ${PORT}.`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
