const mongoose = require('mongoose');

const ReportSignatureSchema = new mongoose.Schema({
  preparedBy: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    signature: { type: String, default: '' }
  },
  verifiedBy: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    signature: { type: String, default: '' }
  },
  approvedBy: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    signature: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

const ReportSignature = mongoose.model('ReportSignature', ReportSignatureSchema);

module.exports = ReportSignature;
