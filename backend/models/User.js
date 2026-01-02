const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'faculty', 'teacher', 'librarian', 'admin'],
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    // For students: their enrolled class
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      sparse: true,
    },
    // For admins: their level and department (if dept admin)
    adminLevel: {
      type: String,
      enum: ['SUPER_ADMIN', 'DEPT_ADMIN', 'ACADEMIC_ADMIN'],
      sparse: true, // Only for admins
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      sparse: true, // Only for dept admins
    },
  },
  { timestamps: true }
);

UserSchema.index({ orgId: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
