const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

// @route POST /auth/
const login = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const foundUser = await User.findOne({ name });

  if (!foundUser) {
    return res.status(400).json({
      message: "Couldn't find a user with this name or password.",
    });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(400).json({
      message: "Couldn't find a user with this name or password.",
    });
  }
  const accessToken = jwt.sign(
    {
      UserInfo: { name: foundUser.name, role: foundUser.role },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }, // Time should be changed in production
  );

  const refreshToken = jwt.sign(
    { name: foundUser.name },
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

      const foundUser = await User.findOne({ name: decoded.user });

      if (!foundUser) {
        return res.status(400).json({
          message: "Couldn't find a user with this username or password.",
        });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            name: foundUser.name,
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
