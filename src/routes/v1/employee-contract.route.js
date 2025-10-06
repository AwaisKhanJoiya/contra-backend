const express = require("express");
const auth = require("../../middlewares/auth");
const employeeController = require("../../controllers/employee.controller");

const router = express.Router();

// This is a simplified endpoint specifically for the frontend to get all employee contracts
router.route("/").get(auth(), employeeController.getEmployeeContracts);

module.exports = router;
