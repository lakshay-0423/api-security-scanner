/**
 * Centralized Security Finding Categories
 */
const FINDING_CATEGORIES = Object.freeze({
  AUTHENTICATION: 'Authentication',
  TRANSPORT_SECURITY: 'Transport Security',
  HTTP_METHODS: 'HTTP Methods',
  DOCUMENTATION: 'Documentation',
  CONFIGURATION: 'Configuration',
  REQUEST_VALIDATION: 'Request Validation',
  RESPONSE_VALIDATION: 'Response Validation',
  API_DESIGN: 'API Design'
});

const FINDING_CATEGORY_VALUES = Object.freeze(Object.values(FINDING_CATEGORIES));

module.exports = {
  FINDING_CATEGORIES,
  FINDING_CATEGORY_VALUES
};
