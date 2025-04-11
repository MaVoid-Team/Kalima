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
const centerRouter = require("./routes/centerRoutes");
const messageRouter = require("./routes/messageRoutes");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Notification = require("./models/notification");
const adminDashboardRouter = require("./routes/adminDashboardRoutes.js");
const codeRouter = require("./routes/codeRoutes");

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
app.use("/api/v1/centers", centerRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/dashboard", adminDashboardRouter);
app.use("/api/v1/codes", codeRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB.");

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: corsOptions, // Use the same CORS options
  });

  // Track connected users
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    // Handle subscription to notifications
    socket.on("subscribe", async (userId) => {
      // Add user to connected users map
      connectedUsers.set(socket.id, userId);
      socket.join(userId);

      const pendingNotifications = await Notification.find({
        userId,
        isSent: false,
      })
        .sort({ createdAt: 1 })
        .limit(20);

      if (pendingNotifications.length > 0) {
        pendingNotifications.forEach(async (notification) => {
          socket.emit("notification", {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            subjectId: notification.relatedId,
            notificationId: notification._id,
          });

          await Notification.findByIdAndUpdate(notification._id, {
            isSent: true,
          });
        });
      }
    });

    socket.on("disconnect", () => {
      // Remove from connected users map
      connectedUsers.delete(socket.id);
      console.log("Client disconnected:", socket.id);
    });
  });

  // Make io accessible in routes
  app.set("io", io);

  httpServer.listen(PORT, () => {
    console.log(`Server active and listening on port ${PORT}.`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

app.use(errorHandler);
