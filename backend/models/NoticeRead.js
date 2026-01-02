const mongoose = require('mongoose');

const NoticeReadSchema = new mongoose.Schema(
  {
    noticeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one read record per user per notice
NoticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });

// Index for querying reads by organization
NoticeReadSchema.index({ orgId: 1, noticeId: 1 });

module.exports = mongoose.model('NoticeRead', NoticeReadSchema);
