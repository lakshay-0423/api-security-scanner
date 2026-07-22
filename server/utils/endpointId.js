/**
 * Formats a unique endpointId string from HTTP method and path
 * @param {string} method - HTTP Method (e.g. GET)
 * @param {string} path - URL Path (e.g. /users)
 * @returns {string} formatted endpointId (e.g. GET_/users)
 */
function formatEndpointId(method, path) {
  const cleanMethod = (method || '').toUpperCase().trim();
  const cleanPath = (path || '').trim();
  return `${cleanMethod}_${cleanPath}`;
}

module.exports = { formatEndpointId };
