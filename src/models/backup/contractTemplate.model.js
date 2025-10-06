const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractTemplateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "freelance",
        "employment",
        "nda",
        "partnership",
        "customer",
        "website_documents",
      ],
    },
    language: {
      type: String,
      default: "he",
      enum: ["he", "en"],
    },
    version: {
      type: String,
      default: "1.0",
    },

    // Template structure (full ContractTemplate object)
    template_data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Metadata
    description: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_public: {
      type: Boolean,
      default: true, // Public templates available to all users
    },

    // Audit fields
    created_by: {
      type: String,
      ref: "User",
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
contractTemplateSchema.plugin(toJSON);
contractTemplateSchema.plugin(paginate);

/**
 * @typedef ContractTemplate
 */
const ContractTemplate = mongoose.model(
  "ContractTemplate",
  contractTemplateSchema
);

module.exports = ContractTemplate;
