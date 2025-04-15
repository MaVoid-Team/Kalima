// Import necessary modules
const express = require("express");
const app = express();
const auditLogger = require("./middleware/auditLogger");

// Import routers
const userRouter = require("./routes/userRoutes");
const levelRouter = require("./routes/levelRoutes");
const subjectRouter = require("./routes/subjectRoutes");
const containerRouter = require("./routes/containerRoutes");
const lectureRouter = require("./routes/lectureRoutes");
const codeRouter = require("./routes/codeRoutes");
const purchaseRouter = require("./routes/purchaseRoutes");
const centerRouter = require("./routes/centerRoutes");
const packageRouter = require("./routes/packageRoutes");
const adminDashboardRouter = require("./routes/adminDashboardRoutes");
const studentLectureAccessRouter = require("./routes/studentLectureAccessRoutes");
const attachmentRouter = require("./routes/attachmentRoutes");
const auditLogRouter = require("./routes/auditLogRoutes");
const attendanceRouter = require("./routes/attendanceRoutes");
const revenueRouter = require("./routes/revenueRoutes");
const pricingRuleRouter = require("./routes/pricingRuleRoutes"); // Import pricing rule router

// Apply audit logger middleware globally or selectively
app.use(auditLogger);

// Mount Routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/levels", levelRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/containers", containerRouter);
app.use("/api/v1/lectures", lectureRouter);
app.use("/api/v1/codes", codeRouter);
app.use("/api/v1/purchases", purchaseRouter);
app.use("/api/v1/centers", centerRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/dashboard", adminDashboardRouter);
app.use("/api/v1/lecture-access", studentLectureAccessRouter);
app.use("/api/v1/attachments", attachmentRouter);
app.use("/api/v1/auditlogs", auditLogRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/revenue", revenueRouter);
app.use("/api/v1/pricing-rules", pricingRuleRouter); // Mount pricing rule router

module.exports = app;