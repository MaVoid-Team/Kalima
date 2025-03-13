const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// @route POST /auth/
const login = catchAsync(async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  // Assisning the roles that can only login with a phone number.
  const phoneRequiredRoles = ["Teacher", "Parent", "Student"]

  // For the different methods of login.
  if (!((email && password) || (phoneNumber && password))) {
    return next(new AppError("Please provide either email and password or phone number and password.", 400));
  }

  const foundUser = email ? await User.findOne({ email }) : await User.findOne({ phoneNumber })

  if (!foundUser) {
    return next(new AppError(`Couldn't find a user with this ${email ? "email" : "phone number"} and password.`, 400));
  }

  if (phoneRequiredRoles.includes(foundUser.role) && !phoneNumber) {
    return next(new AppError("This user is required to login with a phone number.", 400));
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return next(new AppError(`Couldn't find a user with this ${email ? "email" : "phone number"} and password.`, 400));
  }

  const accessToken = jwt.sign(
    {
      UserInfo: { id: foundUser._id, role: foundUser.role },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }, // Time should be changed in production
  );

  const refreshToken = jwt.sign(
    { id: foundUser._id, },
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

      const foundUser = await User.findOne({ _id: decoded.id });

      if (!foundUser) {
        return next(new AppError("Couldn't find a user with this username or password.", 400));
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
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
