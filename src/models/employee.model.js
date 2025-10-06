const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const employeeSchema = mongoose.Schema(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    id_number: {
      type: Number,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    seniority: {
      type: String,
      trim: true,
    },
    hourly_salary: {
      type: Number,
    },
    employee_until: {
      type: Date,
    },
    employee_from: {
      type: Date,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
employeeSchema.plugin(toJSON);

/**
 * @typedef Employee
 */
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
