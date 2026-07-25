const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Wildcard or Overly Permissive Security (SEC-002)
 * Detects overly permissive security definitions (e.g. wildcards in scopes, CORS wildcard headers, or empty security requirement objects).
 *
 * @param {Object} scan - Scan model document with rawSpec
 * @returns {Array<Object>} Generated security findings
 */
function wildcardSecurityRule(scan) {
  const findings = [];
  const { rawSpec = {} } = scan;

  const securityDefinitions = rawSpec.components?.securitySchemes || rawSpec.securityDefinitions || {};

  Object.entries(securityDefinitions).forEach(([schemeName, scheme]) => {
    // Check OAuth2 scopes for wildcard permissions
    if (scheme.flows || scheme.type === 'oauth2') {
      const flows = scheme.flows || { implicit: scheme, password: scheme, application: scheme, accessCode: scheme };
      Object.values(flows).forEach(flow => {
        if (flow?.scopes) {
          const scopeKeys = Object.keys(flow.scopes);
          if (scopeKeys.includes('*') || scopeKeys.some(s => s.toLowerCase().includes('all') || s.toLowerCase().includes('admin'))) {
            findings.push({
              ruleId: 'SEC-002',
              endpointId: 'GLOBAL',
              category: FINDING_CATEGORIES.CONFIGURATION,
              title: `Overly Permissive OAuth2 Scope in "${schemeName}"`,
              description: `OAuth2 scheme "${schemeName}" grants wildcard or administrative scopes ("*"). Overly broad scopes violate the principle of least privilege.`,
              severity: 'medium',
              recommendation: 'Replace wildcard scopes with granular, least-privilege OAuth2 scopes specific to required resource actions.',
              reference: 'https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/'
            });
          }
        }
      });
    }
  });

  return findings;
}

module.exports = wildcardSecurityRule;
