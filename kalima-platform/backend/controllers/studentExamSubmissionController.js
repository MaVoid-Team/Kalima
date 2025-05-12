const mongoose = require("mongoose");
const StudentExamSubmission = require("../models/studentExamSubmissionModel");
const LecturerExamConfig = require("../models/ExamConfigModel");
const Lecture = require("../models/LectureModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { configureGoogleSheets } = require("../config/googleApiConfig");

// Real Google Sheets API implementation to fetch exam results
const getExamResultsFromSheet = async (sheetId, studentIdentifier, studentIdentifierColumn, scoreColumn) => {
  try {
    // Configure Google Sheets API client
    const sheets = configureGoogleSheets();
    
    // First, get sheet names from the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties.title',
    });
    
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
      return { found: false, error: "No sheets found in the spreadsheet" };
    }
    
    // Get the first sheet's title (usually where form responses go)
    const sheetTitle = spreadsheet.data.sheets[0].properties.title;
      // Get all rows from the spreadsheet with cache busting to ensure fresh data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetTitle, // Using the first sheet
      valueRenderOption: 'UNFORMATTED_VALUE', // Get raw values, not formatted strings
      dateTimeRenderOption: 'FORMATTED_STRING',
    });
      // If there's no data, return not found
    if (!response.data.values || response.data.values.length === 0) {
      return { found: false, error: "No data found in the spreadsheet" };
    }
    
    // Get headers (first row)
    const headers = response.data.values[0];
    
    // Find column indexes for the student identifier and score
    const identifierColIndex = headers.findIndex(
      header => header.toLowerCase() === studentIdentifierColumn.toLowerCase()
    );
    
    const scoreColIndex = headers.findIndex(
      header => header.toLowerCase() === scoreColumn.toLowerCase()
    );
    
    // If we can't find the required columns, return an error
    if (identifierColIndex === -1) {
      return { found: false, error: `Column '${studentIdentifierColumn}' not found` };
    }
    
    if (scoreColIndex === -1) {
      return { found: false, error: `Column '${scoreColumn}' not found` };
    }
    
    // Find the row that matches the student identifier
    const dataRows = response.data.values.slice(1); // Skip header row
    
    // Filter all matching rows for this student
    const studentRows = dataRows.filter(
      row => row[identifierColIndex] && 
             row[identifierColIndex].toLowerCase().trim() === studentIdentifier.toLowerCase().trim()
    );
    
    // If there are multiple submissions, get the most recent one
    // Assuming the first column contains the timestamp
    let studentRow = null;
    if (studentRows.length > 0) {
      // Sort by timestamp (newest first) - assuming timestamp is in column 0
      studentRows.sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB - dateA; // Newest first
      });
      
      studentRow = studentRows[0]; // Get the most recent submission
    }
    
    // If no matching row is found, return not found
    if (!studentRow) {
      return { 
        found: false, 
        error: `No submission found for student with identifier: ${studentIdentifier}` 
      };
    }
      // Get the score and parse it as a number
    const rawScore = studentRow[scoreColIndex];
    
    // Check if the score is in format "X/Y" (e.g. "9/9")
    let score, maxScore;
    
    if (typeof rawScore === 'string' && rawScore.includes('/')) {
      // Score is in format X/Y
      const [scoreValue, maxScoreValue] = rawScore.split('/').map(val => parseFloat(val.trim()));
      
      if (!isNaN(scoreValue) && !isNaN(maxScoreValue)) {
        score = scoreValue;
        maxScore = maxScoreValue;
      } else {
        return { 
          found: false, 
          error: `Invalid score format for student: ${studentIdentifier}. Expected format X/Y.` 
        };
      }
    } else {
      // Score is a simple number
      score = parseFloat(rawScore);
      // If Google Forms doesn't provide max score, use the score as the max score if it's perfect
      maxScore = score; 
      
      if (isNaN(score)) {
        return { 
          found: false, 
          error: `Invalid score format for student: ${studentIdentifier}` 
        };
      }
    }
    
    // All checks passed, return the student's score
    return {
      found: true,
      score: score,
      maxScore: maxScore, // Use the parsed max score
      studentRow: studentRow, // Include the full row for additional info if needed
      fetchTime: new Date().toISOString() // Add timestamp to track when data was fetched
    };
  } catch (error) {
    console.error("Error fetching exam results from Google Sheet:", error);
    return { 
      found: false, 
      error: `Unable to fetch exam results: ${error.message}`
    };
  }
};

