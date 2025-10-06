const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractSignatureSchema = mongoose.Schema(
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
    signature_url: {
      type: String,
      required: true,
    },
    signature_date: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    signer_name: {
      type: String,
      required: true,
    },
    signer_email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "expired"],
      default: "completed",
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
contractSignatureSchema.plugin(toJSON);
contractSignatureSchema.plugin(paginate);

/**
 * @typedef ContractSignature
 */
const ContractSignature = mongoose.model(
  "ContractSignature",
  contractSignatureSchema
);

module.exports = ContractSignature;
