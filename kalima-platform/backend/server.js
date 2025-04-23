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
const auditLogger = require("./middleware/auditLogger");

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
const adminRouter = require("./routes/adminRoutes.js");
const subAdminRouter = require("./routes/subAdminRoutes.js");
const moderatorRouter = require("./routes/moderatorRoutes.js");
const lecturerRouter = require("./routes/lecturerRoutes.js");
const assistantRouter = require("./routes/assistantRoutes.js");
const packegeRouter = require("./routes/packageRoutes.js");
const auditLogRouter = require("./routes/auditLogRoutes.js");
const cLecturerRouter = require("./routes/center.lecturerRoutes.js");
const cStudentRouter = require("./routes/center.studentRoutes.js");
const lessonRouter = require("./routes/lessonRoutes.js");
const attendanceRouter = require("./routes/attendanceRoutes");
const revenueRouter = require("./routes/revenueRoutes");
const pricingRuleRouter = require("./routes/pricingRuleRoutes"); // Import pricing rule router
connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/register", require("./routes/registerRoutes.js"));
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/containers", auditLogger, containerRouter);
app.use("/api/v1/lectures", lectureRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/purchases", purchaseRouter);
app.use("/api/v1/levels", levelRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/student-lecture-access", StudentLectureAccessRouter);
app.use("/api/v1/centers", auditLogger, centerRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/dashboard", adminDashboardRouter);
app.use("/api/v1/codes", auditLogger, codeRouter);
app.use("/api/v1/admins", auditLogger, adminRouter);
app.use("/api/v1/sub-admins", auditLogger, subAdminRouter);
app.use("/api/v1/moderators", auditLogger, moderatorRouter);
app.use("/api/v1/lecturers", auditLogger, lecturerRouter);
app.use("/api/v1/assistants", auditLogger, assistantRouter);
app.use("/api/v1/packages", auditLogger, packegeRouter);
app.use("/api/v1/audit-logs", auditLogRouter);
app.use("/api/v1/center-lecturer", cLecturerRouter);
app.use("/api/v1/center-student", cStudentRouter);
app.use("/api/v1/lessons", lessonRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/revenue", revenueRouter);
app.use("/api/v1/pricing-rules", pricingRuleRouter); // Mount pricing rule router

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
          socket.emit("newLecture", {
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
