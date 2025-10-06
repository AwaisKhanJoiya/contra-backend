const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services");

// const register = catchAsync(async (req, res) => {
//   const user = await userService.createUser(req.body);
//   const tokens = await tokenService.generateAuthTokens(user);
//   res.status(httpStatus.CREATED).send({ user, tokens });
// });

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSession = catchAsync(async (req, res) => {
  const user = req.user;
  // Calculate token expiration (from auth middleware)
  const tokenExp = req.tokenExpires;
  const now = Math.floor(Date.now() / 1000);
  const expires_in = tokenExp - now;

  // Return session data
  res.send({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Include any other user fields needed by the frontend
    },
    expires_in: expires_in > 0 ? expires_in : 0,
    expires_at: new Date(tokenExp * 1000).toISOString(),
  });
});

/**
 * Clerk login - Authenticate with a Clerk token
 */
const clerkLogin = catchAsync(async (req, res) => {
  const { token } = req.body;
  const { user, tokens } = await authService.loginWithClerkToken(token);
  res.send({ user, tokens });
});

/**
 * Clerk register - Register a new user from Clerk
 */
const clerkRegister = catchAsync(async (req, res) => {
  const { token, userData } = req.body;
  const { user, tokens } = await authService.registerWithClerkToken(
    token,
    userData
  );
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email");
  }

  const token = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  user.passwordResetToken = token;
  await user.save();

  await emailService.sendResetPasswordEmail(email, token);
  res.status(httpStatus.OK).json({ message: "OTP sent to your email" });
});

const verifyEmailOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.passwordResetToken?.toString() === otp.toString()) {
    user.passwordResetToken = null;
    user.canResetPassword = true; // flag to allow reset
    await user.save();

    return res
      .status(httpStatus.OK)
      .json({ message: "OTP verified. You can now reset your password." });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.canResetPassword) {
    throw new ApiError(httpStatus.FORBIDDEN, "OTP not verified");
  }

  user.password = newPassword;
  user.canResetPassword = false; // reset the flag
  await user.save();

  res
    .status(httpStatus.OK)
    .json({ message: "Password has been reset successfully" });
});
module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmailOtp,
  getSession,
  clerkLogin,
  clerkRegister,
};
