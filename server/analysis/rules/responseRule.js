const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Response Definitions Check (RESP-001)
 * Detects missing, empty, or incomplete HTTP response status codes.
 *
 * @param {Object} scan - Scan model document with endpoints
 * @returns {Array<Object>} Generated security findings
 */
function responseRule(scan) {
  const findings = [];
  const { endpoints = [] } = scan;

  endpoints.forEach(ep => {
    const codes = ep.responseCodes || [];
    
    if (codes.length === 0) {
      findings.push({
        ruleId: 'RESP-001',
        endpointId: ep.endpointId,
        category: FINDING_CATEGORIES.RESPONSE_VALIDATION,
        title: 'Missing Response Status Codes',
        description: `Operation "${ep.method} ${ep.path}" does not define any HTTP response status codes. Missing response declarations hinder API gateways from enforcing strict schema validation.`,
        severity: 'low',
        recommendation: 'Define explicit response status codes (e.g. 200/201 for success, 400/401/403/500 for errors) with associated schemas.',
        reference: 'https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/'
      });
    } else {
      const hasSuccess = codes.some(c => c.startsWith('2') || c === 'default');
      if (!hasSuccess) {
        findings.push({
          ruleId: 'RESP-001',
          endpointId: ep.endpointId,
          category: FINDING_CATEGORIES.RESPONSE_VALIDATION,
          title: 'Missing Success (2xx) Response Definition',
          description: `Operation "${ep.method} ${ep.path}" defines error codes but lacks a 2xx success response status code.`,
          severity: 'low',
          recommendation: 'Document expected 200, 201, or 204 success response schemas.',
          reference: 'https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/'
        });
      }
    }
  });

  return findings;
}

module.exports = responseRule;
