const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Request Validation Schema (REQ-001)
 * Detects endpoints that accept request body payloads without strict parameter schema definitions.
 *
 * @param {Object} scan - Scan model document with endpoints
 * @returns {Array<Object>} Generated security findings
 */
function requestSchemaRule(scan) {
  const findings = [];
  const { endpoints = [] } = scan;

  endpoints.forEach(ep => {
    const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(ep.method.toUpperCase());
    
    // Check if endpoint accepts body but has no body definition or parameters
    if (isBodyMethod && !ep.requestBodyPresent && (!ep.parameters || ep.parameters.length === 0)) {
      findings.push({
        ruleId: 'REQ-001',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.REQUEST_VALIDATION,
        title: 'Missing Request Body Schema Validation',
        description: `Operation "${ep.method} ${ep.path}" modifies state but does not define a request body schema or parameters. Accepting unvalidated inputs can lead to Mass Assignment, SQL Injection, or unexpected service failure.`,
        severity: 'medium',
        recommendation: 'Define explicit JSON Schema properties, data types, and required fields for request bodies.',
        reference: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/'
      });
    }
  });

  return findings;
}

module.exports = requestSchemaRule;
