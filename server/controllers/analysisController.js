const { analyzeScan, getScanFindings, deleteScanFindings } = require('../services/analysisService');
const { generateStructuredJsonReport } = require('../services/reportService');
const logger = require('../utils/logger');

// @desc    Run static security analysis on a scan inventory
// @route   POST /api/analysis/:scanId
// @access  Private
const runAnalysis = async (req, res, next) => {
  try {
    const scanId = req.params.scanId;
    const userId = req.user.id;

    logger.info(`Controller request to execute static security analysis for scan: ${scanId}`);
    const result = await analyzeScan(scanId, userId);

    res.status(200).json({
      success: true,
      message: 'Static security analysis executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get findings for a scan
// @route   GET /api/findings/:scanId
// @access  Private
const getFindings = async (req, res, next) => {
  try {
    const scanId = req.params.scanId;
    const userId = req.user.id;

    const findings = await getScanFindings(scanId, userId);

    res.status(200).json({
      success: true,
      message: 'Findings retrieved successfully',
      data: findings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete findings for a scan
// @route   DELETE /api/findings/:scanId
// @access  Private
const deleteFindings = async (req, res, next) => {
  try {
    const scanId = req.params.scanId;
    const userId = req.user.id;

    await deleteScanFindings(scanId, userId);

    res.status(200).json({
      success: true,
      message: 'Findings deleted and analysis reset successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export structured JSON security report for a scan
// @route   GET /api/reports/:scanId/json
// @access  Private
const exportJsonReport = async (req, res, next) => {
  try {
    const scanId = req.params.scanId;
    const userId = req.user.id;

    const report = await generateStructuredJsonReport(scanId, userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=security-report-${scanId}.json`);

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAnalysis,
  getFindings,
  deleteFindings,
  exportJsonReport
};
