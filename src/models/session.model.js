const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const sessionSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    session_id: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add plugins
sessionSchema.plugin(toJSON);
sessionSchema.plugin(paginate);

/**
 * @typedef Session
 */
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
