const httpStatus = require("http-status");
const mongoose = require("mongoose");
const {
  Contract,
  ContractVersion,
  ContractTemplate,
  ContractSignature,
} = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Get user contracts with filtering and pagination
 * @param {string} userId
 * @param {Object} filter - Filter options
 * @param {Object} options - Pagination options
 * @returns {Promise<{contracts: Contract[], totalCount: number}>}
 */
const getUserContracts = async (userId, filter = {}, options = {}) => {
  const { status, contract_type, search, sort_by, sort_order } = filter;
  const { page = 1, limit = 10 } = options;

  const query = {
    user_id: userId,
    is_template: false,
  };

  // Apply filters
  if (status && status !== "all") {
    query.status = status;
  } else {
    query.status = { $ne: "archived" };
  }

  if (contract_type) {
    query.contract_type = contract_type;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Sorting
  let sortOptions = {};
  if (sort_by) {
    sortOptions[sort_by] = sort_order === "desc" ? -1 : 1;
  } else {
    sortOptions = { created_at: -1 }; // Default sort by creation date desc
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [contracts, totalCount] = await Promise.all([
    Contract.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
    Contract.countDocuments(query),
  ]);

  return {
    contracts,
    totalCount,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / limit),
  };
};

/**
 * Get contract by id with related data
 * @param {string} id
 * @param {Object} options - Options to include related data
 * @returns {Promise<Contract>}
 */
const getContractById = async (id, options = {}) => {
  const { includeVersions = false, includeSignatures = false } = options;

  // Check if id is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const contract = await Contract.findById(id);

  if (!contract) {
    return null;
  }

  // Include related data if requested
  const result = contract.toJSON();

  if (includeVersions) {
    result.versions = await ContractVersion.find({ contract_id: id })
      .sort({ version_number: -1 })
      .exec();
  }

  if (includeSignatures) {
    result.signatures = await ContractSignature.find({
      contract_id: id,
    }).exec();
  }

  return result;
};

/**
 * Create contract
 * @param {Object} contractBody
 * @returns {Promise<Contract>}
 */
const createContract = async (contractBody) => {
  // Set default status if not provided
  if (!contractBody.status) {
    contractBody.status = "draft";
  }

  // If there's a template_id, get the template content
  if (
    contractBody.template_id &&
    mongoose.Types.ObjectId.isValid(contractBody.template_id)
  ) {
    const template = await ContractTemplate.findById(contractBody.template_id);
    if (template) {
      contractBody.content = template.content;
      contractBody.contract_type = template.contract_type;
      // Can also copy variables or other template data as needed
    }
  }

  const contract = await Contract.create(contractBody);

  // Create initial version if content is provided
  if (contract.content) {
    await ContractVersion.create({
      contract_id: contract._id,
      user_id: contract.user_id,
      version_number: 1,
      content: contract.content,
      form_data: contract.form_data || {},
      name: "Initial version",
      change_description: "Contract created",
    });
  }

  return contract;
};

/**
 * Update contract by id
 * @param {string} contractId
 * @param {Object} updateBody
 * @param {boolean} createVersion - Whether to create a new version
 * @returns {Promise<Contract>}
 */
const updateContractById = async (
  contractId,
  updateBody,
  createVersion = false
) => {
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Create a new version if requested and content is provided
  if (createVersion && updateBody.content) {
    // Get latest version number
    const latestVersion = await ContractVersion.findOne({
      contract_id: contractId,
    })
      .sort({ version_number: -1 })
      .exec();

    const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    await ContractVersion.create({
      contract_id: contractId,
      user_id: updateBody.user_id || contract.user_id,
      version_number: versionNumber,
      content: updateBody.content,
      form_data: updateBody.form_data || contract.form_data || {},
      name: updateBody.version_name || `Version ${versionNumber}`,
      change_description: updateBody.change_description || "",
      metadata: updateBody.metadata || {},
    });

    // Update contract's version number
    updateBody.version = versionNumber;
  }

  // Update the contract
  Object.assign(contract, updateBody);
  await contract.save();
  return contract;
};

/**
 * Delete contract by id
 * @param {string} contractId
 * @returns {Promise<Contract>}
 */
const deleteContractById = async (contractId) => {
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Soft delete by setting status to archived
  contract.status = "archived";
  await contract.save();
  return contract;
};

/**
 * Hard delete contract by id (including all related data)
 * @param {string} contractId
 * @returns {Promise<boolean>}
 */
const hardDeleteContractById = async (contractId) => {
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Delete all related versions and signatures
  await ContractVersion.deleteMany({ contract_id: contractId });
  await ContractSignature.deleteMany({ contract_id: contractId });

  // Delete the contract itself
  await Contract.deleteOne({ _id: contractId });

  return true;
};

/**
 * Create contract version
 * @param {Object} versionData
 * @returns {Promise<ContractVersion>}
 */
const createContractVersion = async (versionData) => {
  const { contract_id, user_id, content, form_data, name, change_description } =
    versionData;

  // Validate contract exists
  const contract = await getContractById(contract_id);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  // Get latest version number
  const latestVersion = await ContractVersion.findOne({ contract_id })
    .sort({ version_number: -1 })
    .exec();

  const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

  // Create version
  const version = await ContractVersion.create({
    contract_id,
    user_id,
    version_number: versionNumber,
    content,
    form_data: form_data || {},
    name: name || `Version ${versionNumber}`,
    change_description: change_description || "",
    metadata: versionData.metadata || {},
  });

  // Update contract's version number
  await Contract.findByIdAndUpdate(contract_id, {
    version: versionNumber,
    content, // Update content in main contract too
    form_data: form_data || contract.form_data,
  });

  return version;
};

/**
 * Get contract versions
 * @param {string} contractId
 * @returns {Promise<ContractVersion[]>}
 */
const getContractVersions = async (contractId) => {
  return ContractVersion.find({ contract_id: contractId })
    .sort({ version_number: -1 })
    .exec();
};

/**
 * Get contract version by id
 * @param {string} versionId
 * @returns {Promise<ContractVersion>}
 */
const getContractVersionById = async (versionId) => {
  return ContractVersion.findById(versionId);
};

/**
 * Restore contract version
 * @param {string} contractId
 * @param {string} versionId
 * @returns {Promise<Contract>}
 */
const restoreContractVersion = async (contractId, versionId) => {
  const [contract, version] = await Promise.all([
    getContractById(contractId),
    ContractVersion.findById(versionId),
  ]);

  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  if (!version || version.contract_id.toString() !== contractId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Version not found for this contract"
    );
  }

  // Update contract with version content
  contract.content = version.content;
  contract.form_data = version.form_data;

  // Save contract
  await contract.save();

  return contract;
};

