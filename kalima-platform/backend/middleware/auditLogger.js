const AuditLog = require("../models/auditLogModel");

// Creating the audit log function without catchAsync
const createAuditLogEntry = async (req, res, originalRes) => {
  // Skip audit logging if no user information
  if (!req.user) return;

  // Determine action based on HTTP method
  const methodToAction = {
    GET: "read",
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete"
  };
  
  // Extract resource type from URL path
  const pathSegments = req.originalUrl.split("/");
  let resourceType = "";
  
  // Determine resource type using a more readable approach
  const resourceIdentifiers = [
    { keywords: ["center", "centers"], type: "center" },
    { keywords: ["code", "codes"], type: "code" },
    { keywords: ["container", "containers"], type: "container" },
    { keywords: ["moderator", "moderators"], type: "moderator" },
    { keywords: ["subadmin", "subadmins"], type: "subAdmin" },
    { keywords: ["assistant", "assistants"], type: "assistant" },
    { keywords: ["admin", "admins"], type: "admin" },
    { keywords: ["lecturer", "lecturers"], type: "lecturer" },
    { keywords: ["package", "packages"], type: "package" }
  ];
  
  // Find matching resource type
  for (const resource of resourceIdentifiers) {
    if (resource.keywords.some(keyword => pathSegments.includes(keyword))) {
      resourceType = resource.type;
      break;
    }
  }
  
  // Skip logging if resource type not recognized
  if (!resourceType) return;
  
  // Extract resource ID from URL params
  let resourceId = null;
  let resourceName = null;
  
  // Use switch case for param ID extraction
  switch (true) {
    case !!req.params.id:
      resourceId = req.params.id;
      break;
    case !!req.params.containerId:
      resourceId = req.params.containerId;
      break;
    case !!req.params.centerId:
      resourceId = req.params.centerId;
      break;
    case !!req.params.lessonId:
      resourceId = req.params.lessonId;
      break;
  }
  
  // Extract resource details from response if available
  const resData = originalRes?._body?.data;
  if (resData) {
    // Use switch case for resource data extraction
    switch (true) {
      case !!resData.center:
        resourceId = resourceId || resData.center._id;
        resourceName = resData.center.name;
        break;
      case !!(resData.codes && resData.codes.length > 0):
        resourceName = `${resData.codes.length} codes`;
        break;
      case !!resData.container:
        resourceId = resourceId || resData.container._id;
        resourceName = resData.container.name;
        break;
      case !!resData.moderator:
        resourceId = resourceId || resData.moderator._id;
        resourceName = resData.moderator.name;
        break;
      case !!resData.subAdmin:
        resourceId = resourceId || resData.subAdmin._id;
        resourceName = resData.subAdmin.name;
        break;
      case !!resData.assistant:
        resourceId = resourceId || resData.assistant._id;
        resourceName = resData.assistant.name;
        break;
      case !!resData.admin:
        resourceId = resourceId || resData.admin._id;
        resourceName = resData.admin.name;
        break;
      case !!resData.lecturer:
        resourceId = resourceId || resData.lecturer._id;
        resourceName = resData.lecturer.name;
        break;
      case !!resData.package:
        resourceId = resourceId || resData.package._id;
        resourceName = resData.package.name;
        break;
    }
  }
  
  // Additional extraction from request body for create/update operations
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && !resourceName) {
    resourceName = req.body.name;
  }
  
  // Determine if the request was successful based on status code and resource ID
  const statusCode = originalRes?.statusCode || 500;
  const isSuccess = statusCode >= 200 && statusCode < 400 && (
    // For read operations or operations where we have a resource ID
    methodToAction[req.method] === 'read' || 
    resourceId || 
    (resData && resData.results > 0)
  );
  
  // Create the audit log
  await AuditLog.create({
    user: {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    action: methodToAction[req.method],
    resource: {
      type: resourceType,
      id: resourceId,
      name: resourceName || (isSuccess ? undefined : "Operation failed")
    },
    status: isSuccess ? "success" : "failed",
    timestamp: new Date()
  });
};

const auditLogger = (req, res, next) => {
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function to capture response data before sending
  res.send = function(body) {
    try {
      // Store response for audit logging
      res._body = typeof body === 'string' ? JSON.parse(body) : body;
      res.statusCode = res.statusCode || 200;
      
      // Create audit log entry - wrapped in try/catch instead of using Promise.catch()
      try {
        createAuditLogEntry(req, res, res);
      } catch (err) {
        console.error('Error creating audit log:', err);
      }
    } catch (err) {
      console.error('Error processing response body:', err);
    }
    
    // Call the original send function
    return originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = auditLogger;