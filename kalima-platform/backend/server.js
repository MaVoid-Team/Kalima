require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3200;
const cors = require("cors");
const connectDB = require("./config/dbConn.js");
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions.js");
const cookieParser = require("cookie-parser");

const containerRouter = require("./routes/containerRoutes");
const lectureRouter = require("./routes/lectureRoutes");
const userRouter = require("./routes/userRoutes");
const purchaseRouter = require("./routes/purchaseRoutes");
const errorHandler = require("./controllers/errorController.js");
const subjectRouter = require("./routes/subjectRoutes.js");
const levelRouter = require("./routes/levelRoutes.js");
const StudentLectureAccessRouter = require("./routes/studentLectureAccessRoutes.js");

connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/register", require("./routes/registerRoutes.js"));
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/containers", containerRouter);
app.use("/api/v1/lectures", lectureRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/purchases", purchaseRouter);
app.use("/api/v1/levels", levelRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/student-lecture-access", StudentLectureAccessRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB.");
  app.listen(PORT, () => {
    console.log(`Server active and listening on port ${PORT}.`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

app.use(errorHandler);
