const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Security Schemes Definition Check (SEC-001)
 * Detects API specifications missing securitySchemes (OpenAPI 3.x) or securityDefinitions (Swagger 2.0).
 *
 * @param {Object} scan - Scan model document with rawSpec
 * @returns {Array<Object>} Generated security findings
 */
function securitySchemesRule(scan) {
  const findings = [];
  const { rawSpec = {} } = scan;

  const hasOas3Schemes = rawSpec.components?.securitySchemes && Object.keys(rawSpec.components.securitySchemes).length > 0;
  const hasSwagger2Schemes = rawSpec.securityDefinitions && Object.keys(rawSpec.securityDefinitions).length > 0;

  if (!hasOas3Schemes && !hasSwagger2Schemes) {
    findings.push({
      ruleId: 'SEC-001',
      endpointId: 'GLOBAL',
      category: FINDING_CATEGORIES.CONFIGURATION,
      title: 'Missing Security Schemes Definitions',
      description: 'The specification declares no reusable security schemes under "components.securitySchemes" or "securityDefinitions". Without defined schemes, endpoints cannot specify authentication mechanisms.',
      severity: 'high',
      recommendation: 'Define standard security schemes (e.g. Bearer JWT, OAuth2, API Key) in the specification components.',
      reference: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/'
    });
  }

  return findings;
}

module.exports = securitySchemesRule;
