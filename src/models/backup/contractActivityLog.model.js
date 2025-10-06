const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractActivityLogSchema = mongoose.Schema(
  {
    // Association
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    user_id: {
      type: String,
      ref: "User",
    },

    // Activity details
    action_type: {
      type: String,
      required: true,
      enum: [
        "created",
        "updated",
        "signed",
        "exported",
        "shared",
        "version_created",
        "version_restored",
        "template_applied",
        "validation_run",
        "status_changed",
        "archived",
      ],
    },
    action_description: {
      type: String,
    },

    // Data changes
    field_name: {
      type: String,
    },
    old_value: {
      type: mongoose.Schema.Types.Mixed,
    },
    new_value: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Context
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
    session_data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

// Indexes
contractActivityLogSchema.index({ contract_id: 1 });
contractActivityLogSchema.index({ user_id: 1 });
contractActivityLogSchema.index({ action_type: 1 });
contractActivityLogSchema.index({ created_at: 1 });

// Add plugins
contractActivityLogSchema.plugin(toJSON);
contractActivityLogSchema.plugin(paginate);

/**
 * @typedef ContractActivityLog
 */
const ContractActivityLog = mongoose.model(
  "ContractActivityLog",
  contractActivityLogSchema
);

module.exports = ContractActivityLog;
