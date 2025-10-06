const express = require("express");
const validate = require("../../middlewares/validate");
const authValidation = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

// Regular authentication routes
router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);

router.post("/login", validate(authValidation.login), authController.login);
router.post("/logout", validate(authValidation.logout), authController.logout);
router.get("/session", auth(), authController.getSession);
router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);
router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post(
  "/verify-otp",
  validate(authValidation.verifyOtp),
  authController.verifyEmailOtp
);

// Clerk integration routes
router.post(
  "/clerk/register",
  validate(authValidation.clerkRegister),
  authController.clerkRegister
);
router.post(
  "/clerk/login",
  validate(authValidation.clerkLogin),
  authController.clerkLogin
);

module.exports = router;
