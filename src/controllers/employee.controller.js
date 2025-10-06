const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { employeeService } = require("../services");
const ApiError = require("../utils/ApiError");

/**
 * Create a new employee
 */
const createEmployee = catchAsync(async (req, res) => {
  // Attach the business ID (user ID) to the employee data
  const employeeData = { ...req.body, business_id: req.user.id };
  const employee = await employeeService.createEmployee(employeeData);
  res.status(httpStatus.CREATED).send(employee);
});

/**
 * Get all employees for the current business
 */
const getEmployees = catchAsync(async (req, res) => {
  // Get employees filtered by the current user's business ID
  const employees = await employeeService.queryEmployees({
    business_id: req.user.id,
  });
  res.send({ employees });
});

/**
 * Get employee by ID
 */
const getEmployee = catchAsync(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // Verify employee belongs to this business
  if (employee.business_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to access this employee"
    );
  }

  res.send(employee);
});

/**
 * Update employee
 */
const updateEmployee = catchAsync(async (req, res) => {
  // First verify the employee belongs to this business
  const employee = await employeeService.getEmployeeById(req.params.employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  if (employee.business_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this employee"
    );
  }

  const updatedEmployee = await employeeService.updateEmployeeById(
    req.params.employeeId,
    req.body
  );
  res.send(updatedEmployee);
});

/**
 * Delete employee
 */
const deleteEmployee = catchAsync(async (req, res) => {
  // First verify the employee belongs to this business
  const employee = await employeeService.getEmployeeById(req.params.employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  if (employee.business_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this employee"
    );
  }

  await employeeService.deleteEmployeeById(req.params.employeeId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Assign contract to employee
 */
const assignContractToEmployee = catchAsync(async (req, res) => {
  const { employeeId, contractId } = req.params;

  // First verify the employee belongs to this business
  const employee = await employeeService.getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  if (employee.business_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this employee"
    );
  }

  // Create the employee-contract association
  const employeeContract = await employeeService.createEmployeeContract({
    employee_id: employeeId,
    contract_id: contractId,
  });

  res.status(httpStatus.CREATED).send(employeeContract);
});

/**
 * Get employee contracts
 */
const getEmployeeContracts = catchAsync(async (req, res) => {
  // Get all employee contracts for the current user's business
  const filter = {};

  if (req.params.employeeId) {
    filter.employee_id = req.params.employeeId;
  }

  const employeeContracts = await employeeService.getEmployeeContracts(filter);

  // Filter to only include employees from this business
  const authorizedContracts = employeeContracts.filter(
    (ec) => ec.employee_id && ec.employee_id.business_id === req.user.id
  );

  res.send({ employeeContracts: authorizedContracts });
});

/**
 * Remove contract from employee
 */
const removeContractFromEmployee = catchAsync(async (req, res) => {
  const { employeeId, contractId } = req.params;

  // First verify the employee belongs to this business
  const employee = await employeeService.getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  if (employee.business_id !== req.user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this employee"
    );
  }

  await employeeService.deleteEmployeeContract({
    employee_id: employeeId,
    contract_id: contractId,
  });

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  assignContractToEmployee,
  getEmployeeContracts,
  removeContractFromEmployee,
};
