const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { Identity } = require("../models");

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (body) => {
  try {
    const user = await userService.getUserByEmail(body.email);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: body.password });
  } catch (error) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Account does not exist with that email"
    );
  }
};

const verifyPhone = async (body) => {
  try {
    const user = await userService.getUserByEmail(body.email);
    if (!user) {
      throw new Error();
    }
    if (user.phoneVerificationToken === body.token) {
      await userService.updateUserById(user.id, { isPhoneVerified: true });
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid verification token");
    }
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid verification token");
  }
};

/**
 * Verify a Clerk JWT token and get user information
 * @param {string} token - Clerk JWT token
 * @returns {Promise<Object>} - Decoded user data
 */
const verifyClerkToken = async (token) => {
  try {
    // For development purposes, we'll just decode the JWT without verifying
    // In production, you should verify using Clerk's public keys
    // See: https://clerk.com/docs/backend-requests/resources/jwt-templates#verifying-jwts

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token is required");
    }

    // Basic JWT structure validation
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid JWT format");
    }

    // Decode the JWT payload (middle part)
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

      // For development, we'll accept the token and extract user information
      // Note: This is not secure for production!
      return {
        id: payload.sub,
        email: payload.email || "",
        firstName: payload.firstName || "",
        lastName: payload.lastName || "",
        // Other fields from JWT if available
      };
    } catch (decodeError) {
      console.error("JWT decode error:", decodeError);
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token format");
    }
  } catch (error) {
    console.error("Token verification error:", error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Clerk token");
  }
};

/**
 * Login with Clerk token
 * @param {string} clerkToken - Clerk JWT token
 * @returns {Promise<Object>} - User data and tokens
 */
const loginWithClerkToken = async (clerkToken) => {
  // Verify Clerk token
  const clerkUser = await verifyClerkToken(clerkToken);

  if (!clerkUser || !clerkUser.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Clerk token");
  }

  // Find user directly by clerk_id
  const user = await userService.getUserByClerkId(clerkUser.id);

  // If user doesn't exist, they need to register first
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not registered. Please register first."
    );
  }

  // Generate auth tokens
  const tokens = await tokenService.generateAuthTokens(user);

  // Update last login time
  await userService.updateUserById(user.id, {
    lastLoginAt: new Date(),
  });

  return {
    user,
    tokens,
  };
};

/**
 * Register with Clerk token and user data
 * @param {string} clerkToken - Clerk JWT token
 * @param {Object} userData - User data from Clerk
 * @returns {Promise<Object>} - User data and tokens
 */
const registerWithClerkToken = async (clerkToken, userData) => {
  // Verify Clerk token
  const clerkUser = await verifyClerkToken(clerkToken);
  console.log("userData:", userData);
  if (!clerkUser || !clerkUser.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Clerk token");
  }

  // Check if user already exists by clerk_id
  const existingUser = await userService.getUserByClerkId(clerkUser.id);

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already registered");
  }

  // Check if email is already in use
  if (userData.email) {
    const existingEmail = await userService.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
    }
  }

  // Create new user in our database
  const user = await userService.createUser({
    email: userData.email || clerkUser.email,
    clerk_id: clerkUser.id,
    firstName: userData.firstName || clerkUser.firstName || "",
    lastName: userData.lastName || clerkUser.lastName || "",
    metadata: {
      clerkData: userData,
    },
    lastLoginAt: new Date(),
  });

  // Generate tokens for the new user
  const authTokens = await tokenService.generateAuthTokens(user);

  return {
    user,
    tokens: authTokens,
  };
};

module.exports = {
  refreshAuth,
  resetPassword,
  verifyPhone,
  loginWithClerkToken,
  registerWithClerkToken,
};
