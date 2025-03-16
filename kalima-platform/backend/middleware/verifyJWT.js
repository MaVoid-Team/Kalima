// To be used in relevant routes for Authorization
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1]; // To grap the token itself from the authHeader.
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, catchAsync(
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Forbidden" });
      }

      id = decoded.UserInfo.id;
      const user = await User.findById(id).select('-password').lean()
      if (!user) return res.status(401).json({ message: "Forbidden" });
      req.user = user;

      next();
    })
  )
}

module.exports = verifyJWT;