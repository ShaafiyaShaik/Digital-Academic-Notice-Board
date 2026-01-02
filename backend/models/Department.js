const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      // e.g., "Computer Science Engineering", "Electronics and Communication", "Information Technology"
    },
    code: {
      type: String,
      required: true,
      // e.g., "CSE", "ECE", "IT"
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure unique department code per organization
DepartmentSchema.index({ orgId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
