const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const refreshTokenSchema = mongoose.Schema(
  {
    instance_id: String,
    token: String,
    user_id: String,
    revoked: Boolean,
    parent: String,
    session_id: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add plugins
refreshTokenSchema.plugin(toJSON);
refreshTokenSchema.plugin(paginate);

/**
 * @typedef RefreshToken
 */
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
