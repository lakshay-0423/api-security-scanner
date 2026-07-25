const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Endpoint Tags Organization (TAG-001)
 * Detects operations that are untagged, indicating disorganized API grouping.
 *
 * @param {Object} scan - Scan model document with endpoints
 * @returns {Array<Object>} Generated security findings
 */
function tagsRule(scan) {
  const findings = [];
  const { endpoints = [] } = scan;

  endpoints.forEach(ep => {
    if (!ep.tags || !Array.isArray(ep.tags) || ep.tags.length === 0) {
      findings.push({
        ruleId: 'TAG-001',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.DOCUMENTATION,
        title: 'Untagged Operation',
        description: `Operation "${ep.method} ${ep.path}" has no tags assigned. Categorizing operations by logical resource tags improves governance and access controls.`,
        severity: 'info',
        recommendation: `Assign resource tags (e.g. "Users", "Payments") to operation "${ep.method} ${ep.path}".`,
        reference: 'https://swagger.io/docs/specification/grouping-operations-with-tags/'
      });
    }
  });

  return findings;
}

module.exports = tagsRule;
