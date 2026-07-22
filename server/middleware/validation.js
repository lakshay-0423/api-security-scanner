const { ValidationError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * Middleware to validate uploaded specification file.
 */
const validateScanUpload = (req, res, next) => {
  if (!req.file) {
    return next(new ValidationError('Please upload a specification file (JSON or YAML)'));
  }
  next();
};

/**
 * Middleware to validate spec URL import payload.
 */
const validateUrlImport = (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return next(new ValidationError('Please provide a specification URL'));
  }
  try {
    new URL(url);
  } catch (err) {
    return next(new ValidationError('Please provide a valid absolute URL'));
  }
  next();
};

/**
 * Middleware to validate MongoDB ObjectId parameters.
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ValidationError('Invalid scan ID format'));
  }
  next();
};

module.exports = {
  validateScanUpload,
  validateUrlImport,
  validateObjectId
};
