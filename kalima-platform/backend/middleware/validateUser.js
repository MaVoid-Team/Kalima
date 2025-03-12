// Used for validating request information using JOI.
/* When adding a new role just imoprt the schema and add the role name in the "roleSchemas" variable, 
and make sure to add a new switch case to the "controllers/registerController.js". */

const teacherSchema = require("../validations/teacherValidation.js");
const studentSchema = require("../validations/studentValidation.js");
const parentSchema = require("../validations/parentValidation.js");
const lecturerSchema = require("../validations/lecturerValidation.js");

const roleSchemas = {
  teacher: teacherSchema,
  student: studentSchema,
  parent: parentSchema,
  lecturer: lecturerSchema,
};

const validateUser = (req, res, next) => {
  const { role } = req.body;

  // Check if a valid role is provided.
  if (!role || !roleSchemas[role]) {
    return res.status(400).json({ message: "Invalid or missing role" });
  }

  // Validate request body based on the role schema and casts it to an error if one exists.
  const { error } = roleSchemas[role].validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = validateUser;
