const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Assistant = require("../models/assistantModel.js");
const Moderator = require("../models/moderatorModel.js");
const SubAdmin = require("../models/subAdminModel.js");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Level = require("../models/levelModel.js");
const governments = [
  'Alexandria', 'Aswan', 'Assiut', 'Beheira', 'Beni Suef', 'Cairo',
  'Dakahlia', 'Damietta', 'Fayoum', 'Gharbia', 'Giza', 'Ismailia',
  'Kafr el-Sheikh', 'Matrouh', 'Minya', 'Menofia', 'New Valley',
  'North Sinai', 'Port Said', 'Qualyubia', 'Qena', 'Red Sea',
  'Al-Sharqia', 'Sohag', 'South Sinai', 'Suez', 'Luxor'
];

const administrationZones = [
 'East Educational Administration', 'West Educational Administration',
  'Central Educational Administration', 'El-Gomrok Educational Administration',
  'Montaza Educational Administration', 'Agamy Educational Administration',
  'Amreya Educational Administration',

  // Cairo Governorate
  'East Cairo Educational Administration', 'West Cairo Educational Administration',
  'North Cairo Educational Administration', 'South Cairo Educational Administration',
  'Central Cairo Educational Administration', 'El-Waili Educational Administration',
  'El-Zeitoun Educational Administration', 'Heliopolis Educational Administration',
  'Nasr City Educational Administration', 'El-Salam Educational Administration',
  'El-Matariya Educational Administration', 'Ain Shams Educational Administration',
  'El-Marg Educational Administration', 'El-Shorouk Educational Administration',

  // Giza Governorate
  'North Giza Educational Administration', 'South Giza Educational Administration',
  'East Giza Educational Administration', 'West Giza Educational Administration',
  '6th of October Educational Administration', 'El-Haram Educational Administration',
  'El-Dokki Educational Administration', 'El-Agouza Educational Administration',
  'El-Wahat Educational Administration', 'Atfih Educational Administration',

  // Sharkia Governorate
  'Zagazig Educational Administration', 'Fakous Educational Administration',
  'Hehia Educational Administration', 'Abu Hammad Educational Administration',
  'Abu Kebir Educational Administration', 'El-Ibrahimia Educational Administration',
  'Belbeis Educational Administration', 'Menia El-Kamh Educational Administration',
  'Diarb Negm Educational Administration', 'Kafr Saqr Educational Administration',
  'Mashtool El-Souk Educational Administration',

  // Beheira Governorate
  'Damanhour Educational Administration', 'Kafr El-Dawar Educational Administration',
  'Abu Hummus Educational Administration', 'Edko Educational Administration',
  'El-Mahmoudia Educational Administration', 'El-Rahmaniya Educational Administration',
  'Kom Hamada Educational Administration', 'Itay El-Baroud Educational Administration',
  'Hosh Essa Educational Administration', 'Shubrakhit Educational Administration',
  'El-Delengat Educational Administration', 'Wadi El-Natrun Educational Administration',

  // Dakahlia Governorate
  'Mansoura Educational Administration', 'Talkha Educational Administration',
  'Mit Ghamr Educational Administration', 'Aga Educational Administration',
  'Sinbillawin Educational Administration', 'El-Manzala Educational Administration',
  'Belqas Educational Administration', 'Sherbin Educational Administration',
  'Dikirnis Educational Administration', 'El-Gammaliya Educational Administration',
  'Mit Salsil Educational Administration', 'Nabaroh Educational Administration',

  // Kafr El-Sheikh Governorate
  'Kafr El-Sheikh Educational Administration', 'Desouk Educational Administration',
  'Fuwwah Educational Administration', 'Motobas Educational Administration',
  'Baltim Educational Administration', 'Sidi Salem Educational Administration',
  'Qalin Educational Administration', 'El-Hamoul Educational Administration',
  'El-Riyad Educational Administration', 'Bella Educational Administration',

  // Gharbia Governorate
  'Tanta Educational Administration', 'El-Mahalla El-Kubra Educational Administration',
  'Kafr El-Zayat Educational Administration', 'Zefta Educational Administration',
  'El-Santa Educational Administration', 'Samannoud Educational Administration',
  'Bassioun Educational Administration', 'Qutour Educational Administration',

  // Menoufia Governorate
  'Shebin El-Kom Educational Administration', 'Menouf Educational Administration',
  'Ashmoun Educational Administration', 'Quesna Educational Administration',
  'El-Bagour Educational Administration', 'El-Shohada Educational Administration',
  'Berket El-Sab Educational Administration', 'Tala Educational Administration',
  'Sers El-Lyan Educational Administration',

  // Damietta Governorate
  'Damietta Educational Administration', 'Faraskour Educational Administration',
  'Kafr Saad Educational Administration', 'El-Zarqa Educational Administration',
  'Kafr El-Batikh Educational Administration',

  // Port Said Governorate
  'Port Said North Educational Administration', 'Port Said South Educational Administration',
  'Port Fouad Educational Administration', 'El-Zohor Educational Administration',
  'El-Arab District Educational Administration', 'El-Dawahy Educational Administration',

  // Ismailia Governorate
  'Ismailia Educational Administration', 'El-Tal El-Kebir Educational Administration',
  'Fayed Educational Administration', 'El-Qantara Educational Administration',
  'Abu Swair Educational Administration', 'El-Qassassin Educational Administration',

  // Suez Governorate
  'Suez Educational Administration', 'El-Arbaeen Educational Administration',
  'Ataqah Educational Administration', 'El-Ganayen Educational Administration',
  'Faisal Educational Administration',

  // North Sinai Governorate
  'El-Arish Educational Administration', 'Sheikh Zuweid Educational Administration',
  'Rafah Educational Administration', 'Bir al-Abd Educational Administration',
  'El-Hasana Educational Administration', 'Nakhl Educational Administration',

  // South Sinai Governorate
  'El-Tor Educational Administration', 'Sharm El-Sheikh Educational Administration',
  'Dahab Educational Administration', 'Nuweiba Educational Administration',
  'Saint Catherine Educational Administration', 'Abu Rudeis Educational Administration',
  'Ras Sidr Educational Administration',

  // Beni Suef Governorate
  'Beni Suef Educational Administration', 'El-Wasta Educational Administration',
  'Nasser Educational Administration', 'Ihnasia Educational Administration',
  'Beba Educational Administration', 'Fashn Educational Administration',
  'Samasta Educational Administration',

  // Fayoum Governorate
  'Fayoum Educational Administration', 'Tamiya Educational Administration',
  'Sinnuris Educational Administration', 'Ibshaway Educational Administration',
  'Itsa Educational Administration', 'Youssef El Seddik Educational Administration',

  // Minya Governorate
  'Minya Educational Administration', 'Abu Qurqas Educational Administration',
  'El-Adwa Educational Administration', 'Maghagha Educational Administration',
  'Beni Mazar Educational Administration', 'Matai Educational Administration',
  'Samalut Educational Administration', 'Mallawi Educational Administration',
  'Dir Mawas Educational Administration',

  // Assiut Governorate
  'Assiut Educational Administration', 'Dairut Educational Administration',
  'El-Qusiya Educational Administration', 'Abnoub Educational Administration',
  'El-Fateh Educational Administration', 'Sahel Selim Educational Administration',
  'El-Badari Educational Administration', 'Sodfa Educational Administration',
  'El-Ghanayem Educational Administration', 'Abu Tig Educational Administration',
  'Manfalut Educational Administration',

  // Sohag Governorate
  'Sohag Educational Administration', 'Akhmim Educational Administration',
  'El-Balyana Educational Administration', 'El-Maragha Educational Administration',
  'Dar El-Salam Educational Administration', 'Gerga Educational Administration',
  'Juhayna Educational Administration', 'Sakulta Educational Administration',
  'Tama Educational Administration', 'Tahta Educational Administration',
  'El-Munsha Educational Administration',

  // Qena Governorate
  'Qena Educational Administration', 'Abu Tesht Educational Administration',
  'Nag Hammadi Educational Administration', 'Deshna Educational Administration',
  'Farshout Educational Administration', 'Qift Educational Administration',
  'Qus Educational Administration', 'Naqada Educational Administration',

  // Luxor Governorate
  'Luxor Educational Administration', 'Armant Educational Administration',
  'Esna Educational Administration', 'El-Tod Educational Administration',
  'El-Qurna Educational Administration',

  // Aswan Governorate
  'Aswan Educational Administration', 'Edfu Educational Administration',
  'Kom Ombo Educational Administration', 'Nasr El-Nuba Educational Administration',
  'Daraw Educational Administration', 'El-Radisiya Educational Administration',

  // Red Sea Governorate
  'Hurghada Educational Administration', 'Ras Gharib Educational Administration',
  'Safaga Educational Administration', 'El-Qusair Educational Administration',
  'Marsa Alam Educational Administration', 'Shalatin Educational Administration',
  'Halayeb Educational Administration',

  // Matrouh Governorate
  'Marsa Matrouh Educational Administration', 'El-Hamam Educational Administration',
  'El-Alamein Educational Administration', 'El-Dabaa Educational Administration',
  'El-Salloum Educational Administration', 'Siwa Educational Administration',

  // New Valley Governorate
  'Kharga Educational Administration', 'Dakhla Educational Administration',
  'Farafra Educational Administration', 'Baris Educational Administration',
  'Balat Educational Administration'
];
const validatePassword = (password) => {
  const requiredLength = 8;

  if (password.length !== requiredLength) {
    throw new AppError(
      `Password must be exactly ${requiredLength} characters long`,
      400
    );
  }
};
const registerNewUser = catchAsync(async (req, res, next) => {
  const {
    role,
    name,
    email,
    phoneNumber,
    confirmPassword,
    password,
    children,
    government,
    administrationZone,
    ...userData
  } = req.body;
  const phoneRequiredRoles = ["teacher", "parent", "student"];
  if (!government) {
    return next(new AppError("Government is required.", 400));
  }
  if (!administrationZone) {
    return next(new AppError("Administration zone is required.", 400));
  }
    if (!governments.includes(government)) {
    return next(new AppError(`Invalid government: ${government}.`, 400));
  }
  if (!administrationZones.includes(administrationZone)) {
    return next(new AppError(`Invalid administration zone: ${administrationZone}.`, 400));
  }
  // Validate password
  try {
    validatePassword(password);
  } catch (error) {
    return next(error);
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const duplicateEmail = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

  if (duplicateEmail) {
    return next(
      new AppError("This E-Mail is already associated with a user.", 409)
    );
  }

  const duplicatePhone = await User.findOne({ phoneNumber });
  if (phoneRequiredRoles.includes(role.toLowerCase()) && duplicatePhone) {
    return next(
      new AppError("This phone number is already associated with a user.", 400)
    );
  }

  const childrenById = [];
  if (!!children) {
    for (let id of children) {
      // Check if the id is a valid MongoDB ObjectId
      const isMongoId = mongoose.Types.ObjectId.isValid(id);
      if (isMongoId) {
        childrenById.push(id);
      } else {
        try {
          const student = await Student.findOne({ sequencedId: id }).lean();
          if (student) {
            childrenById.push(student._id);
          }
        } catch (error) {
          if (error.name === "CastError") {
            return next(
              new AppError(
                "Not all children values are valid UserId or SequenceId.",
                400
              )
            );
          }
        }
      }
    }
  }

  const hashedPwd = await bcrypt.hash(password, 12);

  const newUser = {
    name,
    email: email.toLowerCase().trim(),
    password: hashedPwd,
    children: childrenById,
    isEmailVerified: true, // Set users to already verified by default
    government,
    administrationZone,
    ...userData,
  };

  if (phoneNumber) {
    newUser.phoneNumber = phoneNumber;
  }

  let user;

  switch (role.toLowerCase()) {
    case "teacher": {
      // Validate level (must be an array of allowed values)
      if (
        !Array.isArray(newUser.level) ||
        newUser.level.length === 0 ||
        !newUser.level.every((l) =>
          ["primary", "preparatory", "secondary"].includes(l)
        )
      ) {
        return next(
          new AppError(
            "Level is required for teacher role and must be a non-empty array of: Primary, Preparatory, Secondary",
            400
          )
        );
      }
      // Validate teachesAtType
      if (
        !newUser.teachesAtType ||
        !["Center", "School", "Both"].includes(newUser.teachesAtType)
      ) {
        return next(
          new AppError(
            "teachesAtType is required and must be 'Center', 'School', or 'Both'",
            400
          )
        );
      }
      // Validate centers
      if (
        (newUser.teachesAtType === "Center" ||
          newUser.teachesAtType === "Both") &&
        (!Array.isArray(newUser.centers) || newUser.centers.length === 0)
      ) {
        return next(
          new AppError(
            "At least one center is required if teachesAtType is 'Center' or 'Both'",
            400
          )
        );
      }
      // Validate school
      if (
        (newUser.teachesAtType === "School" ||
          newUser.teachesAtType === "Both") &&
        (!newUser.school || newUser.school.trim() === "")
      ) {
        return next(
          new AppError(
            "School is required if teachesAtType is 'School' or 'Both'",
            400
          )
        );
      }
      // Validate socialMedia (optional, but if present, must be array of {platform, account})
      if (newUser.socialMedia && !Array.isArray(newUser.socialMedia)) {
        return next(new AppError("socialMedia must be an array", 400));
      }
      if (Array.isArray(newUser.socialMedia)) {
        for (const sm of newUser.socialMedia) {
          if (typeof sm !== "object") continue;
          if (
            sm.platform &&
            ![
              "Facebook",
              "Instagram",
              "Twitter",
              "LinkedIn",
              "TikTok",
              "YouTube",
              "WhatsApp",
              "Telegram",
            ].includes(sm.platform)
          ) {
            return next(
              new AppError(`Invalid social media platform: ${sm.platform}`, 400)
            );
          }
        }
      }
      user = await Teacher.create(newUser);
      break;
    }
    case "student":
      if (!newUser.level)
        return next(new AppError("Level is required for student role", 400));
      const level = await Level.findById(newUser.level);
      if (!level)
        return next(new AppError("There is no level with this id", 404));
      user = await Student.create(newUser);
      break;
    case "parent":
      user = await Parent.create(newUser);
      break;
    case "lecturer":
      user = await Lecturer.create(newUser);
      break;
    case "assistant":
      user = await Assistant.create(newUser);
      break;
    case "moderator":
      user = await Moderator.create(newUser);
      break;
    case "subadmin":
      user = await SubAdmin.create(newUser);
      break;
    default:
      return next(new AppError("Invalid role", 400));
  }

  if (user) {
    return res.status(201).json({
      message: `User created successfully with name ${name}.`,
    });
  } else {
    return next(new AppError("Invalid user data received", 400));
  }
});

module.exports = { registerNewUser };
