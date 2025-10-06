const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const contractValidation = require("../../validations/contract.validation");
const contractController = require("../../controllers/contract.controller");

const router = express.Router();

// Contract routes
router
  .route("/")
  .get(auth(), contractController.getUserContracts)
  .post(
    auth(),
    validate(contractValidation.createContract),
    contractController.createContract
  );

router
  .route("/:contractId")
  .get(
    auth(),
    validate(contractValidation.getContract),
    contractController.getContract
  )
  .patch(
    auth(),
    validate(contractValidation.updateContract),
    contractController.updateContract
  )
  .delete(
    auth(),
    validate(contractValidation.deleteContract),
    contractController.deleteContract
  );

router
  .route("/:contractId/archive")
  .post(
    auth(),
    validate(contractValidation.getContract),
    contractController.archiveContract
  );

// Contract versions routes
router
  .route("/:contractId/versions")
  .get(
    auth(),
    validate(contractValidation.getContract),
    contractController.getContractVersions
  )
  .post(
    auth(),
    validate(contractValidation.createContractVersion),
    contractController.createContractVersion
  );

router
  .route("/:contractId/versions/:versionId/restore")
  .post(
    auth(),
    validate(contractValidation.restoreContractVersion),
    contractController.restoreContractVersion
  );

// Contract signatures routes
router
  .route("/:contractId/signatures")
  .get(
    auth(),
    validate(contractValidation.getContract),
    contractController.getContractSignatures
  )
  .post(
    auth(),
    validate(contractValidation.addContractSignature),
    contractController.addContractSignature
  );

// Contract templates routes
router
  .route("/templates")
  .get(auth(), contractController.getContractTemplates)
  .post(
    auth(),
    validate(contractValidation.createContractTemplate),
    contractController.createContractTemplate
  );

router
  .route("/templates/:templateId")
  .get(
    auth(),
    validate(contractValidation.getContractTemplate),
    contractController.getContractTemplate
  )
  .patch(
    auth(),
    validate(contractValidation.updateContractTemplate),
    contractController.updateContractTemplate
  )
  .delete(
    auth(),
    validate(contractValidation.deleteContractTemplate),
    contractController.deleteContractTemplate
  );

module.exports = router;
