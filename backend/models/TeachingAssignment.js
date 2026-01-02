const mongoose = require('mongoose');

const TeachingAssignmentSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    // e.g., "Mr. Ravi teaches DBMS to CSE-3A and CSE-3B"
    // One teacher can have multiple teaching assignments
    // One subject can be taught by multiple teachers
    // One class can have multiple teachers (different subjects)
  },
  { timestamps: true }
);

// Index for querying teacher's assignments
TeachingAssignmentSchema.index({ orgId: 1, teacherId: 1 });
// Index for querying subject's teachers
TeachingAssignmentSchema.index({ orgId: 1, subjectId: 1 });
// Index for querying class's teachers
TeachingAssignmentSchema.index({ orgId: 1, 'classIds': 1 });

module.exports = mongoose.model('TeachingAssignment', TeachingAssignmentSchema);
