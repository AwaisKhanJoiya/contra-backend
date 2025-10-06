const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractTemplateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    contract_type: {
      type: String,
      required: true,
    },
    variables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    is_system: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: String,
      required: false,
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
