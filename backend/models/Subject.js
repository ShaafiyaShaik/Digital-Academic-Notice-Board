const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
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
    },
    name: {
      type: String,
      required: true,
      // e.g., "Database Management Systems", "Operating Systems", "Mathematics"
    },
    code: {
      type: String,
      required: true,
      // e.g., "DBMS", "OS", "MATH101"
    },
    year: {
      type: Number,
      required: true,
      // e.g., 1, 2, 3, 4 (year of study)
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure unique subject code per organization and department
SubjectSchema.index({ orgId: 1, departmentId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
