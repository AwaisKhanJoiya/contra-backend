const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createContract = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    contract_type: Joi.string().required(),
    form_data: Joi.object().required(),
    content: Joi.string().required(),
    variable_data: Joi.object(),
    field_mappings: Joi.object(),
    status: Joi.string().valid(
      "draft",
      "incomplete",
      "ready",
      "signed",
      "archived",
      "pending_signature",
      "published"
    ),
    completion_percentage: Joi.number().min(0).max(100),
    template_id: Joi.string().custom(objectId),
    metadata: Joi.object(),
    // Other fields can be added as needed
  }),
};

const getContract = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
  }),
};

const updateContract = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      contract_type: Joi.string(),
      form_data: Joi.object(),
      content: Joi.string(),
      variable_data: Joi.object(),
      field_mappings: Joi.object(),
      status: Joi.string().valid(
        "draft",
        "incomplete",
        "ready",
        "signed",
        "archived",
        "pending_signature",
        "published"
      ),
      completion_percentage: Joi.number().min(0).max(100),
      validation_status: Joi.string().valid("pending", "valid", "invalid"),
      validation_errors: Joi.array(),
      metadata: Joi.object(),
      template_id: Joi.string().custom(objectId),
      version: Joi.number(),
      // Other fields can be added as needed
    })
    .min(1),
};

const deleteContract = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
  }),
};

const createContractVersion = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
    form_data: Joi.object(),
    name: Joi.string(),
    change_description: Joi.string(),
    metadata: Joi.object(),
  }),
};

const restoreContractVersion = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
    versionId: Joi.string().custom(objectId).required(),
  }),
};

const addContractSignature = {
  params: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    signature_url: Joi.string().required(),
    signer_name: Joi.string().required(),
    signer_email: Joi.string().email().required(),
    status: Joi.string().valid("pending", "completed", "rejected", "expired"),
    metadata: Joi.object(),
  }),
};

const createContractTemplate = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    content: Joi.string().required(),
    contract_type: Joi.string().required(),
    variables: Joi.object(),
    metadata: Joi.object(),
    status: Joi.string().valid("draft", "published", "archived"),
  }),
};

const getContractTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId).required(),
  }),
};

const updateContractTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      content: Joi.string(),
      contract_type: Joi.string(),
      variables: Joi.object(),
      metadata: Joi.object(),
      status: Joi.string().valid("draft", "published", "archived"),
    })
    .min(1),
};

const deleteContractTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  createContractVersion,
  restoreContractVersion,
  createContractTemplate,
  getContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  addContractSignature,
};
