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
    { keywords: ["sub-admin", "sub-admins", "subadmin", "subadmins"], type: "subAdmin" },
    { keywords: ["assistant", "assistants"], type: "assistant" },
    { keywords: ["admin", "admins"], type: "admin" },
    { keywords: ["lecturer", "lecturers"], type: "lecturer" },
    { keywords: ["package", "packages"], type: "package" },
    { keywords: ["attendance"], type: "attendance" },
    { keywords: ["revenue"], type: "revenue" },
    { keywords: ["pricing-rule", "pricing-rules"], type: "pricingRule" } // Added pricing rule type
  ];
  
  // Find matching resource type
  for (const resource of resourceIdentifiers) {
    if (resource.keywords.some(keyword => pathSegments.some(segment => 
      segment.toLowerCase() === keyword.toLowerCase()))) {
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
  
  // Handle special case for center operations
  let specialAction = null;
  let specialResource = null;
  
  // Special case for center-related endpoints
  if (resourceType === "center") {
    // Check for lesson-related operations in the center context
    if (pathSegments.includes("lessons")) {
      if (req.method === "POST") {
        specialAction = "create";
        specialResource = {
          type: "lesson",
          name: req.body.subject,
          id: originalRes?._body?.data?.lesson?._id
        };
      } else if (req.method === "DELETE" && req.params.lessonId) {
        specialAction = "delete";
        specialResource = {
          type: "lesson",
          id: req.params.lessonId,
          name: "Lesson"
        };
      }
    } else if (pathSegments.includes("timetable")) {
      specialAction = "read";
      specialResource = {
        type: "timetable",
        id: req.params.centerId,
        name: `Timetable for center ${req.params.centerId}`
      };
    }
  }
  
  // Extract resource details from response if available
  const resData = originalRes?._body?.data;
  
  // Handle different response structures for different endpoints
  if (resData && !specialResource) {
    // Special case for packages which have a different structure
    if (resourceType === "package") {
      if (resData.package) {
        resourceId = resourceId || resData.package._id || resData.package.id;
        resourceName = resData.package.name;
      } else if (resData.packages && resData.packages.length) {
        resourceName = `${resData.packages.length} packages`;
      }
    }
    // For other resource types
    else if (resourceType === "admin" && resData.admin) {
      resourceId = resourceId || resData.admin._id || resData.admin.id;
      resourceName = resData.admin.name;
    } else if (resourceType === "subAdmin" && resData.subAdmin) {
      resourceId = resourceId || resData.subAdmin._id || resData.subAdmin.id;
      resourceName = resData.subAdmin.name;
    } else if (resourceType === "moderator" && resData.moderator) {
      resourceId = resourceId || resData.moderator._id || resData.moderator.id;
      resourceName = resData.moderator.name;
    } else if (resourceType === "assistant" && resData.assistant) {
      resourceId = resourceId || resData.assistant._id || resData.assistant.id;
      resourceName = resData.assistant.name;
    } else if (resourceType === "lecturer" && resData.lecturer) {
      resourceId = resourceId || resData.lecturer._id || resData.lecturer.id;
      resourceName = resData.lecturer.name;
    } else if (resourceType === "center" && resData.center) {
      resourceId = resourceId || resData.center._id || resData.center.id;
      resourceName = resData.center.name;
    } else if (resourceType === "container" && resData.container) {
      resourceId = resourceId || resData.container._id || resData.container.id;
      resourceName = resData.container.name;
    } else if (resourceType === "attendance" && resData.attendance) {
      resourceId = resourceId || resData.attendance._id;
      resourceName = `Attendance for student ${resData.attendance.student}`; // Example name
    } else if (resourceType === "revenue") {
      resourceName = `Revenue calculation`; // Example name
      // Revenue might not have a specific ID in the response data
      if (resData.totalRevenue !== undefined) {
        resourceName += ` (Total: ${resData.totalRevenue})`;
      } else if (resData.breakdown) {
        resourceName += ` (Breakdown)`;
      }
    } else if (resourceType === "pricingRule" && resData.pricingRule) { // Handle pricing rule responses
      resourceId = resourceId || resData.pricingRule._id;
      resourceName = `Pricing Rule ${resData.pricingRule._id}`; // Use ID or description
      if (resData.pricingRule.description) {
        resourceName += ` (${resData.pricingRule.description})`;
      }
    } else if (resData.codes && resData.codes.length > 0) {
      resourceName = `${resData.codes.length} codes`;
    } else if (resData.lesson) {
      // Handle lesson creation in center
      resourceId = resourceId || resData.lesson._id || resData.lesson.id;
      resourceName = resData.lesson.subject || "Lesson";
      // Since this is a center lesson operation, update resourceType
      if (pathSegments.includes("lessons") && pathSegments.includes("centers")) {
        resourceType = "center-lesson";
      }
    }
    
    // For direct data without specific property naming
    if (!resourceId && !resourceName && typeof resData === 'object') {
      // Check if the response data itself is the resource (common in some controllers)
      if (resData._id || resData.id) {
        resourceId = resourceId || resData._id || resData.id; 
        resourceName = resData.name;
      } else if (Array.isArray(resData)) {
        // Handle array responses
        resourceName = `${resData.length} items`;
      }
    }
  }
  
  // Additional extraction from request body for create/update operations
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && !resourceName) {
    resourceName = req.body.name;
  }
  
  // Special case for DELETE operations
  const isDeleteOperation = req.method === 'DELETE';
  
  // Determine if the request was successful based on status code
  // For DELETE operations, we only check the status code, not the resource ID
  const statusCode = originalRes?.statusCode || 500;
  const isSuccess = statusCode >= 200 && statusCode < 400 && (
    isDeleteOperation || // DELETE operations are successful if status code is in 2xx range
    methodToAction[req.method] === 'read' || 
    resourceId || 
    (resData && (resData.results > 0 || resData.message || resData.package || resData.packages || resData.lesson || resData.timetable || resData.attendance || resData.totalRevenue !== undefined || resData.breakdown || resData.pricingRule))
  );
  
  // Use special resource and action if defined
  const finalResource = specialResource || {
    type: resourceType,
    id: resourceId,
    name: resourceName || (isSuccess 
      ? (isDeleteOperation ? "Resource deleted successfully" : undefined)
      : "Operation failed")
  };
  
  const finalAction = specialAction || methodToAction[req.method];
  
  // Create the audit log
  await AuditLog.create({
    user: {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    action: finalAction,
    resource: finalResource,
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