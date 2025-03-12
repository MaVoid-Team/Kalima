// When adding a new
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");

// @route POST /register/
const registerNewUser = asyncHandler(async (req, res) => {
  const { role, name, email, password, ...userData } = req.body;

  // Cehcking dublicate.
  const dublicateName = await User.findOne({ name });

  if (dublicateName) {
    return res.status(409).json({ message: "This user already exists." });
  }
  const dublicateEmail = await User.findOne({ email });

  if (dublicateEmail) {
    return res
      .status(409)
      .json({ message: "This E-Mail is alread assosiated with a user." });
  }

  const hashedPwd = await bcrypt.hash(password, 12);

  const newUser = {
    name,
    email,
    password: hashedPwd,
    ...userData,
  };

  let user;

  switch (role) {
    case "teacher":
      user = Teacher.create(newUser);
      break;
    case "student":
      user = Student.create(newUser);
      break;
    case "parent":
      user = Parent.create(newUser);
      break;
    case "lecturer":
      user = Lecturer.create(newUser);
      break;
    default:
      return res.status(400).json({ error: "Invalid role" });
  }

  if (user) {
    return res
      .status(201)
      .json({ message: `User created successfuly with name ${name}.` });
  } else {
    return res.status(400).json({ message: "Invalid user data recieved" });
  }
});

module.exports = { registerNewUser };
