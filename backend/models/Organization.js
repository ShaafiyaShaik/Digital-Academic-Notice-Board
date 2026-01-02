const mongoose = require('mongoose');

const OrgSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  orgCode: { type: String, required: true, unique: true, index: true },
  address: { type: String },
  logoUrl: { type: String },
  settings: {
    themeColor: { type: String, default: '#2b6cb0' },
    allowPublicBoard: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Organization', OrgSchema);
