const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Authentication Check (AUTH-001, AUTH-002)
 * Inspects global and endpoint-level authentication configuration.
 *
 * @param {Object} scan - Scan model document with endpoints and rawSpec
 * @returns {Array<Object>} Generated security findings
 */
function authenticationRule(scan) {
  const findings = [];
  const { rawSpec, endpoints = [] } = scan;

  // 1. Check Global Security Schemes
  const hasGlobalSecurity = rawSpec?.security && Array.isArray(rawSpec.security) && rawSpec.security.length > 0;
  
  if (!hasGlobalSecurity) {
    findings.push({
      ruleId: 'AUTH-001',
      endpointId: 'GLOBAL',
      category: FINDING_CATEGORIES.AUTHENTICATION,
      title: 'Missing Global Security Enforcement',
      description: 'The API specification does not define a global security requirement. Endpoints may default to unauthenticated unless explicitly configured.',
      severity: 'medium',
      recommendation: 'Add a top-level "security" requirement array to enforce authentication across all API operations by default.',
      reference: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/'
    });
  }

  // 2. Check Endpoint Security
  endpoints.forEach(ep => {
    if (!ep.requiresAuth || ep.securityType === 'None') {
      const isSensitiveMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method.toUpperCase());
      const severity = isSensitiveMethod ? 'high' : 'medium';

      findings.push({
        ruleId: 'AUTH-002',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.AUTHENTICATION,
        title: `Unauthenticated ${ep.method} Endpoint`,
        description: `Endpoint "${ep.method} ${ep.path}" does not mandate authentication. ${isSensitiveMethod ? 'Sensitive state-changing operations should be restricted.' : 'Publicly accessible endpoints can expose sensitive data or lead to resource depletion.'}`,
        severity,
        recommendation: `Configure explicit security requirements for ${ep.method} ${ep.path} using Bearer JWT, OAuth2, or API Key headers.`,
        reference: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/'
      });
    }
  });

  return findings;
}

module.exports = authenticationRule;
