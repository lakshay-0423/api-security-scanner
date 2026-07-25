const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Deprecated Operations (DEP-001)
 * Detects operations marked as deprecated. Deprecated endpoints are often unmaintained and vulnerable.
 *
 * @param {Object} scan - Scan model document with rawSpec & endpoints
 * @returns {Array<Object>} Generated security findings
 */
function deprecatedRule(scan) {
  const findings = [];
  const { rawSpec = {}, endpoints = [] } = scan;

  endpoints.forEach(ep => {
    // Check rawSpec path object for deprecated flag
    const pathObj = rawSpec.paths?.[ep.path];
    const operation = pathObj?.[ep.method.toLowerCase()];

    if (operation?.deprecated === true) {
      findings.push({
        ruleId: 'DEP-001',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.API_DESIGN,
        title: `Deprecated Operation (${ep.method} ${ep.path})`,
        description: `Operation "${ep.method} ${ep.path}" is marked as deprecated. Deprecated endpoints are frequently left unmonitored and unpatched, increasing security risk.`,
        severity: 'info',
        recommendation: 'Sunset and decommission deprecated endpoints. Ensure consumers migrate to modern API versions.',
        reference: 'https://owasp.org/API-Security/editions/2023/en/0xa9-improper-inventory-management/'
      });
    }
  });

  return findings;
}

module.exports = deprecatedRule;
