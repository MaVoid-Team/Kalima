const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// @route POST /auth/
const login = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return next(new AppError("All fields are required.", 400));
  }

  const foundUser = await User.findOne({ name });

  if (!foundUser) {
    return next(new AppError("Couldn't find a user with this name or password.", 400));
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return next(new AppError("Couldn't find a user with this name or password.", 400));
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
const refresh = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new AppError("Unauthorized attempt.", 401));
  }

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    catchAsync(async (err, decoded) => {
      if (err) {
        return next(new AppError("Forbidden", 401));
      }

      const foundUser = await User.findOne({ name: decoded.user });

      if (!foundUser) {
        return next(new AppError("Couldn't find a user with this username or password.", 400));
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
});

// @route POST /auth/logout
// To clear cookie incase one exists.
const logout = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new AppError("Unauthorized attempt.", 401));
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookies cleared." });
};

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role) {
      return next(new AppError("Unauthorized", 401));
    }
    const rolesArray = [...allowedRoles];
    if (!rolesArray.includes(req.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
};

module.exports = { login, refresh, logout, verifyRoles };