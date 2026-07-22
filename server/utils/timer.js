/**
 * Calculates duration in milliseconds from a starting timestamp
 * @param {number} startTime - Date.now() timestamp
 * @returns {number} elapsed milliseconds
 */
function measureDuration(startTime) {
  return Math.max(0, Date.now() - startTime);
}

module.exports = { measureDuration };
