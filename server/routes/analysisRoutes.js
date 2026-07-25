const express = require('express');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const {
  runAnalysis,
  getFindings,
  deleteFindings,
  exportJsonReport
} = require('../controllers/analysisController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Analysis execution
router.post('/analysis/:scanId', validateObjectId, runAnalysis);

// Findings CRUD
router.route('/findings/:scanId')
  .get(validateObjectId, getFindings)
  .delete(validateObjectId, deleteFindings);

// Report export
router.get('/reports/:scanId/json', validateObjectId, exportJsonReport);

module.exports = router;
