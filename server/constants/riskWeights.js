/**
 * Centralized Severity Risk Weighting (0-100 score contribution)
 */
const RISK_WEIGHTS = Object.freeze({
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 1
});

const SEVERITY_LEVELS = Object.freeze(Object.keys(RISK_WEIGHTS));

module.exports = {
  RISK_WEIGHTS,
  SEVERITY_LEVELS
};
