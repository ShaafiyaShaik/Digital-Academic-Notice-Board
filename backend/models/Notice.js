const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noticeType: {
      type: String,
      enum: ["admin", "subject"],
      default: "admin",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "academic", "events"],
      default: "general",
    },
    // For subject notices
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      sparse: true,
    },
    // For subject notices: which classes it targets
    targetClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    date: { type: String, required: true },
    urgent: { type: Boolean, default: false },
    file: { type: String },
  },
  { timestamps: true }
);

NoticeSchema.index({ orgId: 1, createdAt: -1 });
NoticeSchema.index({ orgId: 1, noticeType: 1 });
NoticeSchema.index({ orgId: 1, 'targetClassIds': 1 });


module.exports = mongoose.model("Notice", NoticeSchema);
