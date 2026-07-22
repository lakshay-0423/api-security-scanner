/**
 * Maps OpenAPI / Swagger security definitions to standardized types
 * @param {Object} scheme - Security scheme object from specification
 * @returns {string} Standardized security type name
 */
function determineSecurityType(scheme) {
  if (!scheme) return 'None';
  
  const type = scheme.type;
  const httpScheme = scheme.scheme ? scheme.scheme.toLowerCase() : '';

  if (type === 'basic') return 'Basic Auth';
  if (type === 'oauth2') return 'OAuth2';
  
  if (type === 'apiKey') {
    if (scheme.in === 'cookie') {
      return 'Cookie Auth';
    }
    return 'API Key';
  }
  
  if (type === 'http') {
    if (httpScheme === 'bearer') {
      return 'Bearer JWT';
    }
    if (httpScheme === 'basic') {
      return 'Basic Auth';
    }
    return 'API Key';
  }

  return 'API Key'; // fallback default for recognized security references
}

module.exports = { determineSecurityType };
