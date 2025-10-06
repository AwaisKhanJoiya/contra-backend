const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const flowStateSchema = mongoose.Schema(
  {
    user_id: String,
    auth_code: {
      type: String,
      required: true,
    },
    code_challenge_method: {
      type: String,
      required: true,
    },
    code_challenge: {
      type: String,
      required: true,
    },
    provider_type: {
      type: String,
      required: true,
    },
    provider_access_token: String,
    provider_refresh_token: String,
    authentication_method: {
      type: String,
      required: true,
    },
    auth_code_issued_at: Date,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add plugins
flowStateSchema.plugin(toJSON);
flowStateSchema.plugin(paginate);

/**
 * @typedef FlowState
 */
const FlowState = mongoose.model("FlowState", flowStateSchema);

module.exports = FlowState;
