const catchAsync = require("../utils/catchAsync");
const {
  userService,
  videoEditingService,
  cullingService,
  colorCorrectionService,
  retouchingService,
  weddingAlbumService,
  realEstateService,
} = require("../services");

const { User } = require("../models");

const getUserProfile = catchAsync(async (req, res) => {
  const user = req.user;
  res.send(user);
});

const updateUserProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

module.exports = {
  getUserProfile,
  updateUserProfile,
};
