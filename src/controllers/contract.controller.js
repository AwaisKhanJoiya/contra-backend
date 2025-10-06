const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { contractService, contractSignatureService } = require("../services");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");

/**
 * Get user contracts with pagination and filtering
 */
const getUserContracts = catchAsync(async (req, res) => {
  // Extract filter and pagination options from query
  const filter = pick(req.query, [
    "status",
    "contract_type",
    "search",
    "sort_by",
    "sort_order",
  ]);
  const options = pick(req.query, ["page", "limit"]);

  const result = await contractService.getUserContracts(
    req.user.id,
    filter,
    options
  );
  res.send(result);
});

/**
 * Get contract by ID
 */
const getContract = catchAsync(async (req, res) => {
  // Extract options from query
  const options = {
    includeVersions: req.query.includeVersions === "true",
    includeSignatures: req.query.includeSignatures === "true",
  };

  const contract = await contractService.getContractById(
    req.params.contractId,
    options
  );
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to access this contract"
    );
  }

  res.send(contract);
});

/**
 * Create new contract
 */
const createContract = catchAsync(async (req, res) => {
  // Add user_id to the request body
  req.body.user_id = req.user.id;
  const contract = await contractService.createContract(req.body);
  res.status(httpStatus.CREATED).send(contract);
});

/**
 * Update contract
 */
const updateContract = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to modify this contract"
    );
  }

  // Add user_id to request body and check if we should create a new version
  req.body.user_id = req.user.id;
  const createVersion =
    req.query.createVersion === "true" || req.body.create_version === true;

  const updatedContract = await contractService.updateContractById(
    req.params.contractId,
    req.body,
    createVersion
  );
  res.send(updatedContract);
});

/**
 * Archive contract (soft delete)
 */
const archiveContract = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to archive this contract"
    );
  }

  await contractService.archiveContractById(req.params.contractId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Hard delete contract
 */
const deleteContract = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this contract"
    );
  }

  await contractService.hardDeleteContractById(req.params.contractId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get contract versions
 */
const getContractVersions = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to access this contract's versions"
    );
  }

  const versions = await contractService.getContractVersions(
    req.params.contractId
  );
  res.send(versions);
});

/**
 * Create contract version
 */
const createContractVersion = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to create a version for this contract"
    );
  }

  // Add required data
  req.body.contract_id = req.params.contractId;
  req.body.user_id = req.user.id;

  const version = await contractService.createContractVersion(req.body);
  res.status(httpStatus.CREATED).send(version);
});

/**
 * Restore contract version
 */
const restoreContractVersion = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to restore a version for this contract"
    );
  }

  const updatedContract = await contractService.restoreContractVersion(
    req.params.contractId,
    req.params.versionId
  );
  res.send(updatedContract);
});

/**
 * Get contract templates
 */
const getContractTemplates = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ["contract_type", "status"]),
    user_id: req.user.id,
  };

  const templates = await contractService.getContractTemplates(filter);
  res.send(templates);
});

/**
 * Get contract template by id
 */
const getContractTemplate = catchAsync(async (req, res) => {
  const template = await contractService.getContractTemplateById(
    req.params.templateId
  );
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract template not found");
  }

  // If not a system template, check ownership
  if (!template.is_system && template.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to access this template"
    );
  }

  res.send(template);
});

/**
 * Create contract template
 */
const createContractTemplate = catchAsync(async (req, res) => {
  // Add user_id to the template
  req.body.user_id = req.user.id;
  req.body.is_system = false; // Only admins can create system templates

  const template = await contractService.createContractTemplate(req.body);
  res.status(httpStatus.CREATED).send(template);
});

/**
 * Update contract template
 */
const updateContractTemplate = catchAsync(async (req, res) => {
  const template = await contractService.getContractTemplateById(
    req.params.templateId
  );
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract template not found");
  }

  // Check ownership
  if (template.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to modify this template"
    );
  }

  const updatedTemplate = await contractService.updateContractTemplateById(
    req.params.templateId,
    req.body
  );
  res.send(updatedTemplate);
});

/**
 * Delete contract template
 */
const deleteContractTemplate = catchAsync(async (req, res) => {
  const template = await contractService.getContractTemplateById(
    req.params.templateId
  );
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract template not found");
  }

  // Check ownership
  if (template.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this template"
    );
  }

  await contractService.deleteContractTemplateById(req.params.templateId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Contract signatures
const getContractSignatures = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to access this contract's signatures"
    );
  }

  const signatures = await contractSignatureService.getContractSignatures(
    req.params.contractId
  );
  res.send(signatures);
});

const addContractSignature = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(req.params.contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Check if the contract belongs to the user
  if (contract.user_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to add signatures to this contract"
    );
  }

  const signature = await contractSignatureService.addContractSignature(
    req.params.contractId,
    req.user.id,
    req.body
  );
  res.status(httpStatus.CREATED).send(signature);
});

module.exports = {
  getUserContracts,
  getContract,
  createContract,
  updateContract,
  archiveContract,
  deleteContract,
  getContractVersions,
  createContractVersion,
  restoreContractVersion,
  getContractTemplates,
  getContractTemplate,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  getContractSignatures,
  addContractSignature,
};
