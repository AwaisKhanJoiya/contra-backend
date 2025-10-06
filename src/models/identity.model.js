const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const identitySchema = mongoose.Schema(
  {
    provider_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    identity_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    last_sign_in_at: Date,
    email: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add plugins
identitySchema.plugin(toJSON);
identitySchema.plugin(paginate);

/**
 * @typedef Identity
 */
const Identity = mongoose.model("Identity", identitySchema);

module.exports = Identity;
