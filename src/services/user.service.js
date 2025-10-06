const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(userBody);
};

// --------free trial decrease upload count --------
const decreaseUploads = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.remainingUploads > 0) {
    user.remainingUploads -= 1;
    await user.save();
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const queryUsers = async (query, filter, options) => {
  // const users = await User.paginate(filter, options);
  const users = await User.find(query);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by Clerk ID
 * @param {string} clerkId
 * @returns {Promise<User>}
 */
const getUserByClerkId = async (clerkId) => {
  return User.findOne({ clerk_id: clerkId });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateUserStatus = async (id, userBody) => {
  return await User.findByIdAndUpdate(id, userBody);
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.deleteOne();
  return user;
};

const changePassword = async (userId, passwords) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!(await user.isPasswordMatch(passwords.old))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong Password");
  }

  Object.assign(user, { password: passwords.new });
  await user.save();
  return user;
};

const updateUserRole = async (id, user) => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return await User.findByIdAndUpdate(id, user);
};

const updateBillingType = async (userId, billingType) => {
  if (!["monthly", "order-wise"].includes(billingType)) {
    throw new Error("Invalid billing type");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { billingType },
    { new: true }
  );
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  createUser,
  updateUserStatus,
  decreaseUploads,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByClerkId,
  updateUserById,
  deleteUserById,
  changePassword,
  updateUserRole,
  updateBillingType,
};
