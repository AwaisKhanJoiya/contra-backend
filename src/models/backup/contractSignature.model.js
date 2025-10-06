const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractSignatureSchema = mongoose.Schema(
  {
    // Association
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    version_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractVersion", // Which version was signed
    },

    // Signature details
    signer_type: {
      type: String,
      required: true,
      enum: ["client", "freelancer", "witness", "other"],
    },
    signer_name: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "Signer name is required",
      },
    },
    signer_email: {
      type: String,
    },
    signer_id_number: {
      type: String,
    },

    // Signature data
    signature_image_url: {
      type: String,
    },
    signature_data: {
      type: mongoose.Schema.Types.Mixed, // Raw signature data from SignaturePad
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },

    // Legal verification
    verification_method: {
      type: String, // 'email', 'sms', 'id_verification'
    },
    verification_data: {
      type: mongoose.Schema.Types.Mixed,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    signed_at: {
      type: Date,
      default: Date.now,
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
contractSignatureSchema.index({ contract_id: 1 });
contractSignatureSchema.index({ signer_type: 1 });
contractSignatureSchema.index({ signed_at: 1 });

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
