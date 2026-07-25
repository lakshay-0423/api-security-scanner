const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Dangerous Unauthenticated HTTP Methods (HTTP-001)
 * Detects PUT, PATCH, DELETE, POST operations accessible without authentication.
 *
 * @param {Object} scan - Scan model document with endpoints
 * @returns {Array<Object>} Generated security findings
 */
function dangerousMethodsRule(scan) {
  const findings = [];
  const { endpoints = [] } = scan;
  const dangerousMethods = ['PUT', 'PATCH', 'DELETE', 'POST'];

  endpoints.forEach(ep => {
    const methodUpper = ep.method.toUpperCase();
    if (dangerousMethods.includes(methodUpper) && (!ep.requiresAuth || ep.securityType === 'None')) {
      findings.push({
        ruleId: 'HTTP-001',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.HTTP_METHODS,
        title: `Unauthenticated Dangerous Method (${methodUpper})`,
        description: `State-altering HTTP method ${methodUpper} on path "${ep.path}" does not require authentication. Unauthenticated write/delete operations expose the system to unauthorized data modification, injection, or mass deletion.`,
        severity: 'high',
        recommendation: `Restrict ${methodUpper} operations on ${ep.path} using strong authentication and role-based authorization (RBAC).`,
        reference: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/'
      });
    }
  });

  return findings;
}

module.exports = dangerousMethodsRule;
