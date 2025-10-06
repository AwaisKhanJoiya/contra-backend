const httpStatus = require("http-status");
const { Employee, EmployeeContract, Contract } = require("../models");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/**
 * Create a new employee
 * @param {Object} employeeBody
 * @returns {Promise<Employee>}
 */
const createEmployee = async (employeeBody) => {
  return Employee.create(employeeBody);
};

/**
 * Query for employees
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryEmployees = async (filter, options) => {
  const employees = await Employee.find(filter, null, options);
  return employees;
};

/**
 * Get employee by id
 * @param {ObjectId} id
 * @returns {Promise<Employee>}
 */
const getEmployeeById = async (id) => {
  return Employee.findById(id);
};

/**
 * Update employee by id
 * @param {ObjectId} employeeId
 * @param {Object} updateBody
 * @returns {Promise<Employee>}
 */
const updateEmployeeById = async (employeeId, updateBody) => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }
  Object.assign(employee, updateBody);
  await employee.save();
  return employee;
};

/**
 * Delete employee by id
 * @param {ObjectId} employeeId
 * @returns {Promise<Employee>}
 */
const deleteEmployeeById = async (employeeId) => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }
  // Delete all employee-contract associations
  await EmployeeContract.deleteMany({ employee_id: employeeId });
  // Delete the employee
  await employee.remove();
  return employee;
};

/**
 * Create an employee-contract association
 * @param {Object} employeeContractBody
 * @returns {Promise<EmployeeContract>}
 */
const createEmployeeContract = async (employeeContractBody) => {
  // Verify employee exists
  const employee = await Employee.findById(employeeContractBody.employee_id);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // Verify contract exists
  const contract = await Contract.findById(employeeContractBody.contract_id);
  if (!contract) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contract not found");
  }

  return EmployeeContract.create(employeeContractBody);
};

/**
 * Query employee contracts with populated employee and contract data
 * @param {Object} filter - MongoDB filter
 * @returns {Promise<EmployeeContract[]>}
 */
const getEmployeeContracts = async (filter) => {
  return EmployeeContract.find(filter)
    .populate("employee_id")
    .populate("contract_id");
};

/**
 * Delete an employee-contract association
 * @param {Object} filter - Filter criteria to find the association
 * @returns {Promise<EmployeeContract>}
 */
const deleteEmployeeContract = async (filter) => {
  const employeeContract = await EmployeeContract.findOne(filter);
  if (!employeeContract) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Employee-contract association not found"
    );
  }
  await employeeContract.remove();
  return employeeContract;
};

module.exports = {
  createEmployee,
  queryEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  createEmployeeContract,
  getEmployeeContracts,
  deleteEmployeeContract,
};
