const mongoose = require('mongoose');
const HTTP_METHODS = require('../constants/httpMethods');
const SECURITY_TYPES = require('../constants/securityTypes');
const { SCAN_STATUS_VALUES, SCAN_STATUS } = require('../constants/scanStatus');
const { ANALYSIS_STATUS_VALUES, ANALYSIS_STATUS } = require('../constants/analysisStatus');

const ParameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    enum: ['query', 'path', 'header', 'cookie'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'string'
  }
}, { _id: false });

const EndpointSchema = new mongoose.Schema({
  endpointId: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: HTTP_METHODS,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  operationId: {
    type: String,
    default: ''
  },
  tags: [String],
  requiresAuth: {
    type: Boolean,
    default: false
  },
  securityType: {
    type: String,
    enum: SECURITY_TYPES,
    default: 'None'
  },
  parameters: [ParameterSchema],
  requestBodyPresent: {
    type: Boolean,
    default: false
  },
  responseCodes: [String],
  riskScore: {
    type: Number,
    default: 0
  },
  issues: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  }
}, { _id: false });

const ScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  sourceType: {
    type: String,
    enum: ['upload', 'url'],
    required: true
  },
  sourceLocation: {
    type: String,
    required: true
  },
  apiTitle: {
    type: String,
    default: 'Untitled API'
  },
  apiVersion: {
    type: String,
    default: '1.0.0'
  },
  description: {
    type: String,
    default: ''
  },
  servers: [String],
  specVersion: {
    type: String,
    default: 'OpenAPI 3.0'
  },
  endpointCount: {
    type: Number,
    default: 0
  },
  scanDuration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: SCAN_STATUS_VALUES,
    default: SCAN_STATUS.PENDING
  },
  analysisStatus: {
    type: String,
    enum: ANALYSIS_STATUS_VALUES,
    default: ANALYSIS_STATUS.NOT_STARTED
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  authTypes: [String],
  rawSpec: {
    type: Object
  },
  endpoints: [EndpointSchema]
});

module.exports = mongoose.model('Scan', ScanSchema);
