const authenticationRule = require('./rules/authenticationRule');
const transportRule = require('./rules/transportRule');
const dangerousMethodsRule = require('./rules/dangerousMethodsRule');
const requestSchemaRule = require('./rules/requestSchemaRule');
const responseRule = require('./rules/responseRule');
const documentationRule = require('./rules/documentationRule');
const tagsRule = require('./rules/tagsRule');
const securitySchemesRule = require('./rules/securitySchemesRule');
const deprecatedRule = require('./rules/deprecatedRule');
const wildcardSecurityRule = require('./rules/wildcardSecurityRule');
const { RISK_WEIGHTS } = require('../constants/riskWeights');
const logger = require('../utils/logger');

// Complete registry of rules
const RULES_SUITE = [
  authenticationRule,
  transportRule,
  dangerousMethodsRule,
  requestSchemaRule,
  responseRule,
  documentationRule,
  tagsRule,
  securitySchemesRule,
  deprecatedRule,
  wildcardSecurityRule
];

/**
 * Calculates aggregate risk score (0-100) based on finding severities and weights.
 *
 * @param {Array<Object>} findings - Generated findings list
 * @returns {number} Clamped Risk Score (0-100)
 */
function calculateRiskScore(findings = []) {
  if (!Array.isArray(findings) || findings.length === 0) {
    return 0;
  }

  const rawScore = findings.reduce((sum, finding) => {
    const weight = RISK_WEIGHTS[finding.severity] || 0;
    return sum + weight;
  }, 0);

  // Clamp score strictly between 0 and 100
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Executes the static security analysis engine against a scan specification document.
 *
 * @param {Object} scan - Mongoose Scan document or spec object
 * @returns {Object} { findings, riskScore, findingCount }
 */
function execute(scan) {
  logger.info(`Starting Static Security Analysis Engine execution for scan: ${scan._id || scan.apiTitle}`);
  
  let allFindings = [];

  // Run each rule safely
  RULES_SUITE.forEach(ruleFunc => {
    try {
      const ruleFindings = ruleFunc(scan);
      if (Array.isArray(ruleFindings)) {
        allFindings = allFindings.concat(ruleFindings);
      }
    } catch (err) {
      logger.error(`Error executing rule ${ruleFunc.name || 'anonymous'}: ${err.message}`, err.stack);
    }
  });

  const riskScore = calculateRiskScore(allFindings);
  const findingCount = allFindings.length;

  logger.info(`Analysis completed for ${scan._id || scan.apiTitle}: Generated ${findingCount} findings, Risk Score: ${riskScore}`);

  return {
    findings: allFindings,
    riskScore,
    findingCount
  };
}

module.exports = {
  execute,
  calculateRiskScore,
  RULES_SUITE
};