/**
 * Create contract template
 * @param {Object} templateData
 * @returns {Promise<ContractTemplate>}
 */
const createContractTemplate = async (templateData) => {
  return ContractTemplate.create(templateData);
};

/**
 * Get contract templates
 * @param {Object} filter
 * @returns {Promise<ContractTemplate[]>}
 */
const getContractTemplates = async (filter = {}) => {
  const query = {};

  if (filter.contract_type) {
    query.contract_type = filter.contract_type;
  }

  if (filter.status) {
    query.status = filter.status;
  } else {
    query.status = "published";
  }

  if (filter.user_id) {
    query.$or = [{ is_system: true }, { user_id: filter.user_id }];
  } else {
    query.is_system = true;
  }

  return ContractTemplate.find(query).sort({ created_at: -1 });
};

/**
 * Get contract template by id
 * @param {string} templateId
 * @returns {Promise<ContractTemplate>}
 */
const getContractTemplateById = async (templateId) => {
  return ContractTemplate.findById(templateId);
};

/**
 * Update contract template
 * @param {string} templateId
 * @param {Object} updateBody
 * @returns {Promise<ContractTemplate>}
 */
const updateContractTemplateById = async (templateId, updateBody) => {
  const template = await getContractTemplateById(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, "Template not found");
  }

  Object.assign(template, updateBody);
  await template.save();
  return template;
};

/**
 * Delete contract template
 * @param {string} templateId
 * @returns {Promise<ContractTemplate>}
 */
const deleteContractTemplateById = async (templateId) => {
  const template = await getContractTemplateById(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, "Template not found");
  }

  // Hard delete
  await ContractTemplate.deleteOne({ _id: templateId });
  return template;
};

/**
 * Archive contract by id (soft delete)
 * @param {string} contractId
 * @returns {Promise<Contract>}
 */
const archiveContractById = async (contractId) => {
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  contract.status = "archived";
  await contract.save();
  return contract;
};

module.exports = {
  getUserContracts,
  getContractById,
  createContract,
  updateContractById,
  archiveContractById,
  deleteContractById: archiveContractById, // alias for compatibility
  hardDeleteContractById,
  createContractVersion,
  getContractVersions,
  getContractVersionById,
  restoreContractVersion,
  createContractTemplate,
  getContractTemplates,
  getContractTemplateById,
  updateContractTemplateById,
  deleteContractTemplateById,
};
