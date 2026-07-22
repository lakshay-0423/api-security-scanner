const SwaggerParser = require('@apidevtools/swagger-parser');
const yaml = require('js-yaml');

/**
 * Normalizes and validates an OpenAPI/Swagger document, extracting API metadata and all endpoints.
 * @param {string|Buffer} content - The specification file content (JSON or YAML string/buffer).
 * @returns {Promise<Object>} - Parsed and structured scan data.
 */
async function parseSwaggerSpec(content) {
  let specObject;
  const contentStr = content.toString();

  // 1. Try parsing JSON first, then YAML
  try {
    specObject = JSON.parse(contentStr);
  } catch (jsonErr) {
    try {
      specObject = yaml.load(contentStr);
    } catch (yamlErr) {
      throw new Error('Invalid format: File is neither valid JSON nor valid YAML');
    }
  }

  if (!specObject || typeof specObject !== 'object') {
    throw new Error('Invalid specification: Content is not an object');
  }

  // 2. Validate and dereference the specification using @apidevtools/swagger-parser
  // This will throw if the spec is invalid or does not match Swagger 2.0 / OpenAPI 3.x
  const api = await SwaggerParser.validate(specObject);

  // 3. Extract metadata
  const apiTitle = api.info?.title || 'Untitled API';
  const apiVersion = api.info?.version || '1.0.0';
  const description = api.info?.description || '';
  
  // Spec Version detection
  let specVersion = 'OpenAPI 3.0';
  if (api.swagger) {
    specVersion = `Swagger ${api.swagger}`;
  } else if (api.openapi) {
    specVersion = `OpenAPI ${api.openapi}`;
  }

  // Extract Servers list
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
  // Map of security scheme name -> Type (standardized)
  const authSchemes = {};
  
  if (api.components?.securitySchemes) {
    // OpenAPI 3.x
    Object.entries(api.components.securitySchemes).forEach(([name, scheme]) => {
      authSchemes[name] = determineSecurityType(scheme);
    });
  } else if (api.securityDefinitions) {
    // Swagger 2.0
    Object.entries(api.securityDefinitions).forEach(([name, scheme]) => {
      authSchemes[name] = determineSecurityType(scheme);
    });
  }

  // Global security rules
  const globalSecurity = api.security || [];

  // 5. Extract endpoints from paths
  const endpoints = [];
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

  if (api.paths) {
    Object.entries(api.paths).forEach(([path, pathObj]) => {
      if (!pathObj || typeof pathObj !== 'object') return;

      Object.entries(pathObj).forEach(([methodKey, operation]) => {
        const method = methodKey.toUpperCase();
        if (!allowedMethods.includes(method)) return; // skip parameters, $ref etc. at path level

        const endpointId = `${method}_${path}`;
        const summary = operation.summary || '';
        const operationDescription = operation.description || '';
        const operationId = operation.operationId || '';
        const tags = Array.isArray(operation.tags) ? operation.tags : [];

        // Auth detection for this operation
        let requiresAuth = false;
        let securityType = 'None';

        // Check operation-level security, then global security
        const operationSecurity = operation.security || (operation.security === null ? [] : globalSecurity);
        
        if (operationSecurity.length > 0) {
          // Check if it's not empty, e.g., [ {} ] means auth is optional or None
          const hasSecurityRequirement = operationSecurity.some(req => Object.keys(req).length > 0);
          if (hasSecurityRequirement) {
            requiresAuth = true;
            // Extract the first security requirement type that matches defined schemes
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
              securityType = 'API Key'; // fallback if security is required but schema name doesn't match components
            }
          }
        }

        // Request Body Detection
        let requestBodyPresent = false;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          if (operation.requestBody) {
            requestBodyPresent = true;
          } else if (operation.parameters && Array.isArray(operation.parameters)) {
            // Swagger 2.0 body or formData params
            requestBodyPresent = operation.parameters.some(p => p.in === 'body' || p.in === 'formData');
          }
        }

        // Response codes list
        const responseCodes = [];
        if (operation.responses && typeof operation.responses === 'object') {
          Object.keys(operation.responses).forEach(code => {
            responseCodes.push(code);
          });
        }

        // Parameters parsing and normalization
        const parameters = [];
        // Combine path-level parameters with operation-level parameters
        const combinedParams = [
          ...(pathObj.parameters || []),
          ...(operation.parameters || [])
        ];

        // Unique parameter map by name + in to prevent duplicates
        const paramMap = new Map();
        combinedParams.forEach(param => {
          if (!param || !param.name || !param.in) return;
          const paramKey = `${param.in}_${param.name}`;
          paramMap.set(paramKey, param);
        });

        paramMap.forEach(param => {
          let location = param.in;
          // Map body/formData in Swagger 2.0 to parameters or skip
          if (location === 'body' || location === 'formData') {
            return; // We capture this in requestBodyPresent, parameters schema only query/path/header/cookie
          }

          // Normalize location enum
          if (!['query', 'path', 'header', 'cookie'].includes(location)) {
            return;
          }

          let paramType = 'string';
          if (param.type) {
            paramType = param.type;
          } else if (param.schema && param.schema.type) {
            paramType = param.schema.type;
          }

          parameters.push({
            name: param.name,
            location: location,
            required: !!param.required,
            type: paramType
          });
        });

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

  return {
    apiTitle,
    apiVersion,
    description,
    servers,
    specVersion,
    endpointCount: endpoints.length,
    endpoints,
    rawSpec: specObject
  };
}

/**
 * Maps OpenAPI / Swagger security definitions to standardized types
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

  return 'API Key'; // fallback default for custom/unrecognized types
}

module.exports = { parseSwaggerSpec };
