const Joi = require("joi");
const { password } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};
const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

const clerkLogin = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const clerkRegister = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    userData: Joi.object()
      .keys({
        email: Joi.string().email(),
        firstName: Joi.string().allow("", null),
        lastName: Joi.string().allow("", null),
        metadata: Joi.object().allow(null),
        // Allow additional properties that might come from Clerk
      })
      .unknown(true)
      .optional(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyOtp,
  clerkLogin,
  clerkRegister,
};
