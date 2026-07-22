/**
 * Extracts response status codes list from an operation object
 * @param {Object} responsesObj - OpenAPI responses object
 * @returns {Array<string>} Array of status codes
 */
function extractResponseCodes(responsesObj) {
  const responseCodes = [];
  if (responsesObj && typeof responsesObj === 'object') {
    Object.keys(responsesObj).forEach(code => {
      responseCodes.push(code);
    });
  }
  return responseCodes;
}

module.exports = { extractResponseCodes };
