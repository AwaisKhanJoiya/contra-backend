const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const employeeContractSchema = mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      ref: "Employee",
      index: true,
    },
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Contract",
      index: true,
    },
    assigned_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
employeeContractSchema.plugin(toJSON);

// Create a compound index for employee_id and contract_id to ensure uniqueness
employeeContractSchema.index(
  { employee_id: 1, contract_id: 1 },
  { unique: true }
);

/**
 * @typedef EmployeeContract
 */
const EmployeeContract = mongoose.model(
  "EmployeeContract",
  employeeContractSchema
);

module.exports = EmployeeContract;
