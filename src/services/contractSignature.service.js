const httpStatus = require("http-status");
const mongoose = require("mongoose");
const { ContractSignature, Contract } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Get signatures for a contract
 * @param {string} contractId
 * @returns {Promise<ContractSignature[]>}
 */
const getContractSignatures = async (contractId) => {
  // Check if contractId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid contract ID format");
  }

  return ContractSignature.find({ contract_id: contractId }).sort({
    created_at: -1,
  });
};

/**
 * Add signature to a contract
 * @param {string} contractId
 * @param {Object} signatureData
 * @returns {Promise<ContractSignature>}
 */
const addContractSignature = async (contractId, userId, signatureData) => {
  // Check if contractId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid contract ID format");
  }

  // Check if contract exists and belongs to user
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Create signature object
  const signature = await ContractSignature.create({
    ...signatureData,
    contract_id: contractId,
    user_id: userId,
  });

  // Update contract status to signed if necessary
  if (signatureData.status === "completed") {
    await Contract.findByIdAndUpdate(contractId, {
      status: "signed",
    });
  }

  return signature;
};

module.exports = {
  getContractSignatures,
  addContractSignature,
};
