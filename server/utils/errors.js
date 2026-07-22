/**
 * Base Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request / Validation Failure Error
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * 400 OpenAPI / Swagger Parsing Error
 */
class ParseError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * 404 Resource Not Found Error
 */
class ScanNotFoundError extends AppError {
  constructor(message = 'Scan report not found') {
    super(message, 404);
  }
}

/**
 * 403 Forbidden Access Error
 */
class UnauthorizedScanAccessError extends AppError {
  constructor(message = 'Access denied: You do not own this scan report') {
    super(message, 403);
  }
}

/**
 * 400 External Download Error
 */
class DownloadError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  ValidationError,
  ParseError,
  ScanNotFoundError,
  UnauthorizedScanAccessError,
  DownloadError
};
