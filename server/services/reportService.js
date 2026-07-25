const Scan = require('../models/Scan');
const Finding = require('../models/Finding');
const { ScanNotFoundError, UnauthorizedScanAccessError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Generates a structured JSON security report for a scan.
 *
 * @param {string} scanId - MongoDB Scan ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<Object>} Structured JSON report object
 */
async function generateStructuredJsonReport(scanId, userId) {
  logger.info(`Generating JSON security report for Scan ID: ${scanId} by User: ${userId}`);

  const scan = await Scan.findById(scanId);
  if (!scan) {
    throw new ScanNotFoundError();
  }
  if (scan.userId.toString() !== userId) {
    throw new UnauthorizedScanAccessError();
  }

  const findings = await Finding.find({ scanId }).sort({ severity: 1, createdAt: -1 });

  // Compute Severity Breakdown
  const severityBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };

  // Compute Category Breakdown
  const categoryBreakdown = {};

  findings.forEach(f => {
    if (severityBreakdown[f.severity] !== undefined) {
      severityBreakdown[f.severity]++;
    }
    categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
  });

  // Calculate Risk Level Rating
  let riskRating = 'Low Risk';
  if (scan.riskScore > 70) riskRating = 'Critical Risk';
  else if (scan.riskScore > 40) riskRating = 'High Risk';
  else if (scan.riskScore > 20) riskRating = 'Medium Risk';

  const report = {
    report: {
      generatedAt: new Date().toISOString(),
      reportVersion: '1.0.0',
      scannerName: 'API Security Scanner (Passive Static Engine)'
    },
    metadata: {
      scanId: scan._id,
      apiTitle: scan.apiTitle,
      apiVersion: scan.apiVersion,
      specVersion: scan.specVersion,
      servers: scan.servers || [],
      scanDurationMs: scan.scanDuration,
      sourceType: scan.sourceType,
      sourceLocation: scan.sourceLocation,
      uploadedAt: scan.uploadedAt,
      lastAnalyzedAt: scan.lastAnalyzedAt
    },
    summary: {
      totalEndpoints: scan.endpointCount,
      totalFindings: findings.length,
      authTypesDetected: scan.authTypes || []
    },
    riskScore: {
      score: scan.riskScore,
      maxScore: 100,
      rating: riskRating
    },
    severityBreakdown,
    categoryBreakdown,
    findings: findings.map(f => ({
      findingId: f._id,
      endpointId: f.endpointId,
      ruleId: f.ruleId,
      severity: f.severity,
      category: f.category,
      title: f.title,
      description: f.description,
      recommendation: f.recommendation,
      reference: f.reference,
      status: f.status,
      createdAt: f.createdAt
    })),
    endpointInventory: (scan.endpoints || []).map(ep => ({
      endpointId: ep.endpointId,
      method: ep.method,
      path: ep.path,
      summary: ep.summary,
      requiresAuth: ep.requiresAuth,
      securityType: ep.securityType,
      tags: ep.tags,
      parameterCount: ep.parameters ? ep.parameters.length : 0,
      responseCodes: ep.responseCodes
    }))
  };

  return report;
}

module.exports = {
  generateStructuredJsonReport,
  exportJson: generateStructuredJsonReport
};
