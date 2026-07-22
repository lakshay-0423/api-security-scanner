const axios = require('axios');
const Scan = require('../models/Scan');
const { parseSwaggerSpec } = require('../utils/swaggerParser');

// @desc    Upload an OpenAPI/Swagger file and parse endpoints
// @route   POST /api/scans/upload
// @access  Private
const uploadScan = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a specification file (JSON or YAML)' });
    }

    const fileContent = req.file.buffer;
    const fileName = req.file.originalname;

    // Parse and validate using parser utility
    const parsedData = await parseSwaggerSpec(fileContent);

    const scanDuration = Date.now() - startTime;

    // Extract unique active auth types
    const authTypesSet = new Set();
    parsedData.endpoints.forEach(ep => {
      if (ep.requiresAuth && ep.securityType && ep.securityType !== 'None') {
        authTypesSet.add(ep.securityType);
      }
    });
    const authTypes = Array.from(authTypesSet);

    // Save to Database
    const newScan = new Scan({
      userId: req.user.id,
      fileName: fileName,
      sourceType: 'upload',
      sourceLocation: fileName,
      apiTitle: parsedData.apiTitle,
      apiVersion: parsedData.apiVersion,
      description: parsedData.description,
      servers: parsedData.servers,
      specVersion: parsedData.specVersion,
      endpointCount: parsedData.endpointCount,
      scanDuration: scanDuration,
      status: 'completed',
      authTypes: authTypes,
      rawSpec: parsedData.rawSpec,
      endpoints: parsedData.endpoints
    });

    await newScan.save();

    res.status(201).json({
      success: true,
      message: 'API Specification scanned and inventory created successfully',
      scanId: newScan._id
    });
  } catch (error) {
    // If it's a parsing/validation error, return 400
    const statusCode = error.message.includes('Invalid') ? 400 : 500;
    
    // Save a failed scan record
    try {
      const failedScan = new Scan({
        userId: req.user.id,
        fileName: req.file ? req.file.originalname : 'unknown_upload',
        sourceType: 'upload',
        sourceLocation: req.file ? req.file.originalname : 'unknown_upload',
        scanDuration: Date.now() - startTime,
        status: 'failed',
        description: `Failed to parse: ${error.message}`
      });
      await failedScan.save();
    } catch (dbErr) {
      console.error('Failed to log failed scan to DB:', dbErr);
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'An error occurred during file parsing'
    });
  }
};

// @desc    Import an OpenAPI/Swagger spec from a URL and parse it
// @route   POST /api/scans/url
// @access  Private
const uploadScanFromUrl = async (req, res, next) => {
  const startTime = Date.now();
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Please provide a specification URL' });
  }

  // Basic URL Validation
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Please provide a valid absolute URL' });
  }

  try {
    // Download the specification file
    let response;
    try {
      response = await axios.get(url, {
        timeout: 10000, // 10s timeout
        transformResponse: [(data) => data] // Do not auto-parse JSON, we want raw string/buffer for yaml support
      });
    } catch (dlErr) {
      throw new Error(`Failed to download specification from URL: ${dlErr.message}`);
    }

    const fileContent = response.data;
    const urlPathname = new URL(url).pathname;
    const fileName = urlPathname.substring(urlPathname.lastIndexOf('/') + 1) || 'swagger.json';

    // Parse and validate using parser utility
    const parsedData = await parseSwaggerSpec(fileContent);

    const scanDuration = Date.now() - startTime;

    // Extract unique active auth types
    const authTypesSet = new Set();
    parsedData.endpoints.forEach(ep => {
      if (ep.requiresAuth && ep.securityType && ep.securityType !== 'None') {
        authTypesSet.add(ep.securityType);
      }
    });
    const authTypes = Array.from(authTypesSet);

    // Save to Database
    const newScan = new Scan({
      userId: req.user.id,
      fileName: fileName,
      sourceType: 'url',
      sourceLocation: url,
      apiTitle: parsedData.apiTitle,
      apiVersion: parsedData.apiVersion,
      description: parsedData.description,
      servers: parsedData.servers,
      specVersion: parsedData.specVersion,
      endpointCount: parsedData.endpointCount,
      scanDuration: scanDuration,
      status: 'completed',
      authTypes: authTypes,
      rawSpec: parsedData.rawSpec,
      endpoints: parsedData.endpoints
    });

    await newScan.save();

    res.status(201).json({
      success: true,
      message: 'API Specification imported and inventory created successfully',
      scanId: newScan._id
    });
  } catch (error) {
    const statusCode = error.message.includes('Invalid') || error.message.includes('Failed to download') ? 400 : 500;
    
    // Save a failed scan record
    try {
      const failedScan = new Scan({
        userId: req.user.id,
        fileName: url.substring(url.lastIndexOf('/') + 1) || 'url_import',
        sourceType: 'url',
        sourceLocation: url,
        scanDuration: Date.now() - startTime,
        status: 'failed',
        description: `Failed to import: ${error.message}`
      });
      await failedScan.save();
    } catch (dbErr) {
      console.error('Failed to log failed scan to DB:', dbErr);
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'An error occurred during URL import'
    });
  }
};

// @desc    Get all scans belonging to the logged-in user
// @route   GET /api/scans
// @access  Private
const getScans = async (req, res, next) => {
  try {
    const scans = await Scan.find({ userId: req.user.id })
      .select('-rawSpec -endpoints') // Exclude heavy payloads for list views
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
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
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan report not found' });
    }

    // Verify ownership
    if (scan.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this scan report' });
    }

    res.status(200).json({
      success: true,
      data: scan
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid scan ID format' });
    }
    next(error);
  }
};

// @desc    Delete a scan
// @route   DELETE /api/scans/:id
// @access  Private
const deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan report not found' });
    }

    // Verify ownership
    if (scan.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this scan report' });
    }

    await Scan.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Scan report deleted successfully'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid scan ID format' });
    }
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
