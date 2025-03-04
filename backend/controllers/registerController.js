const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

// Temporary DB setup untill mongo is implemented.
// All JSON related code will be Swapped with MongoDB equivilant upon the schemas completion.

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

// @route POST /register/
const registerNewUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !name ||
    !name.firstname ||
    !name.lastname ||
    !username ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({ message: "All Fields are required." });
  }

  // Validating E-Mail using a regex pattern.
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Please make sure to enter a valid E-Mail." });
  }

  // Cehcking dublicate.
  const dublicateName = usersDB.users.find(
    (user) => user.username === username,
  );

  if (dublicateName) {
    return res
      .status(409)
      .json({ message: "A user with this username already exists." });
  }
  const dublicateEmail = usersDB.users.find((user) => user.email === email);

  if (dublicateEmail) {
    return res
      .status(409)
      .json({ message: "This E-Mail is alread assosiated with a user." });
  }

  const hashedPwd = await bcrypt.hash(password, 12);

  // To be replaced with Mongo
  const newUser = {
    name: { firstname: name.firstname, lastname: name.lastname },
    username: username,
    password: hashedPwd,
    email: email,
    role: role,
  };

  usersDB.setUsers([...usersDB.users, newUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "users.json"),
    JSON.stringify(usersDB.users),
  );

  res
    .status(201)
    .json({ success: `User created successfuly with username ${username}.` });
});

module.exports = { registerNewUser };
