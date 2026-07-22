const Scan = require('../models/Scan');
const { SCAN_STATUS } = require('../constants/scanStatus');
const { ANALYSIS_STATUS } = require('../constants/analysisStatus');
const { ScanNotFoundError, UnauthorizedScanAccessError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Creates and persists a completed scan record in MongoDB.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated User ID
 * @param {string} params.fileName - Name of the file or source
 * @param {string} params.sourceType - 'upload' | 'url'
 * @param {string} params.sourceLocation - File path or URL
 * @param {Object} params.parsedData - Parsed specification payload from parserService
 * @param {number} params.duration - Scan duration in milliseconds
 * @returns {Promise<Object>} Persisted Mongoose Scan document
 */
async function createScanRecord({ userId, fileName, sourceType, sourceLocation, parsedData, duration }) {
  const newScan = new Scan({
    userId,
    fileName,
    sourceType,
    sourceLocation,
    apiTitle: parsedData.apiTitle,
    apiVersion: parsedData.apiVersion,
    description: parsedData.description,
    servers: parsedData.servers,
    specVersion: parsedData.specVersion,
    endpointCount: parsedData.endpointCount,
    scanDuration: duration,
    status: SCAN_STATUS.COMPLETED,
    analysisStatus: ANALYSIS_STATUS.NOT_STARTED,
    authTypes: parsedData.authTypes,
    rawSpec: parsedData.rawSpec,
    endpoints: parsedData.endpoints
  });

  await newScan.save();
  logger.info(`Scan record created successfully ID: ${newScan._id} for User: ${userId}`);
  return newScan;
}

/**
 * Creates and persists a failed scan record in MongoDB.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated User ID
 * @param {string} params.fileName - Name of the file or source
 * @param {string} params.sourceType - 'upload' | 'url'
 * @param {string} params.sourceLocation - File path or URL
 * @param {number} params.duration - Elapsed time before failure
 * @param {string} params.errorMessage - Error description
 * @returns {Promise<Object>} Persisted failed Scan document
 */
async function createFailedScanRecord({ userId, fileName, sourceType, sourceLocation, duration, errorMessage }) {
  try {
    const failedScan = new Scan({
      userId,
      fileName,
      sourceType,
      sourceLocation,
      scanDuration: duration,
      status: SCAN_STATUS.FAILED,
      analysisStatus: ANALYSIS_STATUS.FAILED,
      description: `Failed to parse: ${errorMessage}`
    });

    await failedScan.save();
    logger.warn(`Failed scan logged ID: ${failedScan._id} for User: ${userId}`);
    return failedScan;
  } catch (err) {
    logger.error(`Error saving failed scan record to database: ${err.message}`);
    return null;
  }
}

/**
 * Retrieves scan reports for a specific user ordered by upload date.
 *
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<Array>} List of scan summaries
 */
async function getUserScans(userId) {
  return await Scan.find({ userId })
    .select('-rawSpec -endpoints')
    .sort({ uploadedAt: -1 });
}

/**
 * Retrieves a single scan document by ID and validates ownership.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<Object>} Scan document
 * @throws {ScanNotFoundError|UnauthorizedScanAccessError}
 */
async function getScanByIdAndUser(scanId, userId) {
  const scan = await Scan.findById(scanId);

  if (!scan) {
    throw new ScanNotFoundError();
  }

  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  return scan;
}

/**
 * Deletes a scan document by ID after validating ownership.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<boolean>} True if deleted
 * @throws {ScanNotFoundError|UnauthorizedScanAccessError}
 */
async function deleteScanByIdAndUser(scanId, userId) {
  const scan = await Scan.findById(scanId);

  if (!scan) {
    throw new ScanNotFoundError();
  }

  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  await Scan.deleteOne({ _id: scanId });
  logger.info(`Scan record ${scanId} deleted by user ${userId}`);
  return true;
}

module.exports = {
  createScanRecord,
  createFailedScanRecord,
  getUserScans,
  getScanByIdAndUser,
  deleteScanByIdAndUser
};