// Verify and record student's exam submission
exports.verifyExamSubmission = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const studentId = req.user._id; // Get authenticated student ID
  
  // Find the lecture and verify it requires an exam
  const lecture = await Lecture.findById(lectureId).populate('examConfig');
  
  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }
  
  // Check if lecture requires an exam
  if (!lecture.requiresExam) {
    return next(new AppError("This lecture does not require an exam", 400));
  }
  
  // Check if the exam config exists
  if (!lecture.examConfig) {
    return next(new AppError("Exam configuration not found for this lecture", 404));
  }
  
  // Check if student has already passed the exam
  const existingSubmission = await StudentExamSubmission.findOne({
    student: studentId,
    lecture: lectureId,
    passed: true
  });
  
  if (existingSubmission) {
    return res.status(200).json({
      status: "success",
      message: "You have already passed this exam",
      data: {
        submission: existingSubmission
      }
    });
  }
  
  // Get exam config details
  const examConfig = await LecturerExamConfig.findById(lecture.examConfig._id);
  
  if (!examConfig) {
    return next(new AppError("Exam configuration not found", 404));
  }
  
  // Fetch the student's identifier (email or ID) for matching in the Google Sheet
  const studentIdentifier = req.user.email || req.user._id.toString();
  
  // Get results from Google Sheet
  const examResults = await getExamResultsFromSheet(
    examConfig.googleSheetId,
    studentIdentifier,
    examConfig.studentIdentifierColumn,
    examConfig.scoreColumn
  );
  
  if (!examResults.found) {
    return next(new AppError(examResults.error || "No exam submission found for this student", 404));
  }
    // Determine passing threshold from the exam config
  const passingThreshold = examConfig.defaultPassingThreshold;
  
  // Check if student passed
  const passed = examResults.score >= passingThreshold;
  
  // Create or update the exam submission record
  let submission = await StudentExamSubmission.findOneAndUpdate(
    { student: studentId, lecture: lectureId },
    {
      score: examResults.score,
      maxScore: examResults.maxScore,
      passingThreshold: passingThreshold,
      passed: passed,
      submittedAt: new Date(),
      verifiedAt: new Date()
    },
    { new: true, upsert: true }
  );
  
  res.status(200).json({
    status: "success",
    data: {
      submission,
      passed,
      requiredScore: passingThreshold,
      examUrl: examConfig.formUrl
    }
  });
});

// Get a student's exam submissions
exports.getMyExamSubmissions = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  
  const submissions = await StudentExamSubmission.find({ student: studentId })
    .populate({
      path: 'lecture',
      select: 'name subject requiresExam'
    })
    .sort({ submittedAt: -1 });
  
  res.status(200).json({
    status: "success",
    results: submissions.length,
    data: {
      submissions
    }
  });
});

// Get all submissions for a specific lecture (for lecturers/assistants)
exports.getLectureSubmissions = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  
  // Find the lecture first to verify it exists and check permissions
  const lecture = await Lecture.findById(lectureId);
  
  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }
  
  // Check if the user is the lecture creator or an admin/assistant
  const isCreator = lecture.createdBy.toString() === req.user._id.toString();
  const isAdmin = ["Admin", "SubAdmin", "Moderator"].includes(req.user.role);
  const isAssistant = req.user.role === 'Assistant' && 
                      req.user.assignedLecturer && 
                      req.user.assignedLecturer.toString() === lecture.createdBy.toString();
  
  if (!isCreator && !isAdmin && !isAssistant) {
    return next(new AppError("You do not have permission to view these submissions", 403));
  }
  
  // Get all submissions for this lecture
  const submissions = await StudentExamSubmission.find({ lecture: lectureId })
    .populate({
      path: 'student',
      select: 'name email'
    })
    .sort({ submittedAt: -1 });
  
  res.status(200).json({
    status: "success",
    results: submissions.length,
    data: {
      submissions
    }
  });
});