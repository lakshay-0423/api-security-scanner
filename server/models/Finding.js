const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true
  },
  endpointId: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  recommendation: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Finding', FindingSchema);
