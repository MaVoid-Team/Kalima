// To be used in relevant routes for Authorization
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // To grap the token itself from the authHeader.

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Forbidden" });
    }
    req.id = decoded.UserInfo.id;
    req.role = decoded.UserInfo.role;
    next();
  });
};

module.exports = verifyJWT;
