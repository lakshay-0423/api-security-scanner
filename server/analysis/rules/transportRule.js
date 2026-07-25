const { FINDING_CATEGORIES } = require('../../constants/findingCategories');

/**
 * Security Rule: Transport Security (HTTPS-001)
 * Inspects server definitions for unencrypted HTTP protocols.
 *
 * @param {Object} scan - Scan model document with servers array
 * @returns {Array<Object>} Generated security findings
 */
function transportRule(scan) {
  const findings = [];
  const { servers = [] } = scan;

  const insecureServers = servers.filter(srv => typeof srv === 'string' && srv.toLowerCase().startsWith('http://'));

  if (insecureServers.length > 0) {
    findings.push({
      ruleId: 'HTTPS-001',
      endpointId: 'GLOBAL',
      category: FINDING_CATEGORIES.TRANSPORT_SECURITY,
      title: 'Insecure Transport Protocol (HTTP)',
      description: `The API specification defines unencrypted HTTP server URLs: ${insecureServers.join(', ')}. Transmitting data over cleartext HTTP allows man-in-the-middle eavesdropping and token theft.`,
      severity: 'high',
      recommendation: 'Enforce HTTPS TLS v1.2+ for all server definitions and redirect HTTP traffic to HTTPS.',
      reference: 'https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/'
    });
  }

  return findings;
}

module.exports = transportRule;
