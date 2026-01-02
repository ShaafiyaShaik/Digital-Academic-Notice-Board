const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      // 1, 2, 3, 4 (or custom)
    },
    section: {
      type: String,
      required: true,
      // A, B, C, etc.
    },
    name: {
      type: String,
      required: true,
      // e.g., "CSE-3rd Year-A" (auto-generated from department + year + section)
    },
  },
  { timestamps: true }
);

// Ensure unique class per organization
ClassSchema.index({ orgId: 1, departmentId: 1, year: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
