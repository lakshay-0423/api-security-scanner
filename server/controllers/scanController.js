const axios = require('axios');
const { parseAndNormalizeSpec } = require('../services/parserService');
const {
  createScanRecord,
  createFailedScanRecord,
  getUserScans,
  getScanByIdAndUser,
  deleteScanByIdAndUser
} = require('../services/scanService');
const { measureDuration } = require('../utils/timer');
const { DownloadError } = require('../utils/errors');
const logger = require('../utils/logger');

// @desc    Upload an OpenAPI/Swagger file and parse endpoints
// @route   POST /api/scans/upload
// @access  Private
const uploadScan = async (req, res, next) => {
  const startTime = Date.now();
  const fileContent = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    // 1. Service Layer: Parse specification
    const parsedData = await parseAndNormalizeSpec(fileContent);
    const duration = measureDuration(startTime);

    // 2. Service Layer: Persist scan record
    const scan = await createScanRecord({
      userId: req.user.id,
      fileName,
      sourceType: 'upload',
      sourceLocation: fileName,
      parsedData,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'API Specification scanned and inventory created successfully',
      data: {
        scanId: scan._id
      }
    });
  } catch (error) {
    const duration = measureDuration(startTime);
    await createFailedScanRecord({
      userId: req.user.id,
      fileName,
      sourceType: 'upload',
      sourceLocation: fileName,
      duration,
      errorMessage: error.message
    });

    next(error);
  }
};

// @desc    Import an OpenAPI/Swagger spec from a URL and parse it
// @route   POST /api/scans/url
// @access  Private
const uploadScanFromUrl = async (req, res, next) => {
  const startTime = Date.now();
  const { url } = req.body;
  const urlPathname = new URL(url).pathname;
  const fileName = urlPathname.substring(urlPathname.lastIndexOf('/') + 1) || 'swagger.json';

  try {
    // 1. Download file content
    let response;
    try {
      response = await axios.get(url, {
        timeout: 10000,
        transformResponse: [(data) => data]
      });
    } catch (dlErr) {
      throw new DownloadError(`Failed to download specification from URL: ${dlErr.message}`);
    }

    // 2. Service Layer: Parse specification
    const parsedData = await parseAndNormalizeSpec(response.data);
    const duration = measureDuration(startTime);

    // 3. Service Layer: Persist scan record
    const scan = await createScanRecord({
      userId: req.user.id,
      fileName,
      sourceType: 'url',
      sourceLocation: url,
      parsedData,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'API Specification imported and inventory created successfully',
      data: {
        scanId: scan._id
      }
    });
  } catch (error) {
    const duration = measureDuration(startTime);
    await createFailedScanRecord({
      userId: req.user.id,
      fileName,
      sourceType: 'url',
      sourceLocation: url,
      duration,
      errorMessage: error.message
    });

    next(error);
  }
};

// @desc    Get all scans belonging to the logged-in user
// @route   GET /api/scans
// @access  Private
const getScans = async (req, res, next) => {
  try {
    const scans = await getUserScans(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Scan history retrieved successfully',
      data: scans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get details of a single scan
// @route   GET /api/scans/:id
// @access  Private
const getScan = async (req, res, next) => {
  try {
    const scan = await getScanByIdAndUser(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Scan report details retrieved successfully',
      data: scan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a scan
// @route   DELETE /api/scans/:id
// @access  Private
const deleteScan = async (req, res, next) => {
  try {
    await deleteScanByIdAndUser(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Scan report deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadScan,
  uploadScanFromUrl,
  getScans,
  getScan,
  deleteScan
};
