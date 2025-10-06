const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const employeeValidation = require("../../validations/employee.validation");
const employeeController = require("../../controllers/employee.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(employeeValidation.createEmployee),
    employeeController.createEmployee
  )
  .get(
    auth(),
    validate(employeeValidation.getEmployees),
    employeeController.getEmployees
  );

router
  .route("/:employeeId")
  .get(
    auth(),
    validate(employeeValidation.getEmployee),
    employeeController.getEmployee
  )
  .patch(
    auth(),
    validate(employeeValidation.updateEmployee),
    employeeController.updateEmployee
  )
  .delete(
    auth(),
    validate(employeeValidation.deleteEmployee),
    employeeController.deleteEmployee
  );

router
  .route("/:employeeId/contracts/:contractId")
  .post(
    auth(),
    validate(employeeValidation.assignContractToEmployee),
    employeeController.assignContractToEmployee
  )
  .delete(
    auth(),
    validate(employeeValidation.removeContractFromEmployee),
    employeeController.removeContractFromEmployee
  );

router
  .route("/contracts")
  .get(
    auth(),
    validate(employeeValidation.getEmployeeContracts),
    employeeController.getEmployeeContracts
  );

router
  .route("/:employeeId/contracts")
  .get(
    auth(),
    validate(employeeValidation.getEmployeeContracts),
    employeeController.getEmployeeContracts
  );

module.exports = router;
