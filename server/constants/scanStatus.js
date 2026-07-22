const SCAN_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

const SCAN_STATUS_VALUES = Object.freeze(Object.values(SCAN_STATUS));

module.exports = {
  SCAN_STATUS,
  SCAN_STATUS_VALUES
};
