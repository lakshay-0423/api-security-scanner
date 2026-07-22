const ANALYSIS_STATUS = Object.freeze({
  NOT_STARTED: 'not_started',
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

const ANALYSIS_STATUS_VALUES = Object.freeze(Object.values(ANALYSIS_STATUS));

module.exports = {
  ANALYSIS_STATUS,
  ANALYSIS_STATUS_VALUES
};
