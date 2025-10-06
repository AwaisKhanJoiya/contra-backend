const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    contract_type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "signed", "pending_signature"],
      default: "draft",
    },
    content: {
      type: String,
      required: false,
    },
    form_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    template_id: {
      type: String,
      required: false,
    },
    is_template: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
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
contractSchema.plugin(toJSON);
contractSchema.plugin(paginate);

/**
 * @typedef Contract
 */
const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
