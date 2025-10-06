const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const auditLogEntrySchema = mongoose.Schema({
  instance_id: String,
  payload: mongoose.Schema.Types.Mixed,
  ip_address: {
    type: String,
    required: true,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Add plugins
auditLogEntrySchema.plugin(toJSON);
auditLogEntrySchema.plugin(paginate);

/**
 * @typedef AuditLogEntry
 */
const AuditLogEntry = mongoose.model("AuditLogEntry", auditLogEntrySchema);

module.exports = AuditLogEntry;
