/**
 * Normalizes OpenAPI/Swagger parameter definitions into a clean schema object
 * @param {Array} combinedParams - Raw parameter definitions
 * @returns {Object} { parameters, requestBodyPresent }
 */
function normalizeParameters(combinedParams = []) {
  const parameters = [];
  let requestBodyPresent = false;
  const paramMap = new Map();

  combinedParams.forEach(param => {
    if (!param || !param.name || !param.in) return;
    const paramKey = `${param.in}_${param.name}`;
    paramMap.set(paramKey, param);
  });

  paramMap.forEach(param => {
    let location = param.in;
    // Map body/formData in Swagger 2.0
    if (location === 'body' || location === 'formData') {
      requestBodyPresent = true;
      return;
    }

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

  return { parameters, requestBodyPresent };
}

module.exports = { normalizeParameters };
