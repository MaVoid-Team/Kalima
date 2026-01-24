const mongoose = require("mongoose");
const Attachment = require("../models/attachmentModel");
const Lecture = require("../models/LectureModel");
const Container = require("../models/containerModel");
const Assistant = require("../models/assistantModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all lectures with homework submissions
exports.getLecturesWithHomework = catchAsync(async (req, res, next) => {
  const assistantId = req.user._id;
  
  // Get the assigned lecturer for this assistant
  const assistant = await Assistant.findById(assistantId);
  
  if (!assistant || !assistant.assignedLecturer) {
    return next(new AppError("Assistant not found or not assigned to a lecturer", 404));
  }
  
  const lecturerId = assistant.assignedLecturer;
  
  // Find all lectures created by this lecturer
  const lectures = await Lecture.find({ createdBy: lecturerId })
    .select('_id name subject level')
    .populate('subject', 'name')
    .populate('level', 'name')
    .lean();
  
  // For each lecture, check if it has any homework submissions
  const lecturesWithSubmissions = await Promise.all(
    lectures.map(async (lecture) => {
      const submissionCount = await Attachment.countDocuments({
        lectureId: lecture._id,
        type: 'homeworks',
        studentId: { $ne: null }
      });
      
      return {
        ...lecture,
        hasSubmissions: submissionCount > 0,
        submissionCount
      };
    })
  );
  
  // Filter out lectures with no submissions if requested
  const filteredLectures = req.query.onlyWithSubmissions === 'true' 
    ? lecturesWithSubmissions.filter(lecture => lecture.hasSubmissions) 
    : lecturesWithSubmissions;
  
  res.status(200).json({
    status: 'success',
    results: filteredLectures.length,
    data: {
      lectures: filteredLectures
    }
  });
});

// Get all containers and lectures hierarchy with homework counts
exports.getHomeworkHierarchy = catchAsync(async (req, res, next) => {
  const assistantId = req.user._id;
  
  // Get the assigned lecturer for this assistant
  const assistant = await Assistant.findById(assistantId);
  
  if (!assistant || !assistant.assignedLecturer) {
    return next(new AppError("Assistant not found or not assigned to a lecturer", 404));
  }
  
  const lecturerId = assistant.assignedLecturer;
  
  // 1. Fetch all containers created by the lecturer
  const allContainers = await Container.find({
    createdBy: lecturerId
  }).lean();

  // 2. Fetch all top-level lectures
  const topLevelLectures = await Lecture.find({
    createdBy: lecturerId,
    parent: null
  }).lean();

  // 3. Identify all lecture IDs (from containers with kind='Lecture' and top-level lectures)
  const lectureContainerIds = allContainers
    .filter(c => c.kind === 'Lecture')
    .map(c => c._id);
  
  const topLevelLectureIds = topLevelLectures.map(l => l._id);
  const allLectureIds = [...lectureContainerIds, ...topLevelLectureIds];

  // 4. Aggregate attachment counts for all these lectures
  const attachmentCounts = await Attachment.aggregate([
    {
      $match: {
        lectureId: { $in: allLectureIds },
        type: 'homeworks',
        studentId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$lectureId',
        count: { $sum: 1 }
      }
    }
  ]);

  // Create a map for easy lookup: lectureId -> count
  const countMap = {};
  attachmentCounts.forEach(item => {
    countMap[item._id.toString()] = item.count;
  });

  // 5. Build the container hierarchy in memory
  // First, group containers by parent ID
  const containersByParent = {};
  const topLevelContainerList = [];

  allContainers.forEach(container => {
    if (container.parent) {
      const parentId = container.parent.toString();
      if (!containersByParent[parentId]) {
        containersByParent[parentId] = [];
      }
      containersByParent[parentId].push(container);
    } else if (container.kind !== 'Lecture') {
      // Top level container
      topLevelContainerList.push(container);
    }
  });

  // Function to recursively build tree and calculate counts
  const buildTree = (container) => {
    const children = containersByParent[container._id.toString()] || [];
    
    // Process children
    const processedChildren = children.map(child => {
      if (child.kind === 'Lecture') {
        // It's a lecture container
        const count = countMap[child._id.toString()] || 0;
        return {
          ...child,
          hasSubmissions: count > 0,
          submissionCount: count
        };
      } else {
        // It's a folder container, recurse
        return buildTree(child);
      }
    });

    // Calculate total count for this container
    const totalSubmissionCount = processedChildren.reduce(
      (sum, child) => sum + (child.submissionCount || 0), 
      0
    );

    return {
      ...container,
      children: processedChildren,
      hasSubmissions: totalSubmissionCount > 0,
      submissionCount: totalSubmissionCount
    };
  };

  // Build hierarchy for top level containers
  const hierarchy = topLevelContainerList.map(container => buildTree(container));

  // Process top level lectures
  const processedTopLevelLectures = topLevelLectures.map(lecture => {
    const count = countMap[lecture._id.toString()] || 0;
    return {
      ...lecture,
      hasSubmissions: count > 0,
      submissionCount: count
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      containers: hierarchy,
      topLevelLectures: processedTopLevelLectures
    }
  });
});

// Get all students who submitted homework for a specific lecture
exports.getLectureHomeworkSubmissions = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  
  // Verify the lecture exists
  const lecture = await Lecture.findById(lectureId)
    .populate('subject', 'name')
    .populate('level', 'name')
    .populate('createdBy', 'name'); // Explicitly populate createdBy
    
  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }
  
  // Check if user is a lecturer or an assistant
  if (req.user.role === 'Lecturer') {
    // For lecturers, check if they created the lecture
    if (lecture.createdBy._id.toString() !== req.user._id.toString()) {
      return next(new AppError("You don't have permission to access this lecture", 403));
    }
  } else if (req.user.role === 'Assistant') {
    // For assistants, check if they are assigned to the lecturer who created the lecture
    // Get the assistant with populated assignedLecturer
    const assistant = await Assistant.findById(req.user._id).populate('assignedLecturer');
    
    if (!assistant || !assistant.assignedLecturer) {
      return next(new AppError("Assistant not found or not assigned to a lecturer", 404));
    }
    
    // Safe check for lecture.createdBy and compare with assistant's lecturer
    if (!lecture.createdBy || !lecture.createdBy._id) {
      return next(new AppError("Lecture creator information is missing", 500));
    }
    
    // Verify the assistant has access to this lecture
    if (lecture.createdBy._id.toString() !== assistant.assignedLecturer._id.toString()) {
      return next(new AppError("You don't have permission to access this lecture", 403));
    }
  }
  
  // Get all homework submissions for this lecture grouped by student
  const submissions = await Attachment.find({
    lectureId: lectureId,
    type: 'homeworks',
    studentId: { $ne: null }
  })
  .populate('studentId', 'name email')
  .sort('-uploadedOn')
  .lean();
  
  // Group submissions by student
  const submissionsByStudent = {};
  submissions.forEach(submission => {
    const studentId = submission.studentId._id.toString();
    if (!submissionsByStudent[studentId]) {
      submissionsByStudent[studentId] = {
        student: {
          _id: submission.studentId._id,
          name: submission.studentId.name,
          email: submission.studentId.email
        },
        submissions: []
      };
    }
    submissionsByStudent[studentId].submissions.push({
      _id: submission._id,
      fileName: submission.fileName,
      fileType: submission.fileType,
      fileSize: submission.fileSize,
      uploadedOn: submission.uploadedOn
    });
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      lecture,
      students: Object.values(submissionsByStudent)
    }
  });
});