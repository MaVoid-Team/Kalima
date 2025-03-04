const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Temporary DB setup untill mongo is implemented.
// All JSON related code will be Swapped with MongoDB equivilant upon the schemas completion.

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

// @route POST /auth/
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Incase of dublicate.
  const dublicateUser = usersDB.users.find(
    (user) => user.username === username,
  );

  if (!dublicateUser) {
    return res.status(400).json({
      message: "Couldn't find a user with this username or password.",
    });
  }

  const match = await bcrypt.compare(password, dublicateUser.password);

  if (!match) {
    return res.status(400).json({
      message: "Couldn't find a user with this username or password.",
    });
  }
  const accessToken = jwt.sign(
    {
      UserInfo: { username: dublicateUser.username, role: dublicateUser.role },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }, // Time should be changed in production
  );

  const refreshToken = jwt.sign(
    { username: dublicateUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1000s" }, // Time should be changed in production
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "none", // Allow cross-site.
    secure: true,
    maxAge: 300000 * 1000, // Should be set to match the Refresh Token age.
  });

  return res.json({ accessToken });
});

// @route GET /auth/refresh
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized attempt." });
  }

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Forbidden" });
      }

      const foundUser = usersDB.users.find(
        (user) => user.username === decoded.username,
      );

      if (!foundUser) {
        return res.status(400).json({
          message: "Couldn't find a user with this username or password.",
        });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            role: foundUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" }, // Time should be changed in production
      );

      res.json({ accessToken });
    }),
  );
};

// @route POST /auth/logout
// To clear cookie incase one exists.
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized attempt." });
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookies cleared." });
};

module.exports = { login, refresh, logout };
