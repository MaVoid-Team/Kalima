const AuditLog = require("../models/auditLogModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");

// Get all audit logs with filtering, sorting, and pagination
exports.getAllAuditLogs = catchAsync(async (req, res, next) => {
  // Create a base query
  const query = AuditLog.find();
  
  // Apply query features (filtering, sorting, pagination)
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();
  
  // Execute the query
  const logs = await features.query;
  
  // Send the response
  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: {
      logs
    }
  });
});

// Get audit logs for a specific resource type
exports.getResourceAuditLogs = catchAsync(async (req, res, next) => {
  const { resourceType } = req.params;
  
  // Validate resource type
  const validResourceTypes = ["center", "code", "container", "moderator", "subAdmin", 
                             "assistant", "admin", "lecturer", "package"];
  
  if (!validResourceTypes.includes(resourceType)) {
    return next(new AppError(`Invalid resource type: ${resourceType}`, 400));
  }
  
  // Create a base query filtered by resource type
  const query = AuditLog.find({ "resource.type": resourceType });
  
  // Apply query features
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();
  
  // Execute the query
  const logs = await features.query;
  
  // Send the response
  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: {
      logs
    }
  });
});

// Get audit logs for a specific user
exports.getUserAuditLogs = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  // Create a base query filtered by user ID
  const query = AuditLog.find({ "user.userId": userId });
  
  // Apply query features
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();
  
  // Execute the query
  const logs = await features.query;
  
  // Send the response
  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: {
      logs
    }
  });
});

// Get audit logs for a specific resource ID
exports.getResourceInstanceAuditLogs = catchAsync(async (req, res, next) => {
  const { resourceType, resourceId } = req.params;
  
  // Validate resource type
  const validResourceTypes = ["center", "code", "container", "moderator", "subAdmin", 
                             "assistant", "admin", "lecturer", "package"];
  
  if (!validResourceTypes.includes(resourceType)) {
    return next(new AppError(`Invalid resource type: ${resourceType}`, 400));
  }
  
  // Create a query to find logs for the specific resource
  const query = AuditLog.find({
    "resource.type": resourceType,
    "resource.id": resourceId
  });
  
  // Apply query features
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();
  
  // Execute the query
  const logs = await features.query;
  
  // Send the response
  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: {
      logs
    }
  });
});