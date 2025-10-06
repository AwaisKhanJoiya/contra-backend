const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/config");
const userService = require("./user.service");
const { Token } = require("../models");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
// const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
//   const payload = {
//     sub: userId,
//     iat: moment().unix(),
//     exp: expires.unix(),
//     type,
//   };
//   return jwt.sign(payload, secret);
// };

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId.toString(), // Ensure ID is stored as a string
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId.toString(), // Ensure it's stored as a string
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

// const saveToken = async (token, userId, expires, type, blacklisted = false) => {
//   const tokenDoc = await Token.create({
//     token,
//     user: userId,
//     expires: expires.toDate(),
//     type,
//     blacklisted,
//   });
//   return tokenDoc;
// };

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub.toString(), // Ensure it's matched as a string
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

// const verifyToken = async (token, type) => {
//   const payload = jwt.verify(token, config.jwt.secret);
//   const tokenDoc = await Token.findOne({
//     token,
//     type,
//     user: payload.sub,
//     blacklisted: false,
//   });
//   if (!tokenDoc) {
//     throw new Error("Token not found");
//   }
//   return tokenDoc;
// };

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const accessToken = generateToken(
    user._id.toString(), // Ensure string ID
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user._id.toString(), // Ensure string ID
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  await saveToken(
    refreshToken,
    user._id.toString(), // Ensure string ID
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

// const generateAuthTokens = async (user) => {
//   const accessTokenExpires = moment().add(
//     config.jwt.refreshExpirationDays,
//     "days"
//   );
//   const accessToken = generateToken(
//     user.id,
//     accessTokenExpires,
//     tokenTypes.ACCESS
//   );

//   const refreshTokenExpires = moment().add(
//     config.jwt.refreshExpirationDays,
//     "days"
//   );
//   const refreshToken = generateToken(
//     user.id,
//     refreshTokenExpires,
//     tokenTypes.REFRESH
//   );
//   await saveToken(
//     refreshToken,
//     user.id,
//     refreshTokenExpires,
//     tokenTypes.REFRESH
//   );

//   return {
//     access: {
//       token: accessToken,
//       expires: accessTokenExpires.toDate(),
//     },
//     refresh: {
//       token: refreshToken,
//       expires: refreshTokenExpires.toDate(),
//     },
//   };
// };

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  let token = Math.floor(100000 + Math.random() * 900000);
  user.passwordResetToken = token;
  await user.save();
  return { token, user };
};

const setPaymentMode = async (id, mode) => {
  const user = await userService.getUserById(id);
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No users found with id phone number"
    );
  }

  user.paymentMode = mode;
  await user.save();

  return user;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  // const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  // const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  // await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  let token = Math.floor(100000 + Math.random() * 900000);
  user.phoneVerificationToken = token;
  user.save();
  return token;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  setPaymentMode,
};
