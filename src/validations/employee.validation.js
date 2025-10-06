const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createEmployee = {
  body: Joi.object().keys({
    full_name: Joi.string().required(),
    position: Joi.string(),
    gender: Joi.string(),
    id_number: Joi.number(),
    address: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    seniority: Joi.string(),
    hourly_salary: Joi.number(),
    employee_until: Joi.date(),
    employee_from: Joi.date().required(),
  }),
};

const getEmployees = {
  query: Joi.object().keys({
    position: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getEmployee = {
  params: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
  }),
};

const updateEmployee = {
  params: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      full_name: Joi.string(),
      position: Joi.string(),
      gender: Joi.string(),
      id_number: Joi.number(),
      address: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
      seniority: Joi.string(),
      hourly_salary: Joi.number(),
      employee_until: Joi.date(),
      employee_from: Joi.date(),
    })
    .min(1),
};

const deleteEmployee = {
  params: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
  }),
};

const assignContractToEmployee = {
  params: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
    contractId: Joi.string().required().custom(objectId),
  }),
};

const getEmployeeContracts = {
  params: Joi.object().keys({
    employeeId: Joi.string().custom(objectId),
  }),
};

const removeContractFromEmployee = {
  params: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
    contractId: Joi.string().required().custom(objectId),
  }),
};

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
