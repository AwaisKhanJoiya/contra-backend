const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractVersionSchema = mongoose.Schema(
  {
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    version_number: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    form_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    name: {
      type: String,
      default: "",
    },
    change_description: {
      type: String,
      default: "",
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
