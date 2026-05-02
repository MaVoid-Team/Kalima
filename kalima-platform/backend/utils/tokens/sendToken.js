const {
  generateAccessToken,
  generateRefreshToken,
} = require("./generateTokens");
const RefreshToken = require("../../models/refreshTokenModel");

const sendToken = async (user, res) => {
  const userId = user._id;
  const userRole = user.role;

  // Check if user already has a refresh token
  const existingToken = await RefreshToken.findOne({ user: userId });

  // Generate a new access token regardless
  const accessToken = generateAccessToken(userId, userRole);

  // Prepare tokens object
  const tokens = {
    accessToken,
    refreshToken: null,
  };

  // If no existing token, generate a new refresh token
  if (!existingToken) {
    const refreshToken = generateRefreshToken(userId, userRole);
    await RefreshToken.create({
      user: userId,
      token: refreshToken,
    });
    tokens.refreshToken = refreshToken;
  } else {
    tokens.refreshToken = existingToken.token;
  }

  // Build user object for frontend
  const userResponse = {
    id: userId.toString(),
    email: user.email,
    name: user.name,
    role: userRole,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };

  // Determine portal access based on role
  const portalAccess = [userRole];

  return res.status(200).json({
    success: true,
    data: {
      user: userResponse,
      tokens,
      portalAccess,
    },
    message: existingToken ? "Welcome back! Using your existing session." : "Login successful",
  });
};

module.exports = { sendToken };
