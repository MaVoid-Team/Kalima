const {
  generateAccessToken,
  generateRefreshToken,
} = require("./generateTokens");
const RefreshToken = require("../../models/refreshTokenModel");

const sendToken = async (user, res) => {
  const userId = user._id;
  const userRole = user.role;

  const accessToken = generateAccessToken(userId, userRole);
  const refreshToken = generateRefreshToken(userId, userRole);

  // await RefreshToken.deleteMany({ user: userId });
  await RefreshToken.create({
    user: userId,
    token: refreshToken,
  });

  return res.status(200).json({
    accessToken,
  });
};

module.exports = { sendToken };
