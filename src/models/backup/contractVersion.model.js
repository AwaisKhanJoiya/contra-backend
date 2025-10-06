const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractVersionSchema = mongoose.Schema(
  {
    // Association
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },

    // Version metadata
    version_number: {
      type: Number,
      required: true,
    },
    version_name: {
      type: String,
    },
    change_description: {
      type: String,
    },

    // Additional fields from new contract_versions table
    contract_html: {
      type: String,
    },
    edit_prompt: {
      type: String,
    },
    is_current: {
      type: Boolean,
      default: false,
    },

    // Complete state snapshot (from original schema)
    contract_state: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    form_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    variable_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    field_mappings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Version status
    status: {
      type: String,
    },
    validation_status: {
      type: String,
    },
    validation_errors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // What changed (for efficient diffing)
    changed_fields: {
      type: [String],
      default: [],
    },
    change_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Generated content for this version
    generated_html: {
      type: String,
    },
    generated_pdf_url: {
      type: String,
    },

    // Version metadata
    is_major_version: {
      type: Boolean,
      default: false, // Major vs minor version
    },
    is_auto_save: {
      type: Boolean,
      default: false, // Auto-saved vs manual save
    },

    // Audit
    created_by: {
      type: String,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

// Add unique compound index for version number per contract
contractVersionSchema.index(
  { contract_id: 1, version_number: 1 },
  { unique: true }
);

// Other indexes
contractVersionSchema.index({ contract_id: 1 });
contractVersionSchema.index({ created_at: 1 });
// Index for finding current version of a contract
contractVersionSchema.index({ contract_id: 1, is_current: 1 });

// Add plugins
contractVersionSchema.plugin(toJSON);
contractVersionSchema.plugin(paginate);

/**
 * @typedef ContractVersion
 */
const ContractVersion = mongoose.model(
  "ContractVersion",
  contractVersionSchema
);

module.exports = ContractVersion;
