const SwaggerParser = require('@apidevtools/swagger-parser');
const yaml = require('js-yaml');
const { determineSecurityType } = require('../utils/securityMapper');
const { formatEndpointId } = require('../utils/endpointId');
const { normalizeParameters } = require('../utils/parameterNormalizer');
const { extractResponseCodes } = require('../utils/responseExtractor');
const HTTP_METHODS = require('../constants/httpMethods');
const { ParseError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Parses, validates, and normalizes an OpenAPI/Swagger specification document.
 *
 * @param {string|Buffer} content - The raw specification string or buffer (JSON/YAML).
 * @returns {Promise<Object>} Formatted API metadata, servers list, endpoint inventory, and raw spec object.
 * @throws {ParseError} If the document is invalid JSON/YAML or fails OpenAPI validation.
 */
async function parseAndNormalizeSpec(content) {
  let specObject;
  const contentStr = content.toString();

  // 1. Try parsing JSON, then YAML
  try {
    specObject = JSON.parse(contentStr);
  } catch (jsonErr) {
    try {
      specObject = yaml.load(contentStr);
    } catch (yamlErr) {
      logger.warn('Failed to parse content as JSON or YAML');
      throw new ParseError('Invalid file format: Spec is neither valid JSON nor valid YAML');
    }
  }

  if (!specObject || typeof specObject !== 'object') {
    throw new ParseError('Invalid specification: Content is not an object');
  }

  // 2. Validate and dereference using SwaggerParser
  let api;
  try {
    api = await SwaggerParser.validate(specObject);
  } catch (swaggerErr) {
    logger.warn(`SwaggerParser validation failed: ${swaggerErr.message}`);
    throw new ParseError(`Invalid OpenAPI/Swagger specification: ${swaggerErr.message}`);
  }

  // 3. Extract metadata
  const apiTitle = api.info?.title || 'Untitled API';
  const apiVersion = api.info?.version || '1.0.0';
  const description = api.info?.description || '';
  
  // Spec Version
  let specVersion = 'OpenAPI 3.0';
  if (api.swagger) {
    specVersion = `Swagger ${api.swagger}`;
  } else if (api.openapi) {
    specVersion = `OpenAPI ${api.openapi}`;
  }

  // Servers extraction
  const servers = [];
  if (api.servers && Array.isArray(api.servers)) {
    api.servers.forEach(s => {
      if (s.url) servers.push(s.url);
    });
  } else if (api.host) {
    const schemes = api.schemes || ['http'];
    const basePath = api.basePath || '';
    schemes.forEach(scheme => {
      servers.push(`${scheme}://${api.host}${basePath}`);
    });
  } else if (api.basePath) {
    servers.push(api.basePath);
  } else {
    servers.push('/');
  }

  // 4. Resolve Auth Schemes
  const authSchemes = {};
  if (api.components?.securitySchemes) {
    Object.entries(api.components.securitySchemes).forEach(([name, scheme]) => {
      authSchemes[name] = determineSecurityType(scheme);
    });
  } else if (api.securityDefinitions) {
    Object.entries(api.securityDefinitions).forEach(([name, scheme]) => {
      authSchemes[name] = determineSecurityType(scheme);
    });
  }

  const globalSecurity = api.security || [];

  // 5. Extract Endpoints
  const endpoints = [];

  if (api.paths) {
    Object.entries(api.paths).forEach(([path, pathObj]) => {
      if (!pathObj || typeof pathObj !== 'object') return;

      Object.entries(pathObj).forEach(([methodKey, operation]) => {
        const method = methodKey.toUpperCase();
        if (!HTTP_METHODS.includes(method)) return;

        const endpointId = formatEndpointId(method, path);
        const summary = operation.summary || '';
        const operationDescription = operation.description || '';
        const operationId = operation.operationId || '';
        const tags = Array.isArray(operation.tags) ? operation.tags : [];

        // Auth detection
        let requiresAuth = false;
        let securityType = 'None';

        const operationSecurity = operation.security || (operation.security === null ? [] : globalSecurity);
        
        if (operationSecurity.length > 0) {
          const hasSecurityRequirement = operationSecurity.some(req => Object.keys(req).length > 0);
          if (hasSecurityRequirement) {
            requiresAuth = true;
            for (const req of operationSecurity) {
              const schemeNames = Object.keys(req);
              for (const name of schemeNames) {
                if (authSchemes[name] && authSchemes[name] !== 'None') {
                  securityType = authSchemes[name];
                  break;
                }
              }
              if (securityType !== 'None') break;
            }
            if (securityType === 'None') {
              securityType = 'API Key';
            }
          }
        }

        // Parameters & Request Body
        const combinedParams = [
          ...(pathObj.parameters || []),
          ...(operation.parameters || [])
        ];
        const { parameters, requestBodyPresent: paramsHaveBody } = normalizeParameters(combinedParams);
        const requestBodyPresent = paramsHaveBody || !!operation.requestBody;

        // Response codes
        const responseCodes = extractResponseCodes(operation.responses);

        endpoints.push({
          endpointId,
          method,
          path,
          summary,
          description: operationDescription,
          operationId,
          tags,
          requiresAuth,
          securityType,
          parameters,
          requestBodyPresent,
          responseCodes,
          riskScore: 0,
          issues: [],
          recommendations: []
        });
      });
    });
  }

  // Extract unique active auth types
  const authTypesSet = new Set();
  endpoints.forEach(ep => {
    if (ep.requiresAuth && ep.securityType && ep.securityType !== 'None') {
      authTypesSet.add(ep.securityType);
    }
  });
  const authTypes = Array.from(authTypesSet);

  return {
    apiTitle,
    apiVersion,
    description,
    servers,
    specVersion,
    endpointCount: endpoints.length,
    endpoints,
    authTypes,
    rawSpec: specObject
  };
}

module.exports = { parseAndNormalizeSpec };
