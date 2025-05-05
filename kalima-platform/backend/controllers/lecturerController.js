const Lecturer = require("../models/lecturerModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const configureCloudinary = require("../config/cloudinaryOptions");

configureCloudinary();

const multerImageStorage = multer.memoryStorage();

const multerImageFilter = (req, file, cb) => {
    // Check if the file mimetype starts with 'image/'
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Accept file
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false); // Reject file
    }
};

const upload = multer({
    storage: multerImageStorage,
    fileFilter: multerImageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Example: Limit file size to 5MB
});

exports.uploadLecturerPhoto = upload.single('profilePicture');
// Create a new lecturer
exports.createLecturer = catchAsync(async (req, res, next) => {
    const { name, email, password, gender, role, bio, expertise } = req.body;

    if (!bio || !expertise) {
        return next(new AppError("Bio and expertise are required.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const lecturerData = {
        name,
        email,
        password: hashedPassword,
        gender,
        role,
        bio,
        expertise,
        profilePicture: req.body.profilePicture || null,
    };

    if (req.file) {
        try {
            const imageUploadResult = await new Promise((resolve, reject) => {
                const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
                
                cloudinary.uploader.upload(
                    base64File, 
                    { folder: 'lecturer_profiles', resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
            
            if (imageUploadResult && imageUploadResult.secure_url) {
                lecturerData.profilePicture = {
                    url: imageUploadResult.secure_url,
                    publicId: imageUploadResult.public_id
                };
            }
        } catch (err) {
            console.error("Image upload error:", err);
            return next(new AppError(`Image upload failed: ${err.message}`, 500));
        }
    }
    
    const lecturer = await Lecturer.create(lecturerData);
    
    res.status(201).json({
        status: "success",
        data: lecturer,
    });
});

// Get all lecturers
exports.getAllLecturers = catchAsync(async (req, res, next) => {
    const lecturers = await Lecturer.find();

    res.status(200).json({
        status: "success",
        data: lecturers,
    });
});

// Get a lecturer by ID
exports.getLecturerById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const lecturer = await Lecturer.findById(id);

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: lecturer,
    });
});

// Update a lecturer by ID
exports.updateLecturer = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, bio, expertise } = req.body;

    const lecturer = await Lecturer.findByIdAndUpdate(
        id,
        { name, email, bio, expertise },
        { new: true, runValidators: true }
    );

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: lecturer,
    });
});

// Delete a lecturer by ID
exports.deleteLecturer = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const lecturer = await Lecturer.findByIdAndDelete(id);

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Lecturer deleted successfully.",
    });
});