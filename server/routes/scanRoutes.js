const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  uploadScan,
  uploadScanFromUrl,
  getScans,
  getScan,
  deleteScan
} = require('../controllers/scanController');

const router = express.Router();

// Multer Storage Configuration (in-memory parsing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isJson = file.mimetype === 'application/json' || file.originalname.endsWith('.json');
    const isYaml = file.originalname.endsWith('.yaml') || 
                   file.originalname.endsWith('.yml') || 
                   file.mimetype === 'application/x-yaml' || 
                   file.mimetype === 'text/yaml' ||
                   file.mimetype === 'text/plain'; // some systems upload yaml as plain text

    if (isJson || isYaml) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON and YAML/YML specification files are supported.'));
    }
  }
});

// Protect all routes in this router
router.use(protect);

// Upload spec file route
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadScan);

// Import spec from URL route
router.post('/url', uploadScanFromUrl);

// History operations
router.route('/')
  .get(getScans);

router.route('/:id')
  .get(getScan)
  .delete(deleteScan);

module.exports = router;
