const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractSchema = mongoose.Schema(
  {
    // Associations
    user_id: {
      type: String,
      ref: "User",
    },
    template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractTemplate",
    },

    // Contract identification
    title: {
      type: String,
      maxlength: 500,
    },
    contract_type: {
      type: String,
      required: true,
    },

    // Current contract state (EnhancedContractState)
    contract_state: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Form data (single source of truth)
    form_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },

    // Variable mappings and computed data
    variable_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    field_mappings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Contract status and workflow
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "incomplete", "ready", "signed", "archived"],
    },
    completion_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Validation and capabilities
    validation_status: {
      type: String,
      default: "pending",
      enum: ["pending", "valid", "invalid"],
    },
    validation_errors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    capabilities: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Contract lifecycle
    is_template: {
      type: Boolean,
      default: false, // Can this contract be used as a template?
    },
    is_signed: {
      type: Boolean,
      default: false,
    },
    signed_at: {
      type: Date,
    },
    signature_data: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Generated content cache (for performance)
    generated_html: {
      type: String,
    },
    generated_pdf_url: {
      type: String,
    },

    // Audit and sync
    version: {
      type: Number,
      default: 1,
    },
    last_sync_timestamp: {
      type: Date,
      default: Date.now,
    },
    is_dirty: {
      type: Boolean,
      default: false, // Has unsaved changes
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

// Indexes for performance
contractSchema.index({ user_id: 1 });
contractSchema.index({ template_id: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ created_at: 1 });
contractSchema.index({ updated_at: 1 });
contractSchema.index({ completion_percentage: 1 });

/**
 * @typedef Contract
 */
const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
