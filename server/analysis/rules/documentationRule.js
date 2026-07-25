const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Documentation Quality Check (DOC-001, DOC-002)
 * Detects missing API top-level description, endpoint summaries, and operation descriptions.
 *
 * @param {Object} scan - Scan model document
 * @returns {Array<Object>} Generated security findings
 */
function documentationRule(scan) {
  const findings = [];
  const { description, endpoints = [] } = scan;

  // 1. Missing Top-level Description
  if (!description || description.trim().length === 0) {
    findings.push({
      ruleId: 'DOC-001',
      endpointId: 'GLOBAL',
      category: FINDING_CATEGORIES.DOCUMENTATION,
      title: 'Missing Top-Level API Description',
      description: 'The API specification lacks a top-level info description. Well-documented APIs reduce misuse and ambiguity.',
      severity: 'info',
      recommendation: 'Add a detailed "info.description" field detailing purpose, authentication, and terms of service.',
      reference: 'https://swagger.io/docs/specification/basic-structure/'
    });
  }

  // 2. Missing Endpoint Summaries / Descriptions
  endpoints.forEach(ep => {
    if (!ep.summary || ep.summary.trim().length === 0) {
      findings.push({
        ruleId: 'DOC-002',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.DOCUMENTATION,
        title: 'Missing Operation Summary',
        description: `Operation "${ep.method} ${ep.path}" does not provide a concise summary description.`,
        severity: 'info',
        recommendation: `Add a summary field to operation "${ep.method} ${ep.path}".`,
        reference: 'https://swagger.io/docs/specification/paths-and-operations/'
      });
    }

    if (!ep.description || ep.description.trim().length === 0) {
      findings.push({
        ruleId: 'DOC-002',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.DOCUMENTATION,
        title: 'Missing Operation Description',
        description: `Operation "${ep.method} ${ep.path}" lacks detailed operation description text.`,
        severity: 'info',
        recommendation: `Provide functional description details for operation "${ep.method} ${ep.path}".`,
        reference: 'https://swagger.io/docs/specification/paths-and-operations/'
      });
    }
  });

  return findings;
}

module.exports = documentationRule;
