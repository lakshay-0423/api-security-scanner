const Scan = require('../models/Scan');
const Finding = require('../models/Finding');
const analysisEngine = require('../analysis/analysisEngine');
const { ANALYSIS_STATUS } = require('../constants/analysisStatus');
const { ScanNotFoundError, UnauthorizedScanAccessError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Executes security analysis against a scan inventory using the modular Rule Engine.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<Object>} Summary of analysis execution results and persisted findings
 */
async function analyzeScan(scanId, userId) {
  logger.info(`Initiating security analysis for Scan ID: ${scanId} by User: ${userId}`);

  // 1. Fetch scan document and validate ownership
  const scan = await Scan.findById(scanId);
  if (!scan) {
    throw new ScanNotFoundError();
  }
  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  // 2. Set analysis status to running
  scan.analysisStatus = ANALYSIS_STATUS.RUNNING;
  await scan.save();

  try {
    // 3. Clear pre-existing findings for re-run idempotent behavior
    await Finding.deleteMany({ scanId });

    // 4. Run Modular Rule Engine
    const { findings: rawFindings, riskScore, findingCount } = analysisEngine.execute(scan);

    // 5. Persist Finding documents to MongoDB
    const findingDocs = rawFindings.map(f => ({
      scanId: scan._id,
      endpointId: f.endpointId || 'GLOBAL',
      ruleId: f.ruleId,
      category: f.category,
      title: f.title,
      description: f.description,
      severity: f.severity,
      recommendation: f.recommendation,
      reference: f.reference,
      status: 'open'
    }));

    if (findingDocs.length > 0) {
      await Finding.insertMany(findingDocs);
    }

    // 6. Update Scan metrics and set status to completed
    scan.riskScore = riskScore;
    scan.findingCount = findingCount;
    scan.lastAnalyzedAt = new Date();
    scan.analysisStatus = ANALYSIS_STATUS.COMPLETED;
    await scan.save();

    logger.info(`Security analysis successfully completed for Scan ID: ${scanId}. Risk Score: ${riskScore}, Findings: ${findingCount}`);

    return {
      scanId: scan._id,
      riskScore,
      findingCount,
      analysisStatus: scan.analysisStatus,
      lastAnalyzedAt: scan.lastAnalyzedAt
    };
  } catch (err) {
    scan.analysisStatus = ANALYSIS_STATUS.FAILED;
    await scan.save();
    logger.error(`Security analysis failed for Scan ID: ${scanId}: ${err.message}`, err.stack);
    throw err;
  }
}

/**
 * Retrieves stored security findings for a specific scan.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<Array>} List of Finding documents
 */
async function getScanFindings(scanId, userId) {
  const scan = await Scan.findById(scanId);
  if (!scan) {
    throw new ScanNotFoundError();
  }
  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  return await Finding.find({ scanId }).sort({ severity: 1, createdAt: -1 });
}

/**
 * Deletes stored security findings for a scan and resets analysis status.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<boolean>} True if cleared successfully
 */
async function deleteScanFindings(scanId, userId) {
  const scan = await Scan.findById(scanId);
  if (!scan) {
    throw new ScanNotFoundError();
  }
  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  await Finding.deleteMany({ scanId });
  scan.riskScore = 0;
  scan.findingCount = 0;
  scan.analysisStatus = ANALYSIS_STATUS.NOT_STARTED;
  await scan.save();

  logger.info(`Cleared all findings for Scan ID: ${scanId}`);
  return true;
}

module.exports = {
  analyzeScan,
  getScanFindings,
  deleteScanFindings,
  calculateRiskScore: analysisEngine.calculateRiskScore
};
